import axios from 'axios';
import { teslaStorage } from './tesla-storage';
import * as sentiment from 'sentiment';

interface MarketCloseAnalysis {
  currentPrice: number;
  predictedClosePrice: number;
  confidence: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string[];
  dataQuality: number; // 0-100, how much data we have
  stabilityScore: number; // How stable this prediction is
  lastUpdated: Date;
  marketHours: {
    isOpen: boolean;
    nextOpen: Date;
    nextClose: Date;
  };
}

export class MarketClosePredictor {
  private readonly SENTIMENT_ANALYZER = sentiment;
  private analysisCache: MarketCloseAnalysis | null = null;
  private lastMajorUpdate: Date = new Date(0);
  
  /**
   * Professional market close prediction system
   * Analyzes data continuously and provides stable predictions
   */
  async generateMarketClosePrediction(): Promise<MarketCloseAnalysis> {
    console.log('🎯 Analyzing market data for close prediction...');
    
    // Check if we need a fresh analysis (every 30 minutes during market hours, hourly after)
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - this.lastMajorUpdate.getTime();
    const isMarketOpen = this.isMarketOpen();
    const updateInterval = isMarketOpen ? 30 * 60 * 1000 : 60 * 60 * 1000; // 30min or 1hour
    
    if (this.analysisCache && timeSinceLastUpdate < updateInterval) {
      console.log('📊 Using cached stable prediction (avoiding frequent changes)');
      return this.analysisCache;
    }

    try {
      // Gather comprehensive data
      const [currentPrice, technicals, fundamentals, recentNews, priceHistory] = await Promise.all([
        teslaStorage.getLatestStockPrice(),
        teslaStorage.getLatestTechnicalIndicators(),
        teslaStorage.getLatestFundamentalData(),
        teslaStorage.getRecentNews(24), // Last 24 hours
        teslaStorage.getStockPriceHistory(48) // Last 48 hours for trend analysis
      ]);

      if (!currentPrice) {
        throw new Error('No current price data available');
      }

      const price = parseFloat(currentPrice.price);
      const analysis = await this.performComprehensiveAnalysis(
        price, 
        technicals, 
        fundamentals, 
        recentNews, 
        priceHistory
      );

      // Calculate market hours
      const marketHours = this.getMarketHours();
      
      const prediction: MarketCloseAnalysis = {
        currentPrice: price,
        predictedClosePrice: analysis.predictedPrice,
        confidence: analysis.confidence,
        recommendation: analysis.recommendation,
        reasoning: analysis.reasoning,
        dataQuality: analysis.dataQuality,
        stabilityScore: analysis.stabilityScore,
        lastUpdated: now,
        marketHours
      };

      // Only update cache if confidence is high enough (above 60%)
      if (analysis.confidence >= 60) {
        this.analysisCache = prediction;
        this.lastMajorUpdate = now;
        console.log(`🎯 New stable prediction: $${analysis.predictedPrice.toFixed(2)} (${analysis.confidence.toFixed(1)}% confidence)`);
      }

      // Store prediction in database
      await teslaStorage.insertAiPrediction({
        symbol: 'AMD',
        currentPrice: price.toString(),
        predictedPrice: analysis.predictedPrice.toString(),
        confidence: analysis.confidence.toString(),
        aiRating: Math.round(analysis.confidence),
        recommendation: analysis.recommendation.toLowerCase(),
        riskLevel: this.calculateRiskLevel(analysis.confidence),
        reasoning: analysis.reasoning.join('. '),
        modelUsed: 'market_close_predictor_v2'
      });

      return prediction;

    } catch (error) {
      console.error('Market close prediction error:', error);
      
      // Return cached prediction if available
      if (this.analysisCache) {
        return this.analysisCache;
      }
      
      throw error;
    }
  }

