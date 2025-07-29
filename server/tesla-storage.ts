import crypto from 'crypto';
import type { 
  StockPrice, 
  InsertStockPrice, 
  TechnicalIndicator, 
  InsertTechnicalIndicator,
  FundamentalData,
  InsertFundamentalData,
  InsiderTrade,
  InsertInsiderTrade,
  NewsArticle,
  InsertNewsArticle,
  AiPrediction,
  InsertAiPrediction,
  MarketAnomaly,
  InsertMarketAnomaly,
  ApiLog,
  InsertApiLog,
  AmdDashboardData
} from '@shared/tesla-schema';

import { db } from './db';
import { 
  stockPrices, 
  technicalIndicators, 
  fundamentalData, 
  insiderTrades, 
  newsArticles, 
  aiPredictions, 
  marketAnomalies, 
  apiLogs 
} from '@shared/tesla-schema';
import { desc, eq, gte } from 'drizzle-orm';

export interface IAmdStorage {
  // Stock Price methods
  insertStockPrice(data: InsertStockPrice): Promise<StockPrice>;
  getLatestStockPrice(): Promise<StockPrice | null>;
  getStockPriceHistory(hours: number): Promise<StockPrice[]>;
  
  // Technical Indicators methods
  insertTechnicalIndicator(data: InsertTechnicalIndicator): Promise<TechnicalIndicator>;
  getLatestTechnicalIndicators(): Promise<TechnicalIndicator | null>;
  
  // Fundamental Data methods
  insertFundamentalData(data: InsertFundamentalData): Promise<FundamentalData>;
  getLatestFundamentalData(): Promise<FundamentalData | null>;
  
  // Insider Trades methods
  insertInsiderTrade(data: InsertInsiderTrade): Promise<InsiderTrade>;
  getRecentInsiderTrades(days: number): Promise<InsiderTrade[]>;
  
  // News methods
  insertNewsArticle(data: InsertNewsArticle): Promise<NewsArticle>;
  getRecentNews(hours: number): Promise<NewsArticle[]>;
  
  // AI Predictions methods
  insertAiPrediction(data: InsertAiPrediction): Promise<AiPrediction>;
  getLatestPrediction(): Promise<AiPrediction | null>;
  
  // Market Anomalies methods
  insertMarketAnomaly(data: InsertMarketAnomaly): Promise<MarketAnomaly>;
  getRecentAnomalies(hours: number): Promise<MarketAnomaly[]>;
  
  // API Logs methods
  insertApiLog(data: InsertApiLog): Promise<ApiLog>;
  getApiStats(): Promise<Array<{ provider: string; success: number; failure: number; avgResponseTime: number }>>;
  
  // Dashboard data
  getDashboardData(): Promise<AmdDashboardData>;
}

// Database Storage Implementation (Primary)
class AmdDatabaseStorage implements IAmdStorage {
  async insertStockPrice(data: InsertStockPrice): Promise<StockPrice> {
    const [result] = await db.insert(stockPrices).values(data).returning();
    return result;
  }

  async getLatestStockPrice(): Promise<StockPrice | null> {
    const [result] = await db
      .select()
      .from(stockPrices)
      .where(eq(stockPrices.symbol, 'AMD'))
      .orderBy(desc(stockPrices.timestamp))
      .limit(1);
    return result || null;
  }

  async getStockPriceHistory(hours: number): Promise<StockPrice[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db
      .select()
      .from(stockPrices)
      .where(gte(stockPrices.timestamp, hoursAgo))
      .orderBy(desc(stockPrices.timestamp));
  }

  async insertTechnicalIndicator(data: InsertTechnicalIndicator): Promise<TechnicalIndicator> {
    const [result] = await db.insert(technicalIndicators).values(data).returning();
    return result;
  }

  async getLatestTechnicalIndicators(): Promise<TechnicalIndicator | null> {
    const [result] = await db
      .select()
      .from(technicalIndicators)
      .where(eq(technicalIndicators.symbol, 'AMD'))
      .orderBy(desc(technicalIndicators.timestamp))
      .limit(1);
    return result || null;
  }

  async insertFundamentalData(data: InsertFundamentalData): Promise<FundamentalData> {
    const [result] = await db.insert(fundamentalData).values(data).returning();
    return result;
  }

  async getLatestFundamentalData(): Promise<FundamentalData | null> {
    const [result] = await db
      .select()
      .from(fundamentalData)
      .where(eq(fundamentalData.symbol, 'AMD'))
      .orderBy(desc(fundamentalData.timestamp))
      .limit(1);
    return result || null;
  }

