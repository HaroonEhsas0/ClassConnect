import { pgTable, text, integer, decimal, timestamp, json, boolean, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Stock price data table
export const stockPrices = pgTable('stock_prices', {
  id: uuid('id').defaultRandom().primaryKey(),
  symbol: text('symbol').notNull().default('AMD'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  change: decimal('change', { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal('change_percent', { precision: 5, scale: 2 }).notNull(),
  volume: integer('volume').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Technical indicators table
export const technicalIndicators = pgTable('technical_indicators', {
  id: uuid('id').defaultRandom().primaryKey(),
  symbol: text('symbol').notNull().default('AMD'),
  rsi: decimal('rsi', { precision: 5, scale: 2 }),
  macd: decimal('macd', { precision: 10, scale: 4 }),
  macdSignal: decimal('macd_signal', { precision: 10, scale: 4 }),
  sma20: decimal('sma_20', { precision: 10, scale: 2 }),
  sma50: decimal('sma_50', { precision: 10, scale: 2 }),
  ema12: decimal('ema_12', { precision: 10, scale: 2 }),
  ema26: decimal('ema_26', { precision: 10, scale: 2 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Fundamental data table
export const fundamentalData = pgTable('fundamental_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  symbol: text('symbol').notNull().default('AMD'),
  peRatio: decimal('pe_ratio', { precision: 10, scale: 2 }),
  marketCap: decimal('market_cap', { precision: 15, scale: 2 }),
  beta: decimal('beta', { precision: 5, scale: 3 }),
  eps: decimal('eps', { precision: 10, scale: 2 }),
  revenue: decimal('revenue', { precision: 15, scale: 2 }),
  earningsDate: timestamp('earnings_date'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Insider trading activity
export const insiderTrades = pgTable('insider_trades', {
  id: uuid('id').defaultRandom().primaryKey(),
  symbol: text('symbol').notNull().default('AMD'),
  insiderName: text('insider_name').notNull(),
  transactionType: text('transaction_type').notNull(), // 'buy' or 'sell'
  shares: integer('shares').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  transactionDate: timestamp('transaction_date').notNull(),
  filingDate: timestamp('filing_date').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// AMD CEO and key personnel's social media sentiment analysis
export const tweetSentiment = pgTable('tweet_sentiment', {
  id: uuid('id').defaultRandom().primaryKey(),
  tweetId: text('tweet_id').notNull(),
  tweetText: text('tweet_text').notNull(),
  sentimentScore: decimal('sentiment_score', { precision: 5, scale: 3 }).notNull(), // -1 to 1
  sentimentLabel: text('sentiment_label').notNull(), // 'positive', 'negative', 'neutral'
  impactScore: decimal('impact_score', { precision: 5, scale: 2 }), // 0-10 predicted impact
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  tweetDate: timestamp('tweet_date').notNull(),
});

// News headlines and sentiment
export const newsArticles = pgTable('news_articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  headline: text('headline').notNull(),
  content: text('content'),
  source: text('source').notNull(),
  url: text('url'),
  sentimentScore: decimal('sentiment_score', { precision: 5, scale: 3 }), // -1 to 1
  relevanceScore: decimal('relevance_score', { precision: 5, scale: 2 }), // 0-10
  publishedAt: timestamp('published_at').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// AI predictions and recommendations
export const aiPredictions = pgTable('ai_predictions', {
  id: uuid('id').defaultRandom().primaryKey(),
  symbol: text('symbol').notNull().default('AMD'),
  currentPrice: decimal('current_price', { precision: 10, scale: 2 }).notNull(),
  predictedPrice: decimal('predicted_price', { precision: 10, scale: 2 }).notNull(),
  predictionDays: integer('prediction_days').notNull().default(5),
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull(), // 0-100
  aiRating: integer('ai_rating').notNull(), // 0-100
  recommendation: text('recommendation').notNull(), // 'strong_buy', 'buy', 'hold', 'sell', 'strong_sell'
  riskLevel: text('risk_level').notNull(), // 'low', 'medium', 'high'
  reasoning: text('reasoning').notNull(),
  modelUsed: text('model_used').notNull(), // 'prophet', 'xgboost', 'lstm', 'ensemble'
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Market volatility and anomaly detection
export const marketAnomalies = pgTable('market_anomalies', {
  id: uuid('id').defaultRandom().primaryKey(),
  symbol: text('symbol').notNull().default('AMD'),
  anomalyType: text('anomaly_type').notNull(), // 'volume_spike', 'price_gap', 'unusual_pattern'
  severity: text('severity').notNull(), // 'low', 'medium', 'high', 'critical'
  description: text('description').notNull(),
  detectedValue: decimal('detected_value', { precision: 15, scale: 4 }),
  normalRange: json('normal_range'), // {min: number, max: number}
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// API call logs for monitoring and debugging
export const apiLogs = pgTable('api_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: text('provider').notNull(), // 'alpha_vantage', 'finnhub', 'twitter', 'news_api'
  endpoint: text('endpoint').notNull(),
  success: boolean('success').notNull(),
  responseTime: integer('response_time'), // milliseconds
  errorMessage: text('error_message'),
  rateLimited: boolean('rate_limited').default(false),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertStockPriceSchema = createInsertSchema(stockPrices).omit({ id: true, timestamp: true });
export const insertTechnicalIndicatorSchema = createInsertSchema(technicalIndicators).omit({ id: true, timestamp: true });
export const insertFundamentalDataSchema = createInsertSchema(fundamentalData).omit({ id: true, timestamp: true });
export const insertInsiderTradeSchema = createInsertSchema(insiderTrades).omit({ id: true, timestamp: true });
export const insertTweetSentimentSchema = createInsertSchema(tweetSentiment).omit({ id: true, timestamp: true });
export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({ id: true, timestamp: true });
export const insertAiPredictionSchema = createInsertSchema(aiPredictions).omit({ id: true, timestamp: true });
export const insertMarketAnomalySchema = createInsertSchema(marketAnomalies).omit({ id: true, timestamp: true });
export const insertApiLogSchema = createInsertSchema(apiLogs).omit({ id: true, timestamp: true });

// Types for TypeScript
export type StockPrice = typeof stockPrices.$inferSelect;
export type InsertStockPrice = z.infer<typeof insertStockPriceSchema>;

export type TechnicalIndicator = typeof technicalIndicators.$inferSelect;
export type InsertTechnicalIndicator = z.infer<typeof insertTechnicalIndicatorSchema>;

export type FundamentalData = typeof fundamentalData.$inferSelect;
export type InsertFundamentalData = z.infer<typeof insertFundamentalDataSchema>;

export type InsiderTrade = typeof insiderTrades.$inferSelect;
export type InsertInsiderTrade = z.infer<typeof insertInsiderTradeSchema>;

export type TweetSentiment = typeof tweetSentiment.$inferSelect;
export type InsertTweetSentiment = z.infer<typeof insertTweetSentimentSchema>;

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;

export type AiPrediction = typeof aiPredictions.$inferSelect;
export type InsertAiPrediction = z.infer<typeof insertAiPredictionSchema>;

export type MarketAnomaly = typeof marketAnomalies.$inferSelect;
export type InsertMarketAnomaly = z.infer<typeof insertMarketAnomalySchema>;

export type ApiLog = typeof apiLogs.$inferSelect;
export type InsertApiLog = z.infer<typeof insertApiLogSchema>;

// Combined dashboard data type
export type AmdDashboardData = {
  currentPrice: StockPrice;
  technicalIndicators: TechnicalIndicator;
  fundamentalData: FundamentalData;
  latestPrediction: AiPrediction;
  recentInsiderTrades: InsiderTrade[];
  recentTweets: never[]; // Twitter functionality removed
  recentNews: NewsArticle[];
  marketAnomalies: MarketAnomaly[];
};