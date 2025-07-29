import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, type SearchFilters } from "@shared/schema";
import { teslaStorage } from "./tesla-storage";
import { ApiService } from "./api-services";
import { CronService } from "./cron-service";
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // Search classes
  app.get("/api/classes/search", async (req, res) => {
    try {
      const filters: SearchFilters = {
        query: req.query.query as string,
        category: req.query.category as string,
        location: req.query.location as string,
        priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
        availableToday: req.query.availableToday === 'true',
        availableThisWeek: req.query.availableThisWeek === 'true',
        weekendsOnly: req.query.weekendsOnly === 'true'
      };

      const classes = await storage.searchClasses(filters);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to search classes" });
    }
  });

  // Get class by ID
  app.get("/api/classes/:id", async (req, res) => {
    try {
      const classWithDetails = await storage.getClassWithDetails(req.params.id);
      if (!classWithDetails) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(classWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch class details" });
    }
  });

  // Get chat messages
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Send chat message
  app.post("/api/chat/:sessionId", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        sessionId: req.params.sessionId
      });
      
      const message = await storage.createChatMessage(validatedData);
      
      // Simulate support response
      if (validatedData.isFromUser) {
        setTimeout(async () => {
          const responses = [
            "Thanks for your question! How can I help you today?",
            "I'd be happy to help you find the perfect class. What are you interested in learning?",
            "Great question! Let me find that information for you.",
            "I can definitely help with that. What specific details would you like to know?"
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          await storage.createChatMessage({
            message: randomResponse,
            isFromUser: false,
            sessionId: req.params.sessionId
          });
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
      }
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid chat message data" });
    }
  });

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

  // Real-time stock price
  app.get('/api/amd/price', async (req, res) => {
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

  // Elon Musk tweets and sentiment
  app.get('/api/amd/tweets', async (req, res) => {
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
  app.get('/api/amd/news', async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const news = await teslaStorage.getRecentNews(hours);
      res.json(news);
    } catch (error) {
      console.error('News error:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
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

  // Start CRON jobs for Tesla data updates
  CronService.start();

  const httpServer = createServer(app);
  return httpServer;
}