  async insertInsiderTrade(data: InsertInsiderTrade): Promise<InsiderTrade> {
    const [result] = await db.insert(insiderTrades).values(data).returning();
    return result;
  }

  async getRecentInsiderTrades(days: number): Promise<InsiderTrade[]> {
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db
      .select()
      .from(insiderTrades)
      .where(gte(insiderTrades.timestamp, daysAgo))
      .orderBy(desc(insiderTrades.timestamp));
  }

  async insertNewsArticle(data: InsertNewsArticle): Promise<NewsArticle> {
    const [result] = await db.insert(newsArticles).values(data).returning();
    return result;
  }

  async getRecentNews(hours: number): Promise<NewsArticle[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db
      .select()
      .from(newsArticles)
      .where(gte(newsArticles.timestamp, hoursAgo))
      .orderBy(desc(newsArticles.timestamp));
  }

  async insertAiPrediction(data: InsertAiPrediction): Promise<AiPrediction> {
    const [result] = await db.insert(aiPredictions).values(data).returning();
    return result;
  }

  async getLatestPrediction(): Promise<AiPrediction | null> {
    const [result] = await db
      .select()
      .from(aiPredictions)
      .where(eq(aiPredictions.symbol, 'AMD'))
      .orderBy(desc(aiPredictions.timestamp))
      .limit(1);
    return result || null;
  }

  async insertMarketAnomaly(data: InsertMarketAnomaly): Promise<MarketAnomaly> {
    const [result] = await db.insert(marketAnomalies).values(data).returning();
    return result;
  }

  async getRecentAnomalies(hours: number): Promise<MarketAnomaly[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db
      .select()
      .from(marketAnomalies)
      .where(gte(marketAnomalies.timestamp, hoursAgo))
      .orderBy(desc(marketAnomalies.timestamp));
  }

  async insertApiLog(data: InsertApiLog): Promise<ApiLog> {
    const [result] = await db.insert(apiLogs).values(data).returning();
    return result;
  }

  async getApiStats(): Promise<Array<{ provider: string; success: number; failure: number; avgResponseTime: number }>> {
    const logs = await db.select().from(apiLogs);
    
    const stats = logs.reduce((acc, log) => {
      if (!acc[log.provider]) {
        acc[log.provider] = { success: 0, failure: 0, totalTime: 0, count: 0 };
      }
      
      if (log.success) {
        acc[log.provider].success++;
      } else {
        acc[log.provider].failure++;
      }
      
      if (log.responseTime) {
        acc[log.provider].totalTime += log.responseTime;
        acc[log.provider].count++;
      }
      
      return acc;
    }, {} as Record<string, { success: number; failure: number; totalTime: number; count: number }>);

    return Object.entries(stats).map(([provider, data]) => ({
      provider,
      success: data.success,
      failure: data.failure,
      avgResponseTime: data.count > 0 ? Math.round(data.totalTime / data.count) : 0
    }));
  }

  async getDashboardData(): Promise<AmdDashboardData> {
    const [currentPrice, technicalIndicators, fundamentalData, prediction] = await Promise.all([
      this.getLatestStockPrice(),
      this.getLatestTechnicalIndicators(),
      this.getLatestFundamentalData(),
      this.getLatestPrediction()
    ]);

    const [priceHistory, insiderTrades, recentNews, anomalies] = await Promise.all([
      this.getStockPriceHistory(24),
      this.getRecentInsiderTrades(30),
      this.getRecentNews(24),
      this.getRecentAnomalies(24)
    ]);

    return {
      currentPrice: currentPrice || {
        id: 'no-real-data',
        symbol: 'AMD',
        price: 'N/A',
        change: 'N/A',
        changePercent: 'N/A',
        volume: 0,
        timestamp: new Date(),
      },
      technicalIndicators: technicalIndicators || {
        id: 'no-real-data',
        symbol: 'AMD',
        rsi: null,
        macd: null,
        macdSignal: null,
        sma20: null,
        sma50: null,
        ema12: null,
        ema26: null,
        timestamp: new Date(),
      },
      fundamentalData: fundamentalData || {
        id: 'no-real-data',
        symbol: 'AMD',
        peRatio: null,
        marketCap: null,
        beta: null,
        eps: null,
        revenue: null,
        earningsDate: null,
        timestamp: new Date(),
      },
      prediction: prediction || {
        id: 'no-real-data',
        symbol: 'AMD',
        predictedPrice: 'N/A',
        confidence: 'N/A',
        direction: 'neutral',
        reasoning: 'Professional prediction requires real market data - please provide API keys for accurate forecasts',
        priceTarget: 'N/A',
        timeHorizon: '1d',
        timestamp: new Date(),
      },
      priceHistory: priceHistory.slice(0, 50),
      insiderTrades: insiderTrades.slice(0, 10),
      recentNews: recentNews.slice(0, 10),
      anomalies: anomalies.slice(0, 5),
    };
  }
}

