/**
 * Enhanced AI Prediction System - Generates ACTIONABLE trading signals with tight price ranges
 * Focuses on directional bias instead of wide uncertainty ranges
 */
import { teslaStorage } from './tesla-storage';

interface TightPrediction {
  symbol: string;
  currentPrice: string;
  predictedPrice: string;
  priceRangeLow: string;
  priceRangeHigh: string;
  predictionDays: number;
  confidence: string;
  aiRating: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
  primarySignal: 'bullish' | 'bearish' | 'neutral';
  rangeWidth: number;
  directionBias: number; // -1 to +1 (-1=strong bearish, +1=strong bullish)
  modelUsed: string;
}

export class AdvancedAiPredictor {
  
  /**
   * Generate tight, actionable prediction with clear directional bias
   * Maximum range: $2.50, Minimum range: $1.00
   */
  static async generateTightPrediction(): Promise<TightPrediction | null> {
    try {
      const [currentPrice, technicalIndicators, recentNews, priceHistory] = await Promise.all([
        teslaStorage.getLatestStockPrice(),
        teslaStorage.getLatestTechnicalIndicators(),
        teslaStorage.getRecentNews(12), // Last 12 hours
        teslaStorage.getStockPriceHistory(24)
      ]);

      if (!currentPrice) {
        console.log('⚠️ No price data available for tight prediction');
        return null;
      }

      const currentPriceNum = parseFloat(currentPrice.price);
      console.log(`🎯 Generating TIGHT prediction for AMD at $${currentPriceNum}`);

      // STEP 1: Analyze DIRECTIONAL SIGNALS (no neutral scoring)
      let bullishScore = 0;
      let bearishScore = 0;
      const signals: string[] = [];

      // Technical Analysis - Clear directional signals only
      if (technicalIndicators?.rsi) {
        const rsi = parseFloat(technicalIndicators.rsi);
        if (rsi > 75) {
          bearishScore += 25; // Strong sell signal
          signals.push(`Overbought RSI (${rsi.toFixed(1)}) - selling pressure expected`);
        } else if (rsi > 65) {
          bearishScore += 10; // Mild sell pressure
          signals.push(`High RSI (${rsi.toFixed(1)}) - caution on upside`);
        } else if (rsi < 25) {
          bullishScore += 25; // Strong buy signal
          signals.push(`Oversold RSI (${rsi.toFixed(1)}) - bounce expected`);
        } else if (rsi < 35) {
          bullishScore += 10; // Mild buy signal
          signals.push(`Low RSI (${rsi.toFixed(1)}) - upside potential`);
        }
      }

      // Price momentum analysis
      if (priceHistory && priceHistory.length >= 3) {
        const recent3Prices = priceHistory.slice(0, 3).map(p => parseFloat(p.price));
        const momentum = (recent3Prices[0] - recent3Prices[2]) / recent3Prices[2] * 100;
        
        if (momentum > 1.5) {
          bullishScore += 15;
          signals.push(`Strong upward momentum (+${momentum.toFixed(1)}%)`);
        } else if (momentum < -1.5) {
          bearishScore += 15;
          signals.push(`Strong downward momentum (${momentum.toFixed(1)}%)`);
        }
      }

      // News sentiment analysis
      if (recentNews && recentNews.length > 0) {
        const avgSentiment = recentNews.reduce((sum, news) => sum + parseFloat(news.sentimentScore), 0) / recentNews.length;
        if (avgSentiment > 0.3) {
          bullishScore += 10;
          signals.push(`Positive news sentiment (${avgSentiment.toFixed(2)})`);
        } else if (avgSentiment < -0.3) {
          bearishScore += 10;
          signals.push(`Negative news sentiment (${avgSentiment.toFixed(2)})`);
        }
      }

      // STEP 2: Determine PRIMARY DIRECTION
      const netSignal = bullishScore - bearishScore;
      let primarySignal: 'bullish' | 'bearish' | 'neutral';
      let directionBias: number;
      let recommendation: TightPrediction['recommendation'];
      let rangePosition: number; // Where to position the range relative to current price

      if (netSignal >= 20) {
        primarySignal = 'bullish';
        directionBias = Math.min(1, netSignal / 30);
        recommendation = netSignal >= 35 ? 'strong_buy' : 'buy';
        rangePosition = 0.012; // Position range 1.2% ABOVE current price
        signals.push('🔼 BULLISH BIAS: Range positioned above current price');
      } else if (netSignal <= -20) {
        primarySignal = 'bearish';
        directionBias = Math.max(-1, netSignal / 30);
        recommendation = netSignal <= -35 ? 'strong_sell' : 'sell';
        rangePosition = -0.012; // Position range 1.2% BELOW current price
        signals.push('🔽 BEARISH BIAS: Range positioned below current price');
      } else {
        primarySignal = 'neutral';
        directionBias = 0;
        recommendation = 'hold';
        rangePosition = 0; // Range centered on current price
        signals.push('➡️ NEUTRAL: Range centered on current price');
      }

      // STEP 3: Calculate TIGHT RANGE with directional bias
      const rangeCenter = currentPriceNum * (1 + rangePosition);
      
      // Dynamic range width based on signal strength
      let rangeWidth: number;
      if (Math.abs(netSignal) >= 35) {
        rangeWidth = 1.25; // Very strong signal = very tight range
      } else if (Math.abs(netSignal) >= 20) {
        rangeWidth = 1.75; // Strong signal = tight range
      } else {
        rangeWidth = 2.25; // Weak/neutral = slightly wider range
      }

      const priceLow = Math.max(0, rangeCenter - rangeWidth / 2);
      const priceHigh = rangeCenter + rangeWidth / 2;

      // STEP 4: Set confidence and risk
      const signalStrength = Math.abs(netSignal);
      const confidence = Math.max(70, Math.min(92, 75 + signalStrength * 0.5));
      
      let riskLevel: TightPrediction['riskLevel'];
      if (signalStrength >= 30) riskLevel = 'low';
      else if (signalStrength >= 15) riskLevel = 'medium';
      else riskLevel = 'high';

      const prediction: TightPrediction = {
        symbol: 'AMD',
        currentPrice: currentPrice.price,
        predictedPrice: `${priceLow.toFixed(2)}-${priceHigh.toFixed(2)}`,
        priceRangeLow: priceLow.toFixed(2),
        priceRangeHigh: priceHigh.toFixed(2),
        predictionDays: 1,
        confidence: confidence.toFixed(0),
        aiRating: Math.round(confidence),
        recommendation,
        riskLevel,
        reasoning: `${primarySignal.toUpperCase()} signal detected. ${signals.join('. ')}. Range width: $${rangeWidth.toFixed(2)} for actionable trading.`,
        primarySignal,
        rangeWidth,
        directionBias,
        modelUsed: 'tight-directional-v1'
      };

      console.log(`🎯 TIGHT Prediction: ${recommendation.toUpperCase()} | Range: $${priceLow.toFixed(2)}-$${priceHigh.toFixed(2)} (${rangeWidth.toFixed(2)} width) | Bias: ${primarySignal}`);
      
      return prediction;

    } catch (error) {
      console.error('Tight prediction error:', error);
      return null;
    }
  }

  /**
   * Store tight prediction in database
   */
  static async storeTightPrediction(prediction: TightPrediction): Promise<void> {
    try {
      const predictionData = {
        symbol: prediction.symbol,
        currentPrice: prediction.currentPrice,
        predictedPrice: prediction.predictedPrice,
        priceRangeLow: prediction.priceRangeLow,
        priceRangeHigh: prediction.priceRangeHigh,
        predictionDays: prediction.predictionDays,
        confidence: prediction.confidence,
        aiRating: prediction.aiRating,
        recommendation: prediction.recommendation,
        riskLevel: prediction.riskLevel,
        reasoning: prediction.reasoning,
        modelUsed: prediction.modelUsed
      };

      await teslaStorage.insertAiPrediction(predictionData);
      console.log('✅ Tight prediction stored successfully');
    } catch (error) {
      console.error('Failed to store tight prediction:', error);
    }
  }
}