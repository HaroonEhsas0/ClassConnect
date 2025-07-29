import { Router } from 'express';
import { teslaStorage } from './tesla-storage';
import { ApiService } from './api-services';
import { z } from 'zod';

const router = Router();

// Dashboard data endpoint - main endpoint for the UI
router.get('/api/tesla/dashboard', async (req, res) => {
  try {
    const dashboardData = await teslaStorage.getDashboardData();
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Real-time stock price
router.get('/api/tesla/price', async (req, res) => {
  try {
    const price = await teslaStorage.getLatestStockPrice();
    if (!price) {
      return res.status(404).json({ error: 'No price data available' });
    }
    res.json(price);
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

// Historical price data
router.get('/api/tesla/price/history', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const history = await teslaStorage.getStockPriceHistory(hours);
    res.json(history);
  } catch (error) {
    console.error('Price history error:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// Technical indicators
router.get('/api/tesla/technical', async (req, res) => {
  try {
    const indicators = await teslaStorage.getLatestTechnicalIndicators();
    if (!indicators) {
      return res.status(404).json({ error: 'No technical data available' });
    }
    res.json(indicators);
  } catch (error) {
    console.error('Technical indicators error:', error);
    res.status(500).json({ error: 'Failed to fetch technical indicators' });
  }
});

// Fundamental data
router.get('/api/tesla/fundamentals', async (req, res) => {
  try {
    const fundamentals = await teslaStorage.getLatestFundamentalData();
    if (!fundamentals) {
      return res.status(404).json({ error: 'No fundamental data available' });
    }
    res.json(fundamentals);
  } catch (error) {
    console.error('Fundamentals error:', error);
    res.status(500).json({ error: 'Failed to fetch fundamental data' });
  }
});

// AI predictions
router.get('/api/tesla/prediction', async (req, res) => {
  try {
    const prediction = await teslaStorage.getLatestPrediction();
    if (!prediction) {
      return res.status(404).json({ error: 'No prediction available' });
    }
    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to fetch prediction' });
  }
});

// Prediction history
router.get('/api/tesla/prediction/history', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const history = await teslaStorage.getPredictionHistory(days);
    res.json(history);
  } catch (error) {
    console.error('Prediction history error:', error);
    res.status(500).json({ error: 'Failed to fetch prediction history' });
  }
});

// Insider trades
router.get('/api/tesla/insider-trades', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trades = await teslaStorage.getRecentInsiderTrades(days);
    res.json(trades);
  } catch (error) {
    console.error('Insider trades error:', error);
    res.status(500).json({ error: 'Failed to fetch insider trades' });
  }
});

// Elon Musk tweets and sentiment
router.get('/api/tesla/tweets', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const tweets = await teslaStorage.getRecentTweets(hours);
    res.json(tweets);
  } catch (error) {
    console.error('Tweets error:', error);
    res.status(500).json({ error: 'Failed to fetch tweets' });
  }
});

// Tesla news
router.get('/api/tesla/news', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const news = await teslaStorage.getRecentNews(hours);
    res.json(news);
  } catch (error) {
    console.error('News error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Market anomalies
router.get('/api/tesla/anomalies', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const anomalies = await teslaStorage.getRecentAnomalies(hours);
    res.json(anomalies);
  } catch (error) {
    console.error('Anomalies error:', error);
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
});

// API statistics and health
router.get('/api/tesla/stats', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const stats = await teslaStorage.getApiStats(hours);
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch API stats' });
  }
});

// Manual data refresh endpoint
router.post('/api/tesla/refresh', async (req, res) => {
  try {
    // Start refresh in background
    ApiService.refreshAllData().catch(error => {
      console.error('Background refresh error:', error);
    });
    
    res.json({ message: 'Data refresh initiated' });
  } catch (error) {
    console.error('Refresh initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate data refresh' });
  }
});

// Trading simulation endpoint (for demo purposes)
router.post('/api/tesla/trade', async (req, res) => {
  try {
    const tradeSchema = z.object({
      action: z.enum(['buy', 'sell']),
      shares: z.number().positive(),
      orderType: z.enum(['market', 'limit']),
      limitPrice: z.number().optional(),
    });

    const { action, shares, orderType, limitPrice } = tradeSchema.parse(req.body);
    
    const currentPrice = await teslaStorage.getLatestStockPrice();
    if (!currentPrice) {
      return res.status(400).json({ error: 'Current price not available' });
    }

    const price = orderType === 'limit' ? limitPrice : parseFloat(currentPrice.price);
    const totalValue = shares * price!;

    // Simulate trade execution
    const tradeResult = {
      tradeId: crypto.randomUUID(),
      symbol: 'TSLA',
      action,
      shares,
      price: price!,
      totalValue,
      orderType,
      status: 'executed',
      timestamp: new Date(),
      message: `${action.toUpperCase()} order for ${shares} shares at $${price} executed successfully`,
    };

    res.json(tradeResult);
  } catch (error) {
    console.error('Trade simulation error:', error);
    res.status(400).json({ error: 'Invalid trade request' });
  }
});

export default router;