// In-Memory Storage Implementation (Fallback)
class AmdMemStorage implements IAmdStorage {
  private stockPrices: StockPrice[] = [];
  private technicalIndicators: TechnicalIndicator[] = [];
  private fundamentalData: FundamentalData[] = [];
  private insiderTrades: InsiderTrade[] = [];
  private newsArticles: NewsArticle[] = [];
  private aiPredictions: AiPrediction[] = [];
  private marketAnomalies: MarketAnomaly[] = [];
  private apiLogs: ApiLog[] = [];

  async insertStockPrice(data: InsertStockPrice): Promise<StockPrice> {
    const stockPrice: StockPrice = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      symbol: data.symbol || 'AMD',
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      volume: data.volume,
    };
    this.stockPrices.push(stockPrice);
    return stockPrice;
  }

  async getLatestStockPrice(): Promise<StockPrice | null> {
    return this.stockPrices.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
  }

  async getStockPriceHistory(hours: number): Promise<StockPrice[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.stockPrices
      .filter(price => price.timestamp >= hoursAgo)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async insertTechnicalIndicator(data: InsertTechnicalIndicator): Promise<TechnicalIndicator> {
    console.log('📊 Memory Storage - Inserting technical indicator:', data);
    const indicator: TechnicalIndicator = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      symbol: data.symbol || 'AMD',
      rsi: data.rsi || null,
      macd: data.macd || null,
      macdSignal: data.macdSignal || null,
      sma20: data.sma20 || null,
      sma50: data.sma50 || null,
      ema12: data.ema12 || null,
      ema26: data.ema26 || null,
    };
    this.technicalIndicators.push(indicator);
    console.log('✅ Technical indicator saved, total count:', this.technicalIndicators.length);
    return indicator;
  }

  async getLatestTechnicalIndicators(): Promise<TechnicalIndicator | null> {
    return this.technicalIndicators.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
  }

  async insertFundamentalData(data: InsertFundamentalData): Promise<FundamentalData> {
    const fundamental: FundamentalData = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      symbol: data.symbol || 'AMD',
      peRatio: data.peRatio || null,
      marketCap: data.marketCap || null,
      beta: data.beta || null,
      eps: data.eps || null,
      revenue: data.revenue || null,
      earningsDate: data.earningsDate || null,
    };
    this.fundamentalData.push(fundamental);
    return fundamental;
  }

  async getLatestFundamentalData(): Promise<FundamentalData | null> {
    return this.fundamentalData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
  }

  async insertInsiderTrade(data: InsertInsiderTrade): Promise<InsiderTrade> {
    console.log('💼 Memory Storage - Inserting insider trade:', data);
    const trade: InsiderTrade = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      symbol: data.symbol || 'AMD',
      price: data.price,
      insiderName: data.insiderName,
      transactionType: data.transactionType,
      shares: data.shares,
      transactionDate: data.transactionDate,
      filingDate: data.filingDate,
    };
    this.insiderTrades.push(trade);
    console.log('✅ Insider trade saved, total count:', this.insiderTrades.length);
    return trade;
  }

  async getRecentInsiderTrades(days: number): Promise<InsiderTrade[]> {
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.insiderTrades
      .filter(trade => trade.timestamp >= daysAgo)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async insertNewsArticle(data: InsertNewsArticle): Promise<NewsArticle> {
    const article: NewsArticle = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      headline: data.headline,
      content: data.content || null,
      source: data.source,
      url: data.url || null,
      sentimentScore: data.sentimentScore || null,
      relevanceScore: data.relevanceScore || null,
      publishedAt: data.publishedAt,
    };
    this.newsArticles.push(article);
    return article;
  }

  async getRecentNews(hours: number): Promise<NewsArticle[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.newsArticles
      .filter(article => article.timestamp >= hoursAgo)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async insertAiPrediction(data: InsertAiPrediction): Promise<AiPrediction> {
    const prediction: AiPrediction = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      symbol: data.symbol || 'AMD',
      currentPrice: data.currentPrice,
      predictedPrice: data.predictedPrice,
      predictionDays: data.predictionDays || 1,
      confidence: data.confidence,
      aiRating: data.aiRating,
      recommendation: data.recommendation,
      riskLevel: data.riskLevel,
      reasoning: data.reasoning,
      modelUsed: data.modelUsed,
    };
    this.aiPredictions.push(prediction);
    return prediction;
  }

  async getLatestPrediction(): Promise<AiPrediction | null> {
    return this.aiPredictions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
  }

  async insertMarketAnomaly(data: InsertMarketAnomaly): Promise<MarketAnomaly> {
    const anomaly: MarketAnomaly = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      symbol: data.symbol || 'AMD',
      anomalyType: data.anomalyType,
      severity: data.severity,
      description: data.description,
      detectedValue: data.detectedValue || null,
      normalRange: data.normalRange,
    };
    this.marketAnomalies.push(anomaly);
    return anomaly;
  }

  async getRecentAnomalies(hours: number): Promise<MarketAnomaly[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.marketAnomalies
      .filter(anomaly => anomaly.timestamp >= hoursAgo)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async insertApiLog(data: InsertApiLog): Promise<ApiLog> {
    const log: ApiLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      provider: data.provider,
      endpoint: data.endpoint,
      success: data.success,
      responseTime: data.responseTime || null,
      errorMessage: data.errorMessage || null,
      rateLimited: data.rateLimited || null,
    };
    this.apiLogs.push(log);
    return log;
  }

  async getApiStats(): Promise<Array<{ provider: string; success: number; failure: number; avgResponseTime: number }>> {
    const stats = this.apiLogs.reduce((acc, log) => {
      if (!acc[log.provider]) {
        acc[log.provider] = { success: 0, failure: 0, totalTime: 0, count: 0 };
      }
      
      if (log.success) {
        acc[log.provider].success++;
      } else {
        acc[log.provider].failure++;
      }
      
      if (log.responseTime) {
        acc[log.provider].totalTime += log.responseTime;
        acc[log.provider].count++;
      }
      
      return acc;
    }, {} as Record<string, { success: number; failure: number; totalTime: number; count: number }>);

    return Object.entries(stats).map(([provider, data]) => ({
      provider,
      success: data.success,
      failure: data.failure,
      avgResponseTime: data.count > 0 ? Math.round(data.totalTime / data.count) : 0
    }));
  }

  async getDashboardData(): Promise<AmdDashboardData> {
    const [currentPrice, technicalIndicators, fundamentalData, prediction] = await Promise.all([
      this.getLatestStockPrice(),
      this.getLatestTechnicalIndicators(),
      this.getLatestFundamentalData(),
      this.getLatestPrediction()
    ]);

    const [priceHistory, insiderTrades, recentNews, anomalies] = await Promise.all([
      this.getStockPriceHistory(24),
      this.getRecentInsiderTrades(30),
      this.getRecentNews(24),
      this.getRecentAnomalies(24)
    ]);

    return {
      currentPrice: currentPrice || {
        id: 'no-real-data',
        symbol: 'AMD',
        price: 'N/A',
        change: 'N/A',
        changePercent: 'N/A',
        volume: 0,
        timestamp: new Date(),
      },
      technicalIndicators: technicalIndicators || {
        id: 'no-real-data',
        symbol: 'AMD',
        rsi: null,
        macd: null,
        macdSignal: null,
        sma20: null,
        sma50: null,
        ema12: null,
        ema26: null,
        timestamp: new Date(),
      },
      fundamentalData: fundamentalData || {
        id: 'no-real-data',
        symbol: 'AMD',
        peRatio: null,
        marketCap: null,
        beta: null,
        eps: null,
        revenue: null,
        earningsDate: null,
        timestamp: new Date(),
      },
      prediction: prediction || {
        id: 'no-real-data',
        symbol: 'AMD',
        predictedPrice: 'N/A',
        confidence: 'N/A',
        direction: 'neutral',
        reasoning: 'Professional prediction requires real market data - please provide API keys for accurate forecasts',
        priceTarget: 'N/A',
        timeHorizon: '1d',
        timestamp: new Date(),
      },
      priceHistory: priceHistory.slice(0, 50),
      insiderTrades: insiderTrades.slice(0, 10),
      recentNews: recentNews.slice(0, 10),
      anomalies: anomalies.slice(0, 5),
    };
  }
}

// Use Database Storage if DATABASE_URL is available, otherwise fall back to Memory Storage
export const teslaStorage: IAmdStorage = process.env.DATABASE_URL && db
  ? new AmdDatabaseStorage() 
  : new AmdMemStorage();