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

  // Alpha Vantage API for real-time stock data and technical indicators
  static async fetchStockData(): Promise<void> {
    const startTime = Date.now();
    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!API_KEY) {
      console.warn('Alpha Vantage API key not found, skipping real data fetch');
      return;
    }
    
    try {
      // Fetch real-time stock data
      const stockResponse = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TSLA&apikey=${API_KEY}`
      );

      const quote = stockResponse.data['Global Quote'];
      if (quote && quote['05. price']) {
        const stockData: InsertStockPrice = {
          symbol: 'TSLA',
          price: parseFloat(quote['05. price']).toFixed(2),
          change: parseFloat(quote['09. change']).toFixed(2),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')).toFixed(2),
          volume: parseInt(quote['06. volume']),
        };
        await teslaStorage.insertStockPrice(stockData);
      }

      // Fetch technical indicators
      const [rsiResponse, macdResponse, smaResponse, emaResponse] = await Promise.all([
        axios.get(`https://www.alphavantage.co/query?function=RSI&symbol=TSLA&interval=daily&time_period=14&series_type=close&apikey=${API_KEY}`),
        axios.get(`https://www.alphavantage.co/query?function=MACD&symbol=TSLA&interval=daily&series_type=close&apikey=${API_KEY}`),
        axios.get(`https://www.alphavantage.co/query?function=SMA&symbol=TSLA&interval=daily&time_period=20&series_type=close&apikey=${API_KEY}`),
        axios.get(`https://www.alphavantage.co/query?function=EMA&symbol=TSLA&interval=daily&time_period=12&series_type=close&apikey=${API_KEY}`)
      ]);

      const rsiData = rsiResponse.data['Technical Analysis: RSI'];
      const macdData = macdResponse.data['Technical Analysis: MACD'];
      const smaData = smaResponse.data['Technical Analysis: SMA'];
      const emaData = emaResponse.data['Technical Analysis: EMA'];

      if (rsiData && macdData && smaData && emaData) {
        const latestDate = Object.keys(rsiData)[0];
        
        const technicalData: InsertTechnicalIndicator = {
          symbol: 'TSLA',
          rsi: parseFloat(rsiData[latestDate]?.RSI || '0').toFixed(2),
          macd: parseFloat(macdData[latestDate]?.MACD || '0').toFixed(4),
          macdSignal: parseFloat(macdData[latestDate]?.MACD_Signal || '0').toFixed(4),
          sma20: parseFloat(smaData[latestDate]?.SMA || '0').toFixed(2),
          sma50: '0.00', // Would need separate API call
          ema12: parseFloat(emaData[latestDate]?.EMA || '0').toFixed(2),
          ema26: '0.00', // Would need separate API call
        };
        
        await teslaStorage.insertTechnicalIndicator(technicalData);
      }

      await this.logApiCall('alpha_vantage', 'GLOBAL_QUOTE', true, Date.now() - startTime);
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      await this.logApiCall('alpha_vantage', 'GLOBAL_QUOTE', false, Date.now() - startTime, (error as Error).message);
    }
  }

  // Finnhub API for real fundamental data and metrics
  static async fetchFundamentalData(): Promise<void> {
    const startTime = Date.now();
    const API_KEY = process.env.FINNHUB_API_KEY;
    
    if (!API_KEY) {
      console.warn('Finnhub API key not found, skipping real data fetch');
      return;
    }
    
    try {
      const [basicFinancialsResponse, companyProfileResponse] = await Promise.all([
        axios.get(`https://finnhub.io/api/v1/stock/metric?symbol=TSLA&metric=all&token=${API_KEY}`),
        axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=TSLA&token=${API_KEY}`)
      ]);

      const metrics = basicFinancialsResponse.data.metric;
      const profile = companyProfileResponse.data;
      
      if (metrics && profile) {
        const fundamentalData: InsertFundamentalData = {
          symbol: 'TSLA',
          peRatio: parseFloat(metrics.peBasicExclExtraTTM || '0').toFixed(2),
          marketCap: parseFloat(profile.marketCapitalization || '0').toFixed(2),
          beta: parseFloat(metrics.beta || '0').toFixed(3),
          eps: parseFloat(metrics.epsBasicExclExtraIttm || '0').toFixed(2),
          revenue: parseFloat(metrics.revenuePerShareTTM || '0').toFixed(2),
          earningsDate: new Date(), // Would need earnings calendar API
        };

        await teslaStorage.insertFundamentalData(fundamentalData);
      }

      await this.logApiCall('finnhub', 'stock/metric', true, Date.now() - startTime);
    } catch (error) {
      console.error('Finnhub API error:', error);
      await this.logApiCall('finnhub', 'stock/metric', false, Date.now() - startTime, (error as Error).message);
    }
  }

  static async fetchInsiderTrades(): Promise<void> {
    const startTime = Date.now();
    const API_KEY = process.env.FINNHUB_API_KEY;
    
    if (!API_KEY) {
      console.warn('Finnhub API key not found, skipping insider trades fetch');
      return;
    }
    
    try {
      // Get insider trading data from Finnhub
      const insiderResponse = await axios.get(
        `https://finnhub.io/api/v1/stock/insider-transactions?symbol=TSLA&from=2024-01-01&to=2024-12-31&token=${API_KEY}`
      );

      const trades = insiderResponse.data.data || [];
      
      for (const trade of trades.slice(0, 10)) { // Limit to recent 10 trades
        const tradeData = {
          symbol: 'TSLA',
          insiderName: trade.name || 'Unknown',
          transactionType: trade.transactionCode === 'P' ? 'buy' as const : 'sell' as const,
          shares: parseInt(trade.share) || 0,
          price: parseFloat(trade.transactionPrice || '0').toFixed(2),
          transactionDate: new Date(trade.transactionDate),
          filingDate: new Date(trade.filingDate),
        };
        
        await teslaStorage.insertInsiderTrade(tradeData);
      }

      await this.logApiCall('finnhub', 'insider-transactions', true, Date.now() - startTime);
    } catch (error) {
      console.error('Finnhub insider trades error:', error);
      await this.logApiCall('finnhub', 'insider-transactions', false, Date.now() - startTime, (error as Error).message);
    }
  }

  // Twitter API for Elon Musk's tweets with real data
  static async fetchElonTweets(): Promise<void> {
    const startTime = Date.now();
    const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
    
    if (!BEARER_TOKEN) {
      console.warn('Twitter Bearer Token not found, skipping tweets fetch');
      return;
    }
    
    try {
      // Search for Tesla-related tweets from Elon Musk's account
      const tweetsResponse = await axios.get(
        'https://api.twitter.com/2/tweets/search/recent',
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
          params: {
            query: 'from:elonmusk Tesla OR FSD OR Gigafactory OR Cybertruck',
            max_results: 10,
            'tweet.fields': 'created_at,text,public_metrics',
          },
        }
      );

      const tweets = tweetsResponse.data.data || [];
      
      for (const tweet of tweets) {
        const sentimentResult = sentiment.analyze(tweet.text);
        const sentimentScore = sentimentResult.score / Math.max(1, Math.abs(sentimentResult.score)) * (sentimentResult.score > 0 ? 1 : -1);
        
        let sentimentLabel: 'positive' | 'negative' | 'neutral';
        if (sentimentScore > 0.1) sentimentLabel = 'positive';
        else if (sentimentScore < -0.1) sentimentLabel = 'negative';
        else sentimentLabel = 'neutral';

        // Enhanced impact score calculation
        let impactScore = Math.abs(sentimentScore) * 3;
        const tweetLower = tweet.text.toLowerCase();
        
        // Keyword-based impact scoring
        if (tweetLower.includes('tesla')) impactScore += 2;
        if (tweetLower.includes('fsd') || tweetLower.includes('self-driving')) impactScore += 4;
        if (tweetLower.includes('gigafactory')) impactScore += 2;
        if (tweetLower.includes('cybertruck')) impactScore += 3;
        if (tweetLower.includes('earnings') || tweetLower.includes('delivery')) impactScore += 3;
        
        // Engagement-based impact (likes, retweets)
        const likes = tweet.public_metrics?.like_count || 0;
        const retweets = tweet.public_metrics?.retweet_count || 0;
        impactScore += Math.min(3, (likes + retweets) / 10000);
        
        impactScore = Math.min(10, impactScore);

        const tweetSentimentData: InsertTweetSentiment = {
          tweetId: tweet.id,
          tweetText: tweet.text,
          sentimentScore: sentimentScore.toFixed(3),
          sentimentLabel,
          impactScore: impactScore.toFixed(2),
          tweetDate: new Date(tweet.created_at),
        };

        await teslaStorage.insertTweetSentiment(tweetSentimentData);
      }

      await this.logApiCall('twitter', 'user-tweets', true, Date.now() - startTime);
    } catch (error) {
      await this.logApiCall('twitter', 'user-tweets', false, Date.now() - startTime, (error as Error).message);
      console.error('Twitter API error:', error);
    }
  }

  // News API for Tesla-related headlines with real data
  static async fetchTeslaNews(): Promise<void> {
    const startTime = Date.now();
    const API_KEY = process.env.NEWS_API_KEY;
    
    if (!API_KEY) {
      console.warn('News API key not found, skipping news fetch');
      return;
    }
    
    try {
      // Fetch real Tesla news from News API
      const newsResponse = await axios.get(
        `https://newsapi.org/v2/everything?q=Tesla&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`
      );

      const articles = newsResponse.data.articles || [];

      for (const article of articles.slice(0, 15)) { // Limit to 15 recent articles
        const sentimentResult = sentiment.analyze(article.title + ' ' + (article.description || ''));
        const sentimentScore = sentimentResult.score / Math.max(1, Math.abs(sentimentResult.score)) * (sentimentResult.score > 0 ? 1 : -1);
        
        // Enhanced relevance scoring
        let relevanceScore = 3; // Base relevance
        const text = (article.title + ' ' + (article.description || '')).toLowerCase();
        
        // High-impact keywords
        if (text.includes('tesla')) relevanceScore += 3;
        if (text.includes('elon musk')) relevanceScore += 2;
        if (text.includes('tsla') || text.includes('stock')) relevanceScore += 2;
        
        // Medium-impact keywords
        if (text.includes('ev') || text.includes('electric vehicle')) relevanceScore += 1.5;
        if (text.includes('delivery') || text.includes('revenue') || text.includes('earnings')) relevanceScore += 2;
        if (text.includes('fsd') || text.includes('self-driving')) relevanceScore += 1.5;
        if (text.includes('gigafactory') || text.includes('cybertruck')) relevanceScore += 1;
        
        // Market-related keywords
        if (text.includes('forecast') || text.includes('prediction') || text.includes('outlook')) relevanceScore += 1;
        
        relevanceScore = Math.min(10, relevanceScore);

        const newsData: InsertNewsArticle = {
          headline: article.title,
          content: article.description || article.content,
          source: article.source?.name || 'Unknown',
          url: article.url,
          sentimentScore: sentimentScore.toFixed(3),
          relevanceScore: relevanceScore.toFixed(1),
          publishedAt: new Date(article.publishedAt),
        };

        await teslaStorage.insertNewsArticle(newsData);
      }

      await this.logApiCall('news_api', 'everything', true, Date.now() - startTime);
    } catch (error) {
      console.error('News API error:', error);
      await this.logApiCall('news_api', 'everything', false, Date.now() - startTime, (error as Error).message);
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

      // Generate predictions after data is updated
      await this.generateAiPrediction();
      await this.generateAdvancedAiPrediction();
      await this.detectMarketAnomalies();

      console.log('✅ Tesla data refresh completed successfully');
    } catch (error) {
      console.error('❌ Error during data refresh:', error);
    }
  }

  // Advanced OpenAI-powered prediction analysis
  static async generateAdvancedAiPrediction(): Promise<void> {
    const startTime = Date.now();
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, skipping advanced predictions');
      return;
    }
    
    try {
      // Gather comprehensive data
      const [currentPrice, technicalIndicators, recentTweets, recentNews, fundamentalData] = await Promise.all([
        teslaStorage.getLatestStockPrice(),
        teslaStorage.getLatestTechnicalIndicators(),
        teslaStorage.getRecentTweets(48),
        teslaStorage.getRecentNews(48),
        teslaStorage.getLatestFundamentalData()
      ]);

      if (!currentPrice || !technicalIndicators) {
        console.warn('Missing required data for advanced prediction');
        return;
      }

      // Create comprehensive analysis prompt
      const analysisPrompt = `As a Tesla stock prediction expert, analyze the following data and provide a 5-day forecast:

CURRENT DATA:
- Price: $${currentPrice.price} (${currentPrice.changePercent}% change)
- Volume: ${currentPrice.volume}

TECHNICAL INDICATORS:
- RSI: ${technicalIndicators.rsi || 'N/A'}
- MACD: ${technicalIndicators.macd || 'N/A'}
- SMA 20: ${technicalIndicators.sma20 || 'N/A'}

SENTIMENT (${recentTweets.length} tweets, ${recentNews.length} news):
${recentTweets.slice(0, 3).map(t => `"${t.tweetText.substring(0, 80)}..." (${t.sentimentLabel})`).join('; ')}

Provide JSON response:
{
  "predictedPrice": "XXX.XX",
  "confidence": 75,
  "aiRating": 65,
  "recommendation": "buy",
  "riskLevel": "medium",
  "reasoning": "Analysis based on technical and sentiment factors"
}`;

      // Call OpenAI API
      const aiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional Tesla stock analyst. Provide data-driven predictions in valid JSON format only.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiPrediction = JSON.parse(aiResponse.data.choices[0].message.content);
      
      // Store advanced prediction
      const advancedPredictionData = {
        symbol: 'TSLA',
        currentPrice: currentPrice.price,
        predictedPrice: aiPrediction.predictedPrice,
        predictionDays: 5,
        confidence: aiPrediction.confidence.toString(),
        aiRating: aiPrediction.aiRating,
        recommendation: aiPrediction.recommendation,
        riskLevel: aiPrediction.riskLevel,
        reasoning: aiPrediction.reasoning,
        modelUsed: 'gpt-3.5-turbo-advanced',
      };

      await teslaStorage.insertAiPrediction(advancedPredictionData);
      await this.logApiCall('openai', 'chat/completions', true, Date.now() - startTime);
      
    } catch (error) {
      console.error('Advanced AI Prediction error:', error);
      await this.logApiCall('openai', 'chat/completions', false, Date.now() - startTime, (error as Error).message);
    }
  }
}