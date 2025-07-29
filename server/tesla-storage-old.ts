import { eq, desc, and, gte, lte } from 'drizzle-orm';
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
    
    const stats = new Map<string, { success: number; failure: number; totalResponseTime: number; count: number }>();
    
    for (const log of recentLogs) {
      if (!stats.has(log.provider)) {
        stats.set(log.provider, { success: 0, failure: 0, totalResponseTime: 0, count: 0 });
      }
      
      const stat = stats.get(log.provider)!;
      if (log.success) {
        stat.success++;
      } else {
        stat.failure++;
      }
      
      if (log.responseTime) {
        stat.totalResponseTime += log.responseTime;
        stat.count++;
      }
    }
    
    return Array.from(stats.entries()).map(([provider, stat]) => ({
      provider,
      success: stat.success,
      failure: stat.failure,
      avgResponseTime: stat.count > 0 ? stat.totalResponseTime / stat.count : 0,
    }));
  }

  async getDashboardData(): Promise<AmdDashboardData> {
    const currentPrice = await this.getLatestStockPrice();
    const technicalIndicators = await this.getLatestTechnicalIndicators();
    const fundamentalData = await this.getLatestFundamentalData();
    const latestPrediction = await this.getLatestPrediction();
    const recentInsiderTrades = await this.getRecentInsiderTrades(30);
    const recentTweets = []; // Twitter functionality removed
    const recentNews = await this.getRecentNews(24);
    const marketAnomalies = await this.getRecentAnomalies(24);

    return {
      currentPrice: currentPrice!,
      technicalIndicators: technicalIndicators!,
      fundamentalData: fundamentalData!,
      latestPrediction: latestPrediction!,
      recentInsiderTrades,
      recentTweets: [],
      recentNews: [],
      marketAnomalies,
    };
  }
}

