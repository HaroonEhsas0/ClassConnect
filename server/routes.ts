import type { Express } from "express";
import { createServer, type Server } from "http";
// Removed storage import - using tesla-storage for AMD system
import { insertChatMessageSchema, type SearchFilters } from "@shared/schema";
import { teslaStorage } from "./tesla-storage";
import { ApiService } from "./api-services";
import { CronService } from "./cron-service";
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // AMD Stock Prediction System - Class endpoints removed
  // This is now an AMD Stock Prediction System, not a class booking system

  // Chat functionality removed - AMD Stock Prediction System only

  // ========================================
  // TESLA TRADING ASSISTANT API ROUTES
  // ========================================

  // Dashboard data endpoint - main endpoint for the UI
  app.get('/api/amd/dashboard', async (req, res) => {
    try {
      const dashboardData = await teslaStorage.getDashboardData();
      res.json(dashboardData);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  // Real-time stock price with optional refresh
  app.get('/api/amd/price', async (req, res) => {
    try {
      // Check if refresh is requested
      if (req.query.refresh === 'true') {
        console.log('🔄 Force refreshing AMD stock data...');
        await ApiService.fetchStockData();
      }
      
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

  // Force refresh all AMD data (real-time endpoint)
  app.post('/api/amd/refresh', async (req, res) => {
    try {
      console.log('🔄 Force refreshing all AMD data...');
      await Promise.all([
        ApiService.fetchStockData(),
        ApiService.fetchRealTimeAmdData()
      ]);
      
      const dashboardData = await teslaStorage.getDashboardData();
      res.json({ 
        success: true, 
        message: 'Data refreshed successfully',
        data: dashboardData 
      });
    } catch (error) {
      console.error('Force refresh error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to refresh data',
        message: (error as Error).message 
      });
    }
  });

  // AI predictions
  app.get('/api/amd/prediction', async (req, res) => {
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

  // Insider trades
  app.get('/api/amd/insider-trades', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const trades = await teslaStorage.getRecentInsiderTrades(days);
      res.json(trades);
    } catch (error) {
      console.error('Insider trades error:', error);
      res.status(500).json({ error: 'Failed to fetch insider trades' });
    }
  });





  // Manual data refresh endpoint
  app.post('/api/amd/refresh', async (req, res) => {
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
  app.post('/api/amd/trade', async (req, res) => {
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

  // AMD price history endpoint
  app.get('/api/amd/price/history/:hours', async (req, res) => {
    try {
      const hours = parseInt(req.params.hours) || 24;
      const history = await teslaStorage.getStockPriceHistory(hours);
      res.json(history);
    } catch (error) {
      console.error('AMD price history error:', error);
      res.status(500).json({ error: 'Failed to fetch AMD price history' });
    }
  });

  // Tesla endpoints for legacy chart components - using AMD data
  app.get('/api/tesla/price/history/:hours', async (req, res) => {
    try {
      const hours = parseInt(req.params.hours) || 24;
      const history = await teslaStorage.getStockPriceHistory(hours);
      res.json(history);
    } catch (error) {
      console.error('Tesla price history error:', error);
      res.status(500).json({ error: 'Failed to fetch price history' });
    }
  });

  app.get('/api/tesla/price/history', async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const history = await teslaStorage.getStockPriceHistory(hours);
      res.json(history);
    } catch (error) {
      console.error('Tesla price history error:', error);
      res.status(500).json({ error: 'Failed to fetch price history' });
    }
  });

  // Start CRON jobs for AMD data updates  
  CronService.start();

  const httpServer = createServer(app);
  return httpServer;
}
