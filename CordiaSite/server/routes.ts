import type { Express } from "express";
import { storage } from "./storage.ts";
import { insertContactSchema } from "../shared/schema.ts";
import { z } from "zod";

export function registerRoutes(app: Express): void {
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
        console.error("Error creating contact:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit contact form",
          error: error instanceof Error ? error.message : String(error)
        });
      }
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
      console.error("Error fetching news articles:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch news articles",
        error: error instanceof Error ? error.message : String(error)
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
      console.error("Error fetching news article:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch news article",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get all initiatives
  app.get("/api/initiatives", async (req, res) => {
    try {
      const initiatives = await storage.getInitiatives();
      res.json({ success: true, initiatives });
    } catch (error) {
      console.error("Error fetching initiatives:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch initiatives",
        error: error instanceof Error ? error.message : String(error)
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
      console.error("Error fetching initiative:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch initiative",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/history", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await storage.getHistoryPosts(page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching history posts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch history posts",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/history/:id", async (req, res) => {
    try {
      const post = await storage.getHistoryPost(req.params.id);
      if (!post) {
        res.status(404).json({
          success: false,
          message: "History post not found"
        });
        return;
      }

      res.json({ success: true, post });
    } catch (error) {
      console.error("Error fetching history post:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch history post",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}