// Database storage implementation (when using PostgreSQL)
class AmdDatabaseStorage implements IAmdStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql, { schema: teslaSchema });
  }

  async insertStockPrice(data: InsertStockPrice): Promise<StockPrice> {
    const [result] = await this.db.insert(teslaSchema.stockPrices).values(data).returning();
    return result;
  }

  async getLatestStockPrice(): Promise<StockPrice | null> {
    const [result] = await this.db
      .select()
      .from(teslaSchema.stockPrices)
      .orderBy(desc(teslaSchema.stockPrices.timestamp))
      .limit(1);
    return result || null;
  }

  async getStockPriceHistory(hours: number): Promise<StockPrice[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await this.db
      .select()
      .from(teslaSchema.stockPrices)
      .where(gte(teslaSchema.stockPrices.timestamp, cutoff))
      .orderBy(desc(teslaSchema.stockPrices.timestamp));
  }

  async insertTechnicalIndicator(data: InsertTechnicalIndicator): Promise<TechnicalIndicator> {
    const [result] = await this.db.insert(teslaSchema.technicalIndicators).values(data).returning();
    return result;
  }

  async getLatestTechnicalIndicators(): Promise<TechnicalIndicator | null> {
    const [result] = await this.db
      .select()
      .from(teslaSchema.technicalIndicators)
      .orderBy(desc(teslaSchema.technicalIndicators.timestamp))
      .limit(1);
    return result || null;
  }

  async insertFundamentalData(data: InsertFundamentalData): Promise<FundamentalData> {
    const [result] = await this.db.insert(teslaSchema.fundamentalData).values(data).returning();
    return result;
  }

  async getLatestFundamentalData(): Promise<FundamentalData | null> {
    const [result] = await this.db
      .select()
      .from(teslaSchema.fundamentalData)
      .orderBy(desc(teslaSchema.fundamentalData.timestamp))
      .limit(1);
    return result || null;
  }

  async insertInsiderTrade(data: InsertInsiderTrade): Promise<InsiderTrade> {
    const [result] = await this.db.insert(teslaSchema.insiderTrades).values(data).returning();
    return result;
  }

  async getRecentInsiderTrades(days: number): Promise<InsiderTrade[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await this.db
      .select()
      .from(teslaSchema.insiderTrades)
      .where(gte(teslaSchema.insiderTrades.transactionDate, cutoff))
      .orderBy(desc(teslaSchema.insiderTrades.transactionDate))
      .limit(10);
  }



  async insertNewsArticle(data: InsertNewsArticle): Promise<NewsArticle> {
    const [result] = await this.db.insert(teslaSchema.newsArticles).values(data).returning();
    return result;
  }

  async getRecentNews(hours: number): Promise<NewsArticle[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await this.db
      .select()
      .from(teslaSchema.newsArticles)
      .where(gte(teslaSchema.newsArticles.publishedAt, cutoff))
      .orderBy(desc(teslaSchema.newsArticles.publishedAt))
      .limit(10);
  }

  async insertAiPrediction(data: InsertAiPrediction): Promise<AiPrediction> {
    const [result] = await this.db.insert(teslaSchema.aiPredictions).values(data).returning();
    return result;
  }

  async getLatestPrediction(): Promise<AiPrediction | null> {
    const [result] = await this.db
      .select()
      .from(teslaSchema.aiPredictions)
      .orderBy(desc(teslaSchema.aiPredictions.timestamp))
      .limit(1);
    return result || null;
  }

  async getPredictionHistory(days: number): Promise<AiPrediction[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await this.db
      .select()
      .from(teslaSchema.aiPredictions)
      .where(gte(teslaSchema.aiPredictions.timestamp, cutoff))
      .orderBy(desc(teslaSchema.aiPredictions.timestamp));
  }

  async insertMarketAnomaly(data: InsertMarketAnomaly): Promise<MarketAnomaly> {
    const [result] = await this.db.insert(teslaSchema.marketAnomalies).values(data).returning();
    return result;
  }

  async getRecentAnomalies(hours: number): Promise<MarketAnomaly[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await this.db
      .select()
      .from(teslaSchema.marketAnomalies)
      .where(gte(teslaSchema.marketAnomalies.timestamp, cutoff))
      .orderBy(desc(teslaSchema.marketAnomalies.timestamp));
  }

  async insertApiLog(data: InsertApiLog): Promise<ApiLog> {
    const [result] = await this.db.insert(teslaSchema.apiLogs).values(data).returning();
    return result;
  }

  async getApiStats(hours: number): Promise<{ provider: string; success: number; failure: number; avgResponseTime: number }[]> {
    // This would require more complex SQL aggregation - simplified for now
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const logs = await this.db
      .select()
      .from(teslaSchema.apiLogs)
      .where(gte(teslaSchema.apiLogs.timestamp, cutoff));

    const stats = new Map<string, { success: number; failure: number; totalResponseTime: number; count: number }>();
    
    for (const log of logs) {
      if (!stats.has(log.provider)) {
        stats.set(log.provider, { success: 0, failure: 0, totalResponseTime: 0, count: 0 });
      }
      
      const stat = stats.get(log.provider)!;
      if (log.success) {
        stat.success++;
      } else {
        stat.failure++;
      }
      
      if (log.responseTime) {
        stat.totalResponseTime += log.responseTime;
        stat.count++;
      }
    }
    
    return Array.from(stats.entries()).map(([provider, stat]) => ({
      provider,
      success: stat.success,
      failure: stat.failure,
      avgResponseTime: stat.count > 0 ? stat.totalResponseTime / stat.count : 0,
    }));
  }

  async getDashboardData(): Promise<AmdDashboardData> {
    const [
      currentPrice,
      technicalIndicators,
      fundamentalData,
      latestPrediction,
      recentInsiderTrades,
      recentTweets,
      recentNews,
      marketAnomalies
    ] = await Promise.all([
      this.getLatestStockPrice(),
      this.getLatestTechnicalIndicators(),
      this.getLatestFundamentalData(),
      this.getLatestPrediction(),
      this.getRecentInsiderTrades(30),
      Promise.resolve([]), // Twitter functionality removed
      Promise.resolve([]), // News functionality removed
      this.getRecentAnomalies(24)
    ]);

    return {
      currentPrice: currentPrice!,
      technicalIndicators: technicalIndicators!,
      fundamentalData: fundamentalData!,
      latestPrediction: latestPrediction!,
      recentInsiderTrades,
      recentTweets: [],
      recentNews: [],
      marketAnomalies,
    };
  }
}

// Export the storage instance
export const teslaStorage: IAmdStorage = process.env.DATABASE_URL 
  ? new AmdDatabaseStorage()
  : new AmdMemStorage();