  private async performComprehensiveAnalysis(
    currentPrice: number, 
    technicals: any, 
    fundamentals: any, 
    news: any[], 
    priceHistory: any[]
  ) {
    let score = 50; // Start neutral
    let confidence = 70; // Base confidence
    let dataQuality = 0;
    const reasoning: string[] = [];

    // 1. Technical Analysis (40% weight)
    if (technicals) {
      dataQuality += 25;
      
      const rsi = parseFloat(technicals.rsi || '50');
      const macd = parseFloat(technicals.macd || '0');
      const sma20 = parseFloat(technicals.sma20 || currentPrice.toString());
      const sma50 = parseFloat(technicals.sma50 || currentPrice.toString());

      // RSI Analysis
      if (rsi > 70) {
        score -= 8;
        reasoning.push(`Overbought conditions (RSI: ${rsi.toFixed(1)})`);
      } else if (rsi < 30) {
        score += 8;
        reasoning.push(`Oversold conditions favor bounce (RSI: ${rsi.toFixed(1)})`);
      } else if (rsi >= 45 && rsi <= 65) {
        score += 3;
        reasoning.push(`Healthy RSI momentum (${rsi.toFixed(1)})`);
      }

      // Moving Average Analysis
      if (currentPrice > sma20 && currentPrice > sma50) {
        score += 6;
        reasoning.push(`Price above key moving averages (bullish trend)`);
      } else if (currentPrice < sma20 && currentPrice < sma50) {
        score -= 6;
        reasoning.push(`Price below moving averages (bearish pressure)`);
      }

      // MACD Analysis
      if (macd > 0) {
        score += 4;
        reasoning.push(`MACD above signal line (upward momentum)`);
      } else {
        score -= 3;
        reasoning.push(`MACD below signal line (downward pressure)`);
      }
    }

    // 2. Price Momentum Analysis (25% weight)
    if (priceHistory && priceHistory.length >= 10) {
      dataQuality += 20;
      
      const recent5 = priceHistory.slice(-5).map(p => parseFloat(p.price));
      const previous5 = priceHistory.slice(-10, -5).map(p => parseFloat(p.price));
      
      const recentAvg = recent5.reduce((a, b) => a + b, 0) / recent5.length;
      const previousAvg = previous5.reduce((a, b) => a + b, 0) / previous5.length;
      
      const momentum = ((recentAvg - previousAvg) / previousAvg) * 100;
      
      if (momentum > 1.5) {
        score += 7;
        reasoning.push(`Strong upward momentum (+${momentum.toFixed(2)}%)`);
      } else if (momentum < -1.5) {
        score -= 7;
        reasoning.push(`Downward momentum (${momentum.toFixed(2)}%)`);
      } else {
        score += 2;
        reasoning.push(`Stable price action (${momentum.toFixed(2)}% change)`);
      }

      // Volume analysis
      const recentVolumes = priceHistory.slice(-5).map(p => p.volume || 0);
      const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
      
      if (avgVolume > 50000000) { // High volume
        confidence += 5;
        reasoning.push(`High volume confirms price movement`);
      }
    }

    // 3. News Sentiment Analysis (20% weight)
    if (news && news.length > 0) {
      dataQuality += 25;
      
      let totalSentiment = 0;
      let validNews = 0;
      
      for (const article of news) {
        if (article.sentimentScore) {
          totalSentiment += parseFloat(article.sentimentScore);
          validNews++;
        }
      }
      
      if (validNews > 0) {
        const avgSentiment = totalSentiment / validNews;
        
        if (avgSentiment > 0.3) {
          score += 6;
          reasoning.push(`Positive news sentiment (${validNews} articles)`);
        } else if (avgSentiment < -0.3) {
          score -= 6;
          reasoning.push(`Negative news sentiment (${validNews} articles)`);
        } else {
          score += 1;
          reasoning.push(`Neutral news sentiment (${validNews} articles)`);
        }
        
        confidence += Math.min(10, validNews * 2); // More news = more confidence
      }
    }

    // 4. Market Structure Analysis (15% weight)
    const marketHours = this.getMarketHours();
    const timeToClose = marketHours.nextClose.getTime() - new Date().getTime();
    const hoursToClose = timeToClose / (1000 * 60 * 60);
    
    if (hoursToClose < 2 && marketHours.isOpen) {
      // Close to market close - more conservative
      score = score * 0.95;
      reasoning.push(`Near market close - conservative outlook`);
    } else if (!marketHours.isOpen) {
      // After hours - factor in overnight developments
      confidence -= 5;
      reasoning.push(`After-hours analysis - reduced confidence`);
    }

    // Calculate final prediction
    const priceChangePercent = (score - 50) * 0.8; // Convert score to price change %
    let predictedPrice = currentPrice * (1 + priceChangePercent / 100);
    
    // Add semiconductor industry factors
    predictedPrice = this.applySemiconductorFactors(predictedPrice, currentPrice, reasoning);
    
    // Determine recommendation
    const expectedReturn = ((predictedPrice - currentPrice) / currentPrice) * 100;
    let recommendation: 'BUY' | 'SELL' | 'HOLD';
    
    if (expectedReturn > 1.5 && confidence > 70) {
      recommendation = 'BUY';
    } else if (expectedReturn < -1.5 && confidence > 70) {
      recommendation = 'SELL';
    } else {
      recommendation = 'HOLD';
    }

    // Calculate stability score
    const stabilityScore = Math.min(100, confidence + dataQuality * 0.3);

    return {
      predictedPrice,
      confidence: Math.min(95, confidence), // Cap at 95%
      recommendation,
      reasoning,
      dataQuality: Math.min(100, dataQuality),
      stabilityScore
    };
  }

