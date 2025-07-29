import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, type SearchFilters } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
