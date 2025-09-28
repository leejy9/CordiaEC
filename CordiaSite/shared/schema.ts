import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchPapers = pgTable("research_papers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  publishedDate: timestamp("published_date").notNull(),
  views: integer("views").default(0).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  author: text("author").notNull(),
});

export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  publishedDate: timestamp("published_date").notNull(),
  imageUrl: text("image_url"),
});

export const initiatives = pgTable("initiatives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertResearchPaperSchema = createInsertSchema(researchPapers).omit({
  id: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
});

export const insertInitiativeSchema = createInsertSchema(initiatives).omit({
  id: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertResearchPaper = z.infer<typeof insertResearchPaperSchema>;
export type ResearchPaper = typeof researchPapers.$inferSelect;

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

export type InsertInitiative = z.infer<typeof insertInitiativeSchema>;
export type Initiative = typeof initiatives.$inferSelect;