  private applySemiconductorFactors(predictedPrice: number, currentPrice: number, reasoning: string[]): number {
    // Add AMD-specific semiconductor industry knowledge
    const dayOfWeek = new Date().getDay();
    
    // Semiconductor stocks tend to be stronger on certain days
    if (dayOfWeek === 1 || dayOfWeek === 2) { // Monday/Tuesday
      reasoning.push(`Semiconductor sector typically stronger early week`);
      return predictedPrice * 1.002;
    }
    
    // Factor in quarterly patterns
    const month = new Date().getMonth();
    if ([2, 5, 8, 11].includes(month)) { // Earnings season months
      reasoning.push(`Earnings season - increased volatility expected`);
      return predictedPrice * 0.998;
    }
    
    return predictedPrice;
  }

  private isMarketOpen(): boolean {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const et = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const etHour = et.getHours();
    
    // Monday-Friday, 9:30 AM - 4:00 PM ET
    return day >= 1 && day <= 5 && etHour >= 9.5 && etHour < 16;
  }

  private getMarketHours() {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    // Calculate next market open/close
    let nextOpen = new Date(et);
    let nextClose = new Date(et);
    
    // Set to next market open (9:30 AM ET)
    nextOpen.setHours(9, 30, 0, 0);
    if (et.getHours() >= 16 || et.getDay() === 0 || et.getDay() === 6) {
      // After market close or weekend
      if (et.getDay() === 5 && et.getHours() >= 16) {
        nextOpen.setDate(nextOpen.getDate() + 3); // Friday after close -> Monday
      } else if (et.getDay() === 6) {
        nextOpen.setDate(nextOpen.getDate() + 2); // Saturday -> Monday
      } else if (et.getDay() === 0) {
        nextOpen.setDate(nextOpen.getDate() + 1); // Sunday -> Monday
      } else {
        nextOpen.setDate(nextOpen.getDate() + 1); // Next day
      }
    }
    
    // Set to next market close (4:00 PM ET)
    nextClose.setHours(16, 0, 0, 0);
    if (et.getHours() >= 16 || et.getDay() === 0 || et.getDay() === 6) {
      // Same logic as above
      if (et.getDay() === 5 && et.getHours() >= 16) {
        nextClose.setDate(nextClose.getDate() + 3);
      } else if (et.getDay() === 6) {
        nextClose.setDate(nextClose.getDate() + 2);
      } else if (et.getDay() === 0) {
        nextClose.setDate(nextClose.getDate() + 1);
      } else {
        nextClose.setDate(nextClose.getDate() + 1);
      }
    }
    
    return {
      isOpen: this.isMarketOpen(),
      nextOpen,
      nextClose
    };
  }

  private calculateRiskLevel(confidence: number): string {
    if (confidence >= 80) return 'low';
    if (confidence >= 65) return 'medium';
    return 'high';
  }
}