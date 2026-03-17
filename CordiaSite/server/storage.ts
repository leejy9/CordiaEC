import { type Contact, type InsertContact, type ResearchPaper, type NewsArticle, type Initiative, type HistoryPost, contacts, newsArticles, initiatives, researchPapers, historyPosts } from "../shared/schema.ts";
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

  // History
  getHistoryPosts(page?: number, limit?: number): Promise<{ posts: HistoryPost[], total: number }>;
  getHistoryPost(id: string): Promise<HistoryPost | undefined>;
}

// PostgreSQL Storage Implementation
class PostgreSQLStorage implements IStorage {
  private db: ReturnType<typeof drizzle> | null = null;

  private getDb() {
    if (this.db) {
      return this.db;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set. Please configure it in Vercel or your .env file.");
    }

    const sql = postgres(databaseUrl);
    this.db = drizzle(sql);
    return this.db;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const db = this.getDb();
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    const db = this.getDb();
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getResearchPapers(page = 1, limit = 10): Promise<{ papers: ResearchPaper[], total: number }> {
    const db = this.getDb();
    const offset = (page - 1) * limit;
    const papers = await db.select().from(researchPapers)
      .orderBy(desc(researchPapers.publishedDate))
      .limit(limit)
      .offset(offset);
    
    const totalResult = await db.select({ count: count() }).from(researchPapers);
    const total = totalResult[0].count || 0;
    
    return { papers, total };
  }

  async getResearchPaper(id: string): Promise<ResearchPaper | undefined> {
    const db = this.getDb();
    const result = await db.select().from(researchPapers).where(eq(researchPapers.id, id));
    return result[0];
  }

  async incrementResearchPaperViews(id: string): Promise<void> {
    const db = this.getDb();
    await db.update(researchPapers)
      .set({ views: sql`${researchPapers.views} + 1` })
      .where(eq(researchPapers.id, id));
  }

  async getNewsArticles(page = 1, limit = 10): Promise<{ articles: NewsArticle[], total: number }> {
    const db = this.getDb();
    const offset = (page - 1) * limit;
    const articles = await db.select().from(newsArticles)
      .orderBy(desc(newsArticles.publishedDate))
      .limit(limit)
      .offset(offset);
    
    const totalResult = await db.select({ count: count() }).from(newsArticles);
    const total = totalResult[0].count || 0;
    
    return { articles, total };
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    const db = this.getDb();
    const result = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return result[0];
  }

  async getInitiatives(): Promise<Initiative[]> {
    const db = this.getDb();
    return await db.select().from(initiatives);
  }

  async getInitiative(slug: string): Promise<Initiative | undefined> {
    const db = this.getDb();
    const result = await db.select().from(initiatives).where(eq(initiatives.slug, slug));
    return result[0];
  }

  async getHistoryPosts(page = 1, limit = 10): Promise<{ posts: HistoryPost[], total: number }> {
    const db = this.getDb();
    const offset = (page - 1) * limit;
    const posts = await db.select().from(historyPosts)
      .orderBy(historyPosts.sortOrder, desc(historyPosts.eventDate))
      .limit(limit)
      .offset(offset);

    const totalResult = await db.select({ count: count() }).from(historyPosts);
    const total = totalResult[0].count || 0;

    return { posts, total };
  }

  async getHistoryPost(id: string): Promise<HistoryPost | undefined> {
    const db = this.getDb();
    const result = await db.select().from(historyPosts).where(eq(historyPosts.id, id));
    return result[0];
  }
}

export const storage = new PostgreSQLStorage();
