import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertNewsArticleSchema, insertInitiativeSchema, insertOverseasKoreanPostSchema } from "@shared/schema";
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
        res.status(400).json({ success: false, message: "Invalid form data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Failed to submit contact form" });
      }
    }
  });

  // Get all contacts (admin)
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json({ success: true, contacts });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch contacts" });
    }
  });

  // ---- News Articles ----
  app.get("/api/news", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = (req.query.category as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const result = await storage.getNewsArticles(page, limit, category, search);
      res.json(result);
    } catch (error) {
      console.error("News fetch error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch news articles" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const article = await storage.getNewsArticle(req.params.id);
      if (!article) {
        res.status(404).json({ success: false, message: "News article not found" });
        return;
      }
      res.json({ success: true, article });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch news article" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const validatedData = insertNewsArticleSchema.parse(req.body);
      const article = await storage.createNewsArticle(validatedData);
      res.json({ success: true, article });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Failed to create news article" });
      }
    }
  });

  app.put("/api/news/:id", async (req, res) => {
    try {
      const partial = insertNewsArticleSchema.partial().parse(req.body);
      const article = await storage.updateNewsArticle(req.params.id, partial);
      if (!article) {
        res.status(404).json({ success: false, message: "News article not found" });
        return;
      }
      res.json({ success: true, article });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Failed to update news article" });
      }
    }
  });

  app.delete("/api/news/:id", async (req, res) => {
    try {
      await storage.deleteNewsArticle(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to delete news article" });
    }
  });

  // ---- Initiatives ----
  app.get("/api/initiatives", async (req, res) => {
    try {
      const initiatives = await storage.getInitiatives();
      res.json({ success: true, initiatives });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch initiatives" });
    }
  });

  app.get("/api/initiatives/:slug", async (req, res) => {
    try {
      const initiative = await storage.getInitiative(req.params.slug);
      if (!initiative) {
        res.status(404).json({ success: false, message: "Initiative not found" });
        return;
      }
      res.json({ success: true, initiative });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch initiative" });
    }
  });

  app.post("/api/initiatives", async (req, res) => {
    try {
      const validatedData = insertInitiativeSchema.parse(req.body);
      const initiative = await storage.createInitiative(validatedData);
      res.json({ success: true, initiative });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Failed to create initiative" });
      }
    }
  });

  app.put("/api/initiatives/:id", async (req, res) => {
    try {
      const partial = insertInitiativeSchema.partial().parse(req.body);
      const initiative = await storage.updateInitiative(req.params.id, partial);
      if (!initiative) {
        res.status(404).json({ success: false, message: "Initiative not found" });
        return;
      }
      res.json({ success: true, initiative });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Failed to update initiative" });
      }
    }
  });

  app.delete("/api/initiatives/:id", async (req, res) => {
    try {
      await storage.deleteInitiative(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to delete initiative" });
    }
  });

  // ---- Overseas Korean Posts ----
  app.get("/api/overseas-korean", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || undefined;
      const result = await storage.getOverseasKoreanPosts(page, limit, search);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch posts" });
    }
  });

  app.get("/api/overseas-korean/:id", async (req, res) => {
    try {
      const post = await storage.getOverseasKoreanPost(req.params.id);
      if (!post) {
        res.status(404).json({ success: false, message: "Post not found" });
        return;
      }
      res.json({ success: true, post });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch post" });
    }
  });

  app.post("/api/overseas-korean", async (req, res) => {
    try {
      const validatedData = insertOverseasKoreanPostSchema.parse(req.body);
      const post = await storage.createOverseasKoreanPost(validatedData);
      res.json({ success: true, post });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Failed to create post" });
      }
    }
  });

  app.put("/api/overseas-korean/:id", async (req, res) => {
    try {
      const partial = insertOverseasKoreanPostSchema.partial().parse(req.body);
      const post = await storage.updateOverseasKoreanPost(req.params.id, partial);
      if (!post) {
        res.status(404).json({ success: false, message: "Post not found" });
        return;
      }
      res.json({ success: true, post });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Failed to update post" });
      }
    }
  });

  app.delete("/api/overseas-korean/:id", async (req, res) => {
    try {
      await storage.deleteOverseasKoreanPost(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to delete post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
