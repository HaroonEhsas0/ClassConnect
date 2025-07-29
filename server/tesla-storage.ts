import { eq, desc, gte } from 'drizzle-orm';
import * as teslaSchema from '../shared/tesla-schema';
import { db } from './db';
import type {
  StockPrice, InsertStockPrice,
  TechnicalIndicator, InsertTechnicalIndicator,
  FundamentalData, InsertFundamentalData,
  InsiderTrade, InsertInsiderTrade,
  NewsArticle, InsertNewsArticle,
  AiPrediction, InsertAiPrediction,
  MarketAnomaly, InsertMarketAnomaly,
  ApiLog, InsertApiLog,
  AmdDashboardData
} from '../shared/tesla-schema';

export interface IAmdStorage {
  // Stock price operations
  insertStockPrice(data: InsertStockPrice): Promise<StockPrice>;
  getLatestStockPrice(): Promise<StockPrice | null>;
  getStockPriceHistory(hours: number): Promise<StockPrice[]>;

  // Technical indicators
  insertTechnicalIndicator(data: InsertTechnicalIndicator): Promise<TechnicalIndicator>;
  getLatestTechnicalIndicators(): Promise<TechnicalIndicator | null>;

  // Fundamental data
  insertFundamentalData(data: InsertFundamentalData): Promise<FundamentalData>;
  getLatestFundamentalData(): Promise<FundamentalData | null>;

  // Insider trades
  insertInsiderTrade(data: InsertInsiderTrade): Promise<InsiderTrade>;
  getRecentInsiderTrades(days: number): Promise<InsiderTrade[]>;

  // News articles
  insertNewsArticle(data: InsertNewsArticle): Promise<NewsArticle>;
  getRecentNews(hours: number): Promise<NewsArticle[]>;

  // AI predictions
  insertAiPrediction(data: InsertAiPrediction): Promise<AiPrediction>;
  getLatestPrediction(): Promise<AiPrediction | null>;
  getPredictionHistory(days: number): Promise<AiPrediction[]>;

  // Market anomalies
  insertMarketAnomaly(data: InsertMarketAnomaly): Promise<MarketAnomaly>;
  getRecentAnomalies(hours: number): Promise<MarketAnomaly[]>;

  // API logs
  insertApiLog(data: InsertApiLog): Promise<ApiLog>;
  getApiStats(hours: number): Promise<{ provider: string; success: number; failure: number; avgResponseTime: number }[]>;

  // Dashboard data aggregation
  getDashboardData(): Promise<AmdDashboardData>;
}

