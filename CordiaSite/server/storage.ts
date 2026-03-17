import { type Contact, type InsertContact, type ResearchPaper, type NewsArticle, type Initiative, contacts, newsArticles, initiatives, researchPapers } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  
  // Research Papers
  getResearchPapers(page?: number, limit?: number): Promise<{ papers: ResearchPaper[], total: number }>;
  getResearchPaper(id: string): Promise<ResearchPaper | undefined>;
  incrementResearchPaperViews(id: string): Promise<void>;
  
  // News Articles
  getNewsArticles(page?: number, limit?: number): Promise<{ articles: NewsArticle[], total: number }>;
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  
  // Initiatives
  getInitiatives(): Promise<Initiative[]>;
  getInitiative(slug: string): Promise<Initiative | undefined>;
}

// PostgreSQL Storage Implementation
class PostgreSQLStorage implements IStorage {
  private db;

  constructor() {
    const sql = postgres(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await this.db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await this.db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getResearchPapers(page = 1, limit = 10): Promise<{ papers: ResearchPaper[], total: number }> {
    const offset = (page - 1) * limit;
    const papers = await this.db.select().from(researchPapers)
      .orderBy(desc(researchPapers.publishedDate))
      .limit(limit)
      .offset(offset);
    
    const totalResult = await this.db.select({ count: count() }).from(researchPapers);
    const total = totalResult[0].count || 0;
    
    return { papers, total };
  }

  async getResearchPaper(id: string): Promise<ResearchPaper | undefined> {
    const result = await this.db.select().from(researchPapers).where(eq(researchPapers.id, id));
    return result[0];
  }

  async incrementResearchPaperViews(id: string): Promise<void> {
    await this.db.update(researchPapers)
      .set({ views: sql`${researchPapers.views} + 1` })
      .where(eq(researchPapers.id, id));
  }

  async getNewsArticles(page = 1, limit = 10): Promise<{ articles: NewsArticle[], total: number }> {
    const offset = (page - 1) * limit;
    const articles = await this.db.select().from(newsArticles)
      .orderBy(desc(newsArticles.publishedDate))
      .limit(limit)
      .offset(offset);
    
    const totalResult = await this.db.select({ count: count() }).from(newsArticles);
    const total = totalResult[0].count || 0;
    
    return { articles, total };
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    const result = await this.db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return result[0];
  }

  async getInitiatives(): Promise<Initiative[]> {
    return await this.db.select().from(initiatives);
  }

  async getInitiative(slug: string): Promise<Initiative | undefined> {
    const result = await this.db.select().from(initiatives).where(eq(initiatives.slug, slug));
    return result[0];
  }
}

export const storage = new PostgreSQLStorage();
