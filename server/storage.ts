import {
  type Contact, type InsertContact,
  type ResearchPaper, type InsertResearchPaper,
  type NewsArticle, type InsertNewsArticle,
  type OverseasKoreanPost, type InsertOverseasKoreanPost,
  contacts, newsArticles, researchPapers, overseasKoreanPosts
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, sql, count, and, type SQL } from "drizzle-orm";

export interface IStorage {
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;

  // Research Papers
  getResearchPapers(page?: number, limit?: number): Promise<{ papers: ResearchPaper[], total: number }>;
  getResearchPaper(id: string): Promise<ResearchPaper | undefined>;
  incrementResearchPaperViews(id: string): Promise<void>;

  // News Articles
  getNewsArticles(page?: number, limit?: number, category?: string, search?: string): Promise<{ articles: NewsArticle[], total: number }>;
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: string, article: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: string): Promise<void>;

  // Overseas Korean Posts
  getOverseasKoreanPosts(page?: number, limit?: number, search?: string): Promise<{ posts: OverseasKoreanPost[], total: number }>;
  getOverseasKoreanPost(id: string): Promise<OverseasKoreanPost | undefined>;
  createOverseasKoreanPost(post: InsertOverseasKoreanPost): Promise<OverseasKoreanPost>;
  updateOverseasKoreanPost(id: string, post: Partial<InsertOverseasKoreanPost>): Promise<OverseasKoreanPost | undefined>;
  deleteOverseasKoreanPost(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private contacts: Map<string, Contact>;
  private researchPapers: Map<string, ResearchPaper>;
  private newsArticles: Map<string, NewsArticle>;
  private overseasKoreanPosts: Map<string, OverseasKoreanPost>;

  constructor() {
    this.contacts = new Map();
    this.researchPapers = new Map();
    this.newsArticles = new Map();
    this.overseasKoreanPosts = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleArticles: NewsArticle[] = [
      {
        id: "1",
        title: "CordiaEC Announces Strategic Partnership with Tech Innovators",
        excerpt: "CordiaEC has formed a strategic alliance with leading tech innovators.",
        content: "CordiaEC today announced a groundbreaking strategic partnership with several leading technology innovators.",
        publishedDate: new Date("2024-01-15"),
        imageUrl: null,
        linkUrl: null,
        category: null,
      }
    ];
    sampleArticles.forEach(a => this.newsArticles.set(a.id, a));
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = { ...insertContact, id, createdAt: new Date() };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getResearchPapers(page = 1, limit = 10): Promise<{ papers: ResearchPaper[], total: number }> {
    const all = Array.from(this.researchPapers.values()).sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
    const startIndex = (page - 1) * limit;
    return { papers: all.slice(startIndex, startIndex + limit), total: all.length };
  }

  async getResearchPaper(id: string): Promise<ResearchPaper | undefined> {
    return this.researchPapers.get(id);
  }

  async incrementResearchPaperViews(id: string): Promise<void> {
    const paper = this.researchPapers.get(id);
    if (paper) { paper.views += 1; this.researchPapers.set(id, paper); }
  }

  async getNewsArticles(page = 1, limit = 10, category?: string, search?: string): Promise<{ articles: NewsArticle[], total: number }> {
    let all = Array.from(this.newsArticles.values()).sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
    if (category) all = all.filter(a => a.category === category);
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    }
    const startIndex = (page - 1) * limit;
    return { articles: all.slice(startIndex, startIndex + limit), total: all.length };
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const id = randomUUID();
    const newArticle: NewsArticle = {
      ...article,
      id,
      imageUrl: article.imageUrl ?? null,
      linkUrl: article.linkUrl ?? null,
      category: article.category ?? null,
    };
    this.newsArticles.set(id, newArticle);
    return newArticle;
  }

  async updateNewsArticle(id: string, article: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined> {
    const existing = this.newsArticles.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...article };
    this.newsArticles.set(id, updated);
    return updated;
  }

  async deleteNewsArticle(id: string): Promise<void> {
    this.newsArticles.delete(id);
  }

  async getOverseasKoreanPosts(page = 1, limit = 10, search?: string): Promise<{ posts: OverseasKoreanPost[], total: number }> {
    let all = Array.from(this.overseasKoreanPosts.values()).sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
    }
    const startIndex = (page - 1) * limit;
    return { posts: all.slice(startIndex, startIndex + limit), total: all.length };
  }

  async getOverseasKoreanPost(id: string): Promise<OverseasKoreanPost | undefined> {
    return this.overseasKoreanPosts.get(id);
  }

  async createOverseasKoreanPost(post: InsertOverseasKoreanPost): Promise<OverseasKoreanPost> {
    const id = randomUUID();
    const newPost: OverseasKoreanPost = {
      ...post,
      id,
      imageUrl: post.imageUrl ?? null,
      linkUrl: post.linkUrl ?? null,
    };
    this.overseasKoreanPosts.set(id, newPost);
    return newPost;
  }

  async updateOverseasKoreanPost(id: string, post: Partial<InsertOverseasKoreanPost>): Promise<OverseasKoreanPost | undefined> {
    const existing = this.overseasKoreanPosts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...post };
    this.overseasKoreanPosts.set(id, updated);
    return updated;
  }

  async deleteOverseasKoreanPost(id: string): Promise<void> {
    this.overseasKoreanPosts.delete(id);
  }
}

class PostgreSQLStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const client = postgres(process.env.DATABASE_URL!);
    this.db = drizzle(client);
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
    return { papers, total: totalResult[0].count || 0 };
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

  async getNewsArticles(page = 1, limit = 10, category?: string, search?: string): Promise<{ articles: NewsArticle[], total: number }> {
    const offset = (page - 1) * limit;
    const conditions: SQL[] = [];
    if (category) conditions.push(eq(newsArticles.category, category));
    if (search) conditions.push(sql`(LOWER(${newsArticles.title}) LIKE ${'%' + search.toLowerCase() + '%'} OR LOWER(${newsArticles.excerpt}) LIKE ${'%' + search.toLowerCase() + '%'})`);
    const whereClause = conditions.length === 0 ? undefined : conditions.length === 1 ? conditions[0] : and(...conditions);
    const baseQuery = whereClause
      ? this.db.select().from(newsArticles).where(whereClause)
      : this.db.select().from(newsArticles);
    const articles = await baseQuery
      .orderBy(desc(newsArticles.publishedDate))
      .limit(limit)
      .offset(offset);
    const countQuery = whereClause
      ? this.db.select({ count: count() }).from(newsArticles).where(whereClause)
      : this.db.select({ count: count() }).from(newsArticles);
    const totalResult = await countQuery;
    return { articles, total: totalResult[0].count || 0 };
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    const result = await this.db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return result[0];
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [created] = await this.db.insert(newsArticles).values(article).returning();
    return created;
  }

  async updateNewsArticle(id: string, article: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined> {
    const [updated] = await this.db.update(newsArticles).set(article).where(eq(newsArticles.id, id)).returning();
    return updated;
  }

  async deleteNewsArticle(id: string): Promise<void> {
    await this.db.delete(newsArticles).where(eq(newsArticles.id, id));
  }

  async getOverseasKoreanPosts(page = 1, limit = 10, search?: string): Promise<{ posts: OverseasKoreanPost[], total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search
      ? sql`(LOWER(${overseasKoreanPosts.title}) LIKE ${'%' + search.toLowerCase() + '%'} OR LOWER(${overseasKoreanPosts.excerpt}) LIKE ${'%' + search.toLowerCase() + '%'})`
      : undefined;
    const baseQuery = whereClause
      ? this.db.select().from(overseasKoreanPosts).where(whereClause)
      : this.db.select().from(overseasKoreanPosts);
    const posts = await baseQuery
      .orderBy(desc(overseasKoreanPosts.publishedDate))
      .limit(limit)
      .offset(offset);
    const countQuery = whereClause
      ? this.db.select({ count: count() }).from(overseasKoreanPosts).where(whereClause)
      : this.db.select({ count: count() }).from(overseasKoreanPosts);
    const totalResult = await countQuery;
    return { posts, total: totalResult[0].count || 0 };
  }

  async getOverseasKoreanPost(id: string): Promise<OverseasKoreanPost | undefined> {
    const result = await this.db.select().from(overseasKoreanPosts).where(eq(overseasKoreanPosts.id, id));
    return result[0];
  }

  async createOverseasKoreanPost(post: InsertOverseasKoreanPost): Promise<OverseasKoreanPost> {
    const [created] = await this.db.insert(overseasKoreanPosts).values(post).returning();
    return created;
  }

  async updateOverseasKoreanPost(id: string, post: Partial<InsertOverseasKoreanPost>): Promise<OverseasKoreanPost | undefined> {
    const [updated] = await this.db.update(overseasKoreanPosts).set(post).where(eq(overseasKoreanPosts.id, id)).returning();
    return updated;
  }

  async deleteOverseasKoreanPost(id: string): Promise<void> {
    await this.db.delete(overseasKoreanPosts).where(eq(overseasKoreanPosts.id, id));
  }
}

export const storage = new PostgreSQLStorage();