// Database Storage Implementation
class AmdDatabaseStorage implements IAmdStorage {
  async insertStockPrice(data: InsertStockPrice): Promise<StockPrice> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .insert(teslaSchema.stockPrices)
      .values(data)
      .returning();
    return result;
  }

  async getLatestStockPrice(): Promise<StockPrice | null> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .select()
      .from(teslaSchema.stockPrices)
      .orderBy(desc(teslaSchema.stockPrices.timestamp))
      .limit(1);
    return result || null;
  }

  async getStockPriceHistory(hours: number): Promise<StockPrice[]> {
    if (!db) throw new Error('Database not connected');
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db
      .select()
      .from(teslaSchema.stockPrices)
      .where(gte(teslaSchema.stockPrices.timestamp, cutoff))
      .orderBy(desc(teslaSchema.stockPrices.timestamp));
  }

  async insertTechnicalIndicator(data: InsertTechnicalIndicator): Promise<TechnicalIndicator> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .insert(teslaSchema.technicalIndicators)
      .values(data)
      .returning();
    return result;
  }

  async getLatestTechnicalIndicators(): Promise<TechnicalIndicator | null> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .select()
      .from(teslaSchema.technicalIndicators)
      .orderBy(desc(teslaSchema.technicalIndicators.timestamp))
      .limit(1);
    return result || null;
  }

  async insertFundamentalData(data: InsertFundamentalData): Promise<FundamentalData> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .insert(teslaSchema.fundamentalData)
      .values(data)
      .returning();
    return result;
  }

  async getLatestFundamentalData(): Promise<FundamentalData | null> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .select()
      .from(teslaSchema.fundamentalData)
      .orderBy(desc(teslaSchema.fundamentalData.timestamp))
      .limit(1);
    return result || null;
  }

  async insertInsiderTrade(data: InsertInsiderTrade): Promise<InsiderTrade> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .insert(teslaSchema.insiderTrades)
      .values(data)
      .returning();
    return result;
  }

  async getRecentInsiderTrades(days: number): Promise<InsiderTrade[]> {
    if (!db) throw new Error('Database not connected');
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db
      .select()
      .from(teslaSchema.insiderTrades)
      .where(gte(teslaSchema.insiderTrades.transactionDate, cutoff))
      .orderBy(desc(teslaSchema.insiderTrades.transactionDate))
      .limit(10);
  }

  async insertNewsArticle(data: InsertNewsArticle): Promise<NewsArticle> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .insert(teslaSchema.newsArticles)
      .values(data)
      .returning();
    return result;
  }

  async getRecentNews(hours: number): Promise<NewsArticle[]> {
    if (!db) throw new Error('Database not connected');
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db
      .select()
      .from(teslaSchema.newsArticles)
      .where(gte(teslaSchema.newsArticles.publishedAt, cutoff))
      .orderBy(desc(teslaSchema.newsArticles.publishedAt))
      .limit(10);
  }

  async insertAiPrediction(data: InsertAiPrediction): Promise<AiPrediction> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .insert(teslaSchema.aiPredictions)
      .values(data)
      .returning();
    return result;
  }

  async getLatestPrediction(): Promise<AiPrediction | null> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .select()
      .from(teslaSchema.aiPredictions)
      .orderBy(desc(teslaSchema.aiPredictions.timestamp))
      .limit(1);
    return result || null;
  }

  async getPredictionHistory(days: number): Promise<AiPrediction[]> {
    if (!db) throw new Error('Database not connected');
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db
      .select()
      .from(teslaSchema.aiPredictions)
      .where(gte(teslaSchema.aiPredictions.timestamp, cutoff))
      .orderBy(desc(teslaSchema.aiPredictions.timestamp));
  }

  async insertMarketAnomaly(data: InsertMarketAnomaly): Promise<MarketAnomaly> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .insert(teslaSchema.marketAnomalies)
      .values(data)
      .returning();
    return result;
  }

  async getRecentAnomalies(hours: number): Promise<MarketAnomaly[]> {
    if (!db) throw new Error('Database not connected');
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db
      .select()
      .from(teslaSchema.marketAnomalies)
      .where(gte(teslaSchema.marketAnomalies.timestamp, cutoff))
      .orderBy(desc(teslaSchema.marketAnomalies.timestamp));
  }

  async insertApiLog(data: InsertApiLog): Promise<ApiLog> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db
      .insert(teslaSchema.apiLogs)
      .values(data)
      .returning();
    return result;
  }

  async getApiStats(hours: number): Promise<{ provider: string; success: number; failure: number; avgResponseTime: number }[]> {
    if (!db) throw new Error('Database not connected');
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const logs = await db
      .select()
      .from(teslaSchema.apiLogs)
      .where(gte(teslaSchema.apiLogs.timestamp, cutoff));

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
        id: 'no-data',
        symbol: 'AMD',
        price: '0.00',
        change: '0.00',
        changePercent: '0.00',
        volume: 0,
        timestamp: new Date(),
      },
      technicalIndicators: technicalIndicators || {
        id: 'no-data',
        symbol: 'AMD',
        rsi: '50.00',
        macd: '0.00',
        macdSignal: '0.00',
        sma20: '0.00',
        sma50: '0.00',
        ema12: '0.00',
        ema26: '0.00',
        timestamp: new Date(),
      },
      fundamentalData: fundamentalData || {
        id: 'no-data',
        symbol: 'AMD',
        peRatio: '0.00',
        marketCap: '0.00',
        beta: '1.000',
        eps: '0.00',
        revenue: '0.00',
        earningsDate: new Date(),
        timestamp: new Date(),
      },
      prediction: prediction || {
        id: 'no-data',
        symbol: 'AMD',
        predictedPrice: '0.00',
        confidence: '0.00',
        direction: 'neutral',
        reasoning: 'No prediction available',
        priceTarget: '0.00',
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
      ...data,
    };
    this.stockPrices.push(stockPrice);
    return stockPrice;
  }

  async getLatestStockPrice(): Promise<StockPrice | null> {
    return this.stockPrices.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
  }

  async getStockPriceHistory(hours: number): Promise<StockPrice[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.stockPrices
      .filter(price => price.timestamp >= cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async insertTechnicalIndicator(data: InsertTechnicalIndicator): Promise<TechnicalIndicator> {
    const indicator: TechnicalIndicator = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...data,
    };
    this.technicalIndicators.push(indicator);
    return indicator;
  }

  async getLatestTechnicalIndicators(): Promise<TechnicalIndicator | null> {
    return this.technicalIndicators.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
  }

  async insertFundamentalData(data: InsertFundamentalData): Promise<FundamentalData> {
    const fundamental: FundamentalData = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...data,
    };
    this.fundamentalData.push(fundamental);
    return fundamental;
  }

  async getLatestFundamentalData(): Promise<FundamentalData | null> {
    return this.fundamentalData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
  }

  async insertInsiderTrade(data: InsertInsiderTrade): Promise<InsiderTrade> {
    const trade: InsiderTrade = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...data,
    };
    this.insiderTrades.push(trade);
    return trade;
  }

  async getRecentInsiderTrades(days: number): Promise<InsiderTrade[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.insiderTrades
      .filter(trade => trade.transactionDate >= cutoff)
      .sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime())
      .slice(0, 10);
  }

  async insertNewsArticle(data: InsertNewsArticle): Promise<NewsArticle> {
    const article: NewsArticle = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...data,
    };
    this.newsArticles.push(article);
    return article;
  }

  async getRecentNews(hours: number): Promise<NewsArticle[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.newsArticles
      .filter(article => article.publishedAt >= cutoff)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 10);
  }

  async insertAiPrediction(data: InsertAiPrediction): Promise<AiPrediction> {
    const prediction: AiPrediction = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...data,
    };
    this.aiPredictions.push(prediction);
    return prediction;
  }

  async getLatestPrediction(): Promise<AiPrediction | null> {
    return this.aiPredictions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
  }

  async getPredictionHistory(days: number): Promise<AiPrediction[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.aiPredictions
      .filter(prediction => prediction.timestamp >= cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async insertMarketAnomaly(data: InsertMarketAnomaly): Promise<MarketAnomaly> {
    const anomaly: MarketAnomaly = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...data,
    };
    this.marketAnomalies.push(anomaly);
    return anomaly;
  }

  async getRecentAnomalies(hours: number): Promise<MarketAnomaly[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.marketAnomalies
      .filter(anomaly => anomaly.timestamp >= cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async insertApiLog(data: InsertApiLog): Promise<ApiLog> {
    const log: ApiLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...data,
    };
    this.apiLogs.push(log);
    return log;
  }

  async getApiStats(hours: number): Promise<{ provider: string; success: number; failure: number; avgResponseTime: number }[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentLogs = this.apiLogs.filter(log => log.timestamp >= cutoff);
    
    const stats = recentLogs.reduce((acc, log) => {
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
        id: 'no-data',
        symbol: 'AMD',
        price: '0.00',
        change: '0.00',
        changePercent: '0.00',
        volume: 0,
        timestamp: new Date(),
      },
      technicalIndicators: technicalIndicators || {
        id: 'no-data',
        symbol: 'AMD',
        rsi: '50.00',
        macd: '0.00',
        macdSignal: '0.00',
        sma20: '0.00',
        sma50: '0.00',
        ema12: '0.00',
        ema26: '0.00',
        timestamp: new Date(),
      },
      fundamentalData: fundamentalData || {
        id: 'no-data',
        symbol: 'AMD',
        peRatio: '0.00',
        marketCap: '0.00',
        beta: '1.000',
        eps: '0.00',
        revenue: '0.00',
        earningsDate: new Date(),
        timestamp: new Date(),
      },
      prediction: prediction || {
        id: 'no-data',
        symbol: 'AMD',
        predictedPrice: '0.00',
        confidence: '0.00',
        direction: 'neutral',
        reasoning: 'No prediction available',
        priceTarget: '0.00',
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