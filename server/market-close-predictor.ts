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
  private static analysisCache: MarketCloseAnalysis | null = null;
  private static lastMajorUpdate: Date = new Date(0);
  private static instanceCount = 0;
  
  /**
   * Professional market close prediction system
   * Analyzes data continuously and provides stable predictions
   */
  async generateMarketClosePrediction(): Promise<MarketCloseAnalysis> {
    MarketClosePredictor.instanceCount++;
    console.log(`🎯 Prediction request #${MarketClosePredictor.instanceCount}`);
    
    // Check if we need a fresh analysis (every 30 minutes during market hours, 2 hours after)
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - MarketClosePredictor.lastMajorUpdate.getTime();
    const isMarketOpen = this.isMarketOpen();
    const updateInterval = isMarketOpen ? 30 * 60 * 1000 : 120 * 60 * 1000; // 30min or 2hours
    
    if (MarketClosePredictor.analysisCache && timeSinceLastUpdate < updateInterval) {
      console.log(`📊 Using stable cached prediction (${Math.floor(timeSinceLastUpdate / 60000)}min old)`);
      // Update the lastUpdated timestamp to current time for display purposes
      return {
        ...MarketClosePredictor.analysisCache,
        lastUpdated: MarketClosePredictor.lastMajorUpdate
      };
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

      // Cache the prediction for stability
      MarketClosePredictor.analysisCache = prediction;
      MarketClosePredictor.lastMajorUpdate = now;
      console.log(`🎯 NEW STABLE PREDICTION: $${analysis.predictedPrice.toFixed(2)} (${analysis.confidence.toFixed(1)}% confidence) - ${analysis.recommendation}`);
      console.log(`⏰ Next update in ${updateInterval / 60000} minutes`);

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
      if (MarketClosePredictor.analysisCache) {
        console.log('📊 Returning cached prediction due to error');
        return MarketClosePredictor.analysisCache;
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
    let score = 0; // Start at 0 to avoid bias
    let confidence = 60; // Base confidence
    let dataQuality = 0;
    const reasoning: string[] = [];
    
    // Track bullish vs bearish signals
    let bullishSignals = 0;
    let bearishSignals = 0;

    // 1. Technical Analysis (40% weight)
    if (technicals) {
      dataQuality += 25;
      
      const rsi = parseFloat(technicals.rsi || '50');
      const macd = parseFloat(technicals.macd || '0');
      const sma20 = parseFloat(technicals.sma20 || currentPrice.toString());
      const sma50 = parseFloat(technicals.sma50 || currentPrice.toString());

      // RSI Analysis - More balanced approach
      if (rsi > 75) {
        score -= 15;
        bearishSignals++;
        reasoning.push(`SEVERELY OVERBOUGHT - High sell pressure likely (RSI: ${rsi.toFixed(1)})`);
      } else if (rsi > 65) {
        score -= 8;
        bearishSignals++;
        reasoning.push(`Overbought conditions - Potential reversal (RSI: ${rsi.toFixed(1)})`);
      } else if (rsi < 25) {
        score += 15;
        bullishSignals++;
        reasoning.push(`SEVERELY OVERSOLD - Strong bounce expected (RSI: ${rsi.toFixed(1)})`);
      } else if (rsi < 35) {
        score += 8;
        bullishSignals++;
        reasoning.push(`Oversold conditions favor upward move (RSI: ${rsi.toFixed(1)})`);
      } else if (rsi >= 45 && rsi <= 55) {
        score += 2;
        reasoning.push(`Neutral RSI - balanced momentum (${rsi.toFixed(1)})`);
      }

      // Moving Average Analysis - More aggressive bearish detection
      const sma20Distance = ((currentPrice - sma20) / sma20) * 100;
      const sma50Distance = ((currentPrice - sma50) / sma50) * 100;
      
      if (currentPrice > sma20 && currentPrice > sma50) {
        if (sma20Distance > 5 && sma50Distance > 5) {
          score += 10;
          bullishSignals++;
          reasoning.push(`Strong bullish trend - well above MAs (+${sma20Distance.toFixed(1)}%)`);
        } else {
          score += 5;
          reasoning.push(`Above moving averages (bullish)`);
        }
      } else if (currentPrice < sma20 && currentPrice < sma50) {
        if (sma20Distance < -5 && sma50Distance < -5) {
          score -= 15;
          bearishSignals++;
          reasoning.push(`STRONG BEARISH TREND - far below MAs (${sma20Distance.toFixed(1)}%)`);
        } else {
          score -= 8;
          bearishSignals++;
          reasoning.push(`Below moving averages - bearish pressure (${sma20Distance.toFixed(1)}%)`);
        }
      } else {
        score -= 2;
        reasoning.push(`Mixed signals from moving averages`);
      }

      // MACD Analysis - Better bearish detection
      if (macd > 1) {
        score += 8;
        bullishSignals++;
        reasoning.push(`Strong MACD bullish signal (${macd.toFixed(3)})`);
      } else if (macd > 0) {
        score += 4;
        reasoning.push(`MACD above signal line (${macd.toFixed(3)})`);
      } else if (macd < -1) {
        score -= 10;
        bearishSignals++;
        reasoning.push(`Strong MACD bearish signal (${macd.toFixed(3)})`);
      } else {
        score -= 5;
        bearishSignals++;
        reasoning.push(`MACD below signal line - downward pressure (${macd.toFixed(3)})`);
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
      
      if (momentum > 3) {
        score += 12;
        bullishSignals++;
        reasoning.push(`VERY STRONG upward momentum (+${momentum.toFixed(2)}%)`);
      } else if (momentum > 1.5) {
        score += 7;
        bullishSignals++;
        reasoning.push(`Strong upward momentum (+${momentum.toFixed(2)}%)`);
      } else if (momentum < -3) {
        score -= 15;
        bearishSignals++;
        reasoning.push(`STRONG DOWNWARD momentum - selling pressure (${momentum.toFixed(2)}%)`);
      } else if (momentum < -1.5) {
        score -= 10;
        bearishSignals++;
        reasoning.push(`Downward momentum - bearish (${momentum.toFixed(2)}%)`);
      } else {
        score += 1;
        reasoning.push(`Neutral momentum (${momentum.toFixed(2)}%)`);
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
        
        if (avgSentiment > 0.5) {
          score += 10;
          bullishSignals++;
          reasoning.push(`VERY POSITIVE news sentiment (${validNews} articles)`);
        } else if (avgSentiment > 0.2) {
          score += 5;
          reasoning.push(`Positive news sentiment (${validNews} articles)`);
        } else if (avgSentiment < -0.5) {
          score -= 12;
          bearishSignals++;
          reasoning.push(`VERY NEGATIVE news sentiment - major concern (${validNews} articles)`);
        } else if (avgSentiment < -0.2) {
          score -= 7;
          bearishSignals++;
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

    // Enhanced scoring system with better balance
    const signalBalance = bullishSignals - bearishSignals;
    score += signalBalance * 3; // Weight signal balance heavily
    
    reasoning.push(`SIGNAL ANALYSIS: ${bullishSignals} bullish vs ${bearishSignals} bearish signals`);
    
    // Convert score to price change percentage (more aggressive range)
    const priceChangePercent = Math.max(-8, Math.min(8, score * 0.15)); // -8% to +8% range
    let predictedPrice = currentPrice * (1 + priceChangePercent / 100);
    
    // Add semiconductor industry factors
    predictedPrice = this.applySemiconductorFactors(predictedPrice, currentPrice, reasoning);
    
    // Better recommendation logic
    const expectedReturn = ((predictedPrice - currentPrice) / currentPrice) * 100;
    let recommendation: 'BUY' | 'SELL' | 'HOLD';
    
    // More aggressive SELL recommendations
    if (expectedReturn > 2 && confidence > 65 && bullishSignals > bearishSignals) {
      recommendation = 'BUY';
    } else if (expectedReturn < -1.5 && confidence > 60 && bearishSignals > bullishSignals) {
      recommendation = 'SELL';
    } else if (expectedReturn < -0.8 && bearishSignals >= bullishSignals + 2) {
      recommendation = 'SELL'; // Aggressive sell when many bearish signals
    } else {
      recommendation = 'HOLD';
    }
    
    // Adjust confidence based on signal clarity
    if (Math.abs(signalBalance) >= 3) {
      confidence += 10; // High confidence when signals are clear
    } else if (signalBalance === 0) {
      confidence -= 10; // Low confidence when mixed signals
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