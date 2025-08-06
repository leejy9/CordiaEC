import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission
  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid form data",
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit contact form" 
        });
      }
    }
  });

  // Get research papers with pagination
  app.get("/api/research", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await storage.getResearchPapers(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch research papers" 
      });
    }
  });

  // Get single research paper
  app.get("/api/research/:id", async (req, res) => {
    try {
      const paper = await storage.getResearchPaper(req.params.id);
      if (!paper) {
        res.status(404).json({ 
          success: false, 
          message: "Research paper not found" 
        });
        return;
      }
      
      // Increment view count
      await storage.incrementResearchPaperViews(req.params.id);
      
      res.json({ success: true, paper });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch research paper" 
      });
    }
  });

  // Get news articles with pagination
  app.get("/api/news", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await storage.getNewsArticles(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch news articles" 
      });
    }
  });

  // Get single news article
  app.get("/api/news/:id", async (req, res) => {
    try {
      const article = await storage.getNewsArticle(req.params.id);
      if (!article) {
        res.status(404).json({ 
          success: false, 
          message: "News article not found" 
        });
        return;
      }
      res.json({ success: true, article });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch news article" 
      });
    }
  });

  // Get all initiatives
  app.get("/api/initiatives", async (req, res) => {
    try {
      const initiatives = await storage.getInitiatives();
      res.json({ success: true, initiatives });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch initiatives" 
      });
    }
  });

  // Get single initiative by slug
  app.get("/api/initiatives/:slug", async (req, res) => {
    try {
      const initiative = await storage.getInitiative(req.params.slug);
      if (!initiative) {
        res.status(404).json({ 
          success: false, 
          message: "Initiative not found" 
        });
        return;
      }
      res.json({ success: true, initiative });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch initiative" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
