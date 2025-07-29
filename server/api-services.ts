import axios from 'axios';
import Sentiment from 'sentiment';
import { teslaStorage } from './tesla-storage';
import type {
  InsertStockPrice,
  InsertTechnicalIndicator,
  InsertFundamentalData,
  InsiderTrade,
  InsertTweetSentiment,
  InsertNewsArticle,
  InsertMarketAnomaly,
  InsertApiLog
} from '../shared/tesla-schema';

const sentiment = new Sentiment();

export class ApiService {
  private static async logApiCall(provider: string, endpoint: string, success: boolean, responseTime?: number, errorMessage?: string) {
    const logData: InsertApiLog = {
      provider,
      endpoint,
      success,
      responseTime,
      errorMessage,
      rateLimited: errorMessage?.includes('rate limit') || false,
    };
    await teslaStorage.insertApiLog(logData);
  }

  // Alpha Vantage API for stock data and technical indicators
  static async fetchStockData(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // For development/demo, use mock data since we don't have API keys yet
      // In production, this would use Alpha Vantage API
      const mockStockData: InsertStockPrice = {
        symbol: 'TSLA',
        price: '268.20',
        change: '6.15',
        changePercent: '2.35',
        volume: 45678923,
      };

      await teslaStorage.insertStockPrice(mockStockData);

      const mockTechnicalData: InsertTechnicalIndicator = {
        symbol: 'TSLA',
        rsi: '64.23',
        macd: '2.45',
        macdSignal: '1.87',
        sma20: '265.80',
        sma50: '258.40',
        ema12: '267.30',
        ema26: '263.90',
      };

      await teslaStorage.insertTechnicalIndicator(mockTechnicalData);

      await this.logApiCall('alpha_vantage', 'TIME_SERIES_INTRADAY', true, Date.now() - startTime);
    } catch (error) {
      await this.logApiCall('alpha_vantage', 'TIME_SERIES_INTRADAY', false, Date.now() - startTime, (error as Error).message);
      console.error('Alpha Vantage API error:', error);
    }
  }

  // Finnhub API for fundamental data and insider trading
  static async fetchFundamentalData(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Mock fundamental data for development
      const mockFundamentalData: InsertFundamentalData = {
        symbol: 'TSLA',
        peRatio: '65.42',
        marketCap: '853400000000', // $853.4B
        beta: '2.34',
        eps: '4.10',
        revenue: '96773000000', // $96.77B
        earningsDate: new Date('2024-01-24'),
      };

      await teslaStorage.insertFundamentalData(mockFundamentalData);
      await this.logApiCall('finnhub', 'company-basic-financials', true, Date.now() - startTime);
    } catch (error) {
      await this.logApiCall('finnhub', 'company-basic-financials', false, Date.now() - startTime, (error as Error).message);
      console.error('Finnhub API error:', error);
    }
  }

  static async fetchInsiderTrades(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Mock insider trading data
      const mockInsiderTrades = [
        {
          symbol: 'TSLA',
          insiderName: 'Elon Musk',
          transactionType: 'buy' as const,
          shares: 25000,
          price: '265.50',
          transactionDate: new Date('2024-01-20'),
          filingDate: new Date('2024-01-22'),
        },
        {
          symbol: 'TSLA',
          insiderName: 'Robyn Denholm',
          transactionType: 'sell' as const,
          shares: 10000,
          price: '272.80',
          transactionDate: new Date('2024-01-18'),
          filingDate: new Date('2024-01-20'),
        },
        {
          symbol: 'TSLA',
          insiderName: 'Drew Baglino',
          transactionType: 'buy' as const,
          shares: 5000,
          price: '260.20',
          transactionDate: new Date('2024-01-15'),
          filingDate: new Date('2024-01-17'),
        }
      ];

      for (const trade of mockInsiderTrades) {
        await teslaStorage.insertInsiderTrade(trade);
      }

      await this.logApiCall('finnhub', 'insider-transactions', true, Date.now() - startTime);
    } catch (error) {
      await this.logApiCall('finnhub', 'insider-transactions', false, Date.now() - startTime, (error as Error).message);
      console.error('Finnhub insider trades error:', error);
    }
  }

  // Twitter API for Elon Musk's tweets
  static async fetchElonTweets(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Mock tweet data with sentiment analysis
      const mockTweets = [
        {
          tweetId: '1750123456789',
          tweetText: 'Full self-driving capability will be available next week for all Tesla owners! The future is autonomous.',
          tweetDate: new Date('2024-01-25T10:30:00Z'),
        },
        {
          tweetId: '1750123456790',
          tweetText: 'Tesla Gigafactory Berlin is producing cars at record pace. Efficiency through innovation!',
          tweetDate: new Date('2024-01-24T14:15:00Z'),
        },
        {
          tweetId: '1750123456791',
          tweetText: 'Working on something special for Tesla owners. Can\'t wait to share more details soon.',
          tweetDate: new Date('2024-01-23T09:45:00Z'),
        }
      ];

      for (const tweet of mockTweets) {
        const sentimentResult = sentiment.analyze(tweet.tweetText);
        const sentimentScore = sentimentResult.score / Math.max(1, Math.abs(sentimentResult.score)) * (sentimentResult.score > 0 ? 1 : -1);
        
        let sentimentLabel: 'positive' | 'negative' | 'neutral';
        if (sentimentScore > 0.1) sentimentLabel = 'positive';
        else if (sentimentScore < -0.1) sentimentLabel = 'negative';
        else sentimentLabel = 'neutral';

        // Calculate impact score based on sentiment and keywords
        let impactScore = Math.abs(sentimentScore) * 5;
        if (tweet.tweetText.toLowerCase().includes('tesla')) impactScore += 2;
        if (tweet.tweetText.toLowerCase().includes('fsd') || tweet.tweetText.toLowerCase().includes('self-driving')) impactScore += 3;
        if (tweet.tweetText.toLowerCase().includes('gigafactory')) impactScore += 2;
        impactScore = Math.min(10, impactScore);

        const tweetSentimentData: InsertTweetSentiment = {
          tweetId: tweet.tweetId,
          tweetText: tweet.tweetText,
          sentimentScore: sentimentScore.toFixed(3),
          sentimentLabel,
          impactScore: impactScore.toFixed(2),
          tweetDate: tweet.tweetDate,
        };

        await teslaStorage.insertTweetSentiment(tweetSentimentData);
      }

      await this.logApiCall('twitter', 'user-tweets', true, Date.now() - startTime);
    } catch (error) {
      await this.logApiCall('twitter', 'user-tweets', false, Date.now() - startTime, (error as Error).message);
      console.error('Twitter API error:', error);
    }
  }

  // News API for Tesla-related headlines
  static async fetchTeslaNews(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Mock news data
      const mockNews = [
        {
          headline: 'Tesla partners with India government on nationwide EV charging infrastructure',
          content: 'Tesla announced a major partnership with the Indian government to build nationwide electric vehicle charging infrastructure, marking a significant expansion into the world\'s largest democracy.',
          source: 'CNBC',
          url: 'https://cnbc.com/tesla-india-partnership',
          publishedAt: new Date('2024-01-25T08:00:00Z'),
        },
        {
          headline: 'Tesla reports record Q4 deliveries, beating analyst expectations',
          content: 'Tesla delivered 484,507 vehicles in Q4 2023, surpassing Wall Street estimates and marking a strong end to the year for the electric vehicle manufacturer.',
          source: 'Bloomberg',
          url: 'https://bloomberg.com/tesla-q4-deliveries',
          publishedAt: new Date('2024-01-24T16:30:00Z'),
        },
        {
          headline: 'Analysis: Tesla\'s FSD technology could revolutionize ride-sharing industry',
          content: 'Industry experts analyze how Tesla\'s Full Self-Driving technology could disrupt traditional ride-sharing companies once fully deployed.',
          source: 'Reuters',
          url: 'https://reuters.com/tesla-fsd-analysis',
          publishedAt: new Date('2024-01-23T11:20:00Z'),
        }
      ];

      for (const article of mockNews) {
        const sentimentResult = sentiment.analyze(article.headline + ' ' + (article.content || ''));
        const sentimentScore = sentimentResult.score / Math.max(1, Math.abs(sentimentResult.score)) * (sentimentResult.score > 0 ? 1 : -1);
        
        // Calculate relevance score based on Tesla keywords
        let relevanceScore = 5; // Base relevance
        const text = (article.headline + ' ' + (article.content || '')).toLowerCase();
        if (text.includes('tesla')) relevanceScore += 2;
        if (text.includes('elon musk')) relevanceScore += 1;
        if (text.includes('ev') || text.includes('electric vehicle')) relevanceScore += 1;
        if (text.includes('delivery') || text.includes('revenue') || text.includes('earnings')) relevanceScore += 1;
        relevanceScore = Math.min(10, relevanceScore);

        const newsData: InsertNewsArticle = {
          headline: article.headline,
          content: article.content,
          source: article.source,
          url: article.url,
          sentimentScore: sentimentScore.toFixed(3),
          relevanceScore: relevanceScore.toFixed(1),
          publishedAt: article.publishedAt,
        };

        await teslaStorage.insertNewsArticle(newsData);
      }

      await this.logApiCall('news_api', 'everything', true, Date.now() - startTime);
    } catch (error) {
      await this.logApiCall('news_api', 'everything', false, Date.now() - startTime, (error as Error).message);
      console.error('News API error:', error);
    }
  }

  // AI Prediction Engine (simplified for demo)
  static async generateAiPrediction(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const currentPrice = await teslaStorage.getLatestStockPrice();
      const technicalIndicators = await teslaStorage.getLatestTechnicalIndicators();
      const recentTweets = await teslaStorage.getRecentTweets(24);
      const recentNews = await teslaStorage.getRecentNews(24);

      if (!currentPrice || !technicalIndicators) {
        throw new Error('Missing required data for prediction');
      }

      // Simplified AI prediction algorithm
      let score = 50; // Neutral baseline
      const currentPriceNum = parseFloat(currentPrice.price);
      
      // Technical analysis factors
      if (technicalIndicators.rsi) {
        const rsi = parseFloat(technicalIndicators.rsi);
        if (rsi > 70) score -= 10; // Overbought
        else if (rsi < 30) score += 15; // Oversold
        else if (rsi > 50) score += 5; // Bullish momentum
      }

      if (technicalIndicators.macd && technicalIndicators.macdSignal) {
        const macd = parseFloat(technicalIndicators.macd);
        const signal = parseFloat(technicalIndicators.macdSignal);
        if (macd > signal) score += 8; // Bullish crossover
        else score -= 5;
      }

      // Price momentum
      const changePercent = parseFloat(currentPrice.changePercent);
      score += changePercent * 2; // Recent momentum

      // Sentiment factors
      let avgTweetSentiment = 0;
      if (recentTweets.length > 0) {
        avgTweetSentiment = recentTweets.reduce((sum, tweet) => sum + parseFloat(tweet.sentimentScore), 0) / recentTweets.length;
        score += avgTweetSentiment * 10;
      }

      let avgNewsSentiment = 0;
      if (recentNews.length > 0) {
        const newsWithSentiment = recentNews.filter(news => news.sentimentScore);
        if (newsWithSentiment.length > 0) {
          avgNewsSentiment = newsWithSentiment.reduce((sum, news) => sum + parseFloat(news.sentimentScore!), 0) / newsWithSentiment.length;
          score += avgNewsSentiment * 8;
        }
      }

      // Clamp score between 0-100
      score = Math.max(0, Math.min(100, score));

      // Generate prediction
      const volatilityFactor = 0.02 + Math.abs(avgTweetSentiment) * 0.01; // 2-3% base volatility
      const trendFactor = (score - 50) / 100; // -0.5 to +0.5
      const randomFactor = (Math.random() - 0.5) * 0.02; // +/- 1% randomness
      
      const predictedChange = trendFactor * 0.1 + randomFactor; // Max 10% change + randomness
      const predictedPrice = currentPriceNum * (1 + predictedChange);

      // Determine recommendation
      let recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
      if (score >= 80) recommendation = 'strong_buy';
      else if (score >= 60) recommendation = 'buy';
      else if (score >= 40) recommendation = 'hold';
      else if (score >= 20) recommendation = 'sell';
      else recommendation = 'strong_sell';

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high';
      if (volatilityFactor < 0.025) riskLevel = 'low';
      else if (volatilityFactor < 0.035) riskLevel = 'medium';
      else riskLevel = 'high';

      // Generate reasoning
      const reasons = [];
      if (technicalIndicators.rsi) {
        const rsi = parseFloat(technicalIndicators.rsi);
        if (rsi > 70) reasons.push('RSI indicates overbought conditions');
        else if (rsi < 30) reasons.push('RSI shows oversold opportunity');
        else if (rsi > 50) reasons.push('RSI shows bullish momentum');
      }
      
      if (avgTweetSentiment > 0.2) reasons.push('Positive Elon Musk tweet sentiment');
      else if (avgTweetSentiment < -0.2) reasons.push('Negative tweet sentiment concern');
      
      if (avgNewsSentiment > 0.2) reasons.push('Positive news coverage');
      else if (avgNewsSentiment < -0.2) reasons.push('Negative news sentiment');

      if (changePercent > 2) reasons.push('Strong recent price momentum');
      else if (changePercent < -2) reasons.push('Recent price decline');

      const predictionData = {
        symbol: 'TSLA',
        currentPrice: currentPrice.price,
        predictedPrice: predictedPrice.toFixed(2),
        predictionDays: 5,
        confidence: Math.max(60, Math.min(95, 70 + Math.abs(score - 50))).toFixed(0),
        aiRating: Math.round(score),
        recommendation,
        riskLevel,
        reasoning: reasons.length > 0 ? reasons.join('. ') : 'Based on technical and sentiment analysis',
        modelUsed: 'ensemble',
      };

      await teslaStorage.insertAiPrediction(predictionData);
      await this.logApiCall('ai_engine', 'generate_prediction', true, Date.now() - startTime);
    } catch (error) {
      await this.logApiCall('ai_engine', 'generate_prediction', false, Date.now() - startTime, (error as Error).message);
      console.error('AI Prediction error:', error);
    }
  }

  // Anomaly detection
  static async detectMarketAnomalies(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const recentPrices = await teslaStorage.getStockPriceHistory(24);
      
      if (recentPrices.length < 2) return;

      const latestPrice = recentPrices[0];
      const volumes = recentPrices.map(p => p.volume);
      const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
      
      // Volume spike detection
      if (latestPrice.volume > avgVolume * 2) {
        const anomaly: InsertMarketAnomaly = {
          symbol: 'TSLA',
          anomalyType: 'volume_spike',
          severity: latestPrice.volume > avgVolume * 3 ? 'high' : 'medium',
          description: `Unusual volume spike: ${latestPrice.volume.toLocaleString()} vs avg ${avgVolume.toLocaleString()}`,
          detectedValue: latestPrice.volume.toString(),
          normalRange: { min: avgVolume * 0.5, max: avgVolume * 1.5 },
        };
        await teslaStorage.insertMarketAnomaly(anomaly);
      }

      // Price gap detection
      if (recentPrices.length >= 2) {
        const priceChange = Math.abs(parseFloat(latestPrice.price) - parseFloat(recentPrices[1].price));
        const avgPrice = parseFloat(latestPrice.price);
        const changePercent = (priceChange / avgPrice) * 100;
        
        if (changePercent > 5) {
          const anomaly: InsertMarketAnomaly = {
            symbol: 'TSLA',
            anomalyType: 'price_gap',
            severity: changePercent > 10 ? 'critical' : 'high',
            description: `Large price movement: ${changePercent.toFixed(1)}% change detected`,
            detectedValue: changePercent.toFixed(2),
            normalRange: { min: -3, max: 3 },
          };
          await teslaStorage.insertMarketAnomaly(anomaly);
        }
      }

      await this.logApiCall('anomaly_detector', 'market_analysis', true, Date.now() - startTime);
    } catch (error) {
      await this.logApiCall('anomaly_detector', 'market_analysis', false, Date.now() - startTime, (error as Error).message);
      console.error('Anomaly detection error:', error);
    }
  }

  // Main data refresh function
  static async refreshAllData(): Promise<void> {
    console.log('🔄 Starting Tesla data refresh...');
    
    try {
      await Promise.all([
        this.fetchStockData(),
        this.fetchFundamentalData(),
        this.fetchInsiderTrades(),
        this.fetchElonTweets(),
        this.fetchTeslaNews(),
      ]);

      // Generate prediction after data is updated
      await this.generateAiPrediction();
      await this.detectMarketAnomalies();

      console.log('✅ Tesla data refresh completed successfully');
    } catch (error) {
      console.error('❌ Error during data refresh:', error);
    }
  }
}