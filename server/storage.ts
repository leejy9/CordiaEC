import { type Contact, type InsertContact, type ResearchPaper, type InsertResearchPaper, type NewsArticle, type InsertNewsArticle, type Initiative, type InsertInitiative, contacts, newsArticles, initiatives, researchPapers } from "@shared/schema";
import { randomUUID } from "crypto";
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

export class MemStorage implements IStorage {
  private contacts: Map<string, Contact>;
  private researchPapers: Map<string, ResearchPaper>;
  private newsArticles: Map<string, NewsArticle>;
  private initiatives: Map<string, Initiative>;

  constructor() {
    this.contacts = new Map();
    this.researchPapers = new Map();
    this.newsArticles = new Map();
    this.initiatives = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample Research Papers
    const samplePapers: ResearchPaper[] = [
      {
        id: "1",
        title: "Advancements in Cardiac Care",
        description: "Comprehensive analysis of emerging cardiac treatment methodologies",
        content: "This research paper explores the latest developments in cardiac care, including minimally invasive procedures, advanced diagnostic techniques, and patient outcome improvements. The study presents findings from a multi-center clinical trial involving over 1,000 patients.",
        publishedDate: new Date("2023-01-15"),
        views: 1200,
        downloads: 85,
        author: "Dr. Sarah Johnson, MD"
      },
      {
        id: "2", 
        title: "Innovations in Heart Surgery",
        description: "Revolutionary surgical techniques and patient outcomes",
        content: "This paper examines breakthrough surgical techniques in cardiac surgery, focusing on robotic-assisted procedures and their impact on patient recovery times and surgical precision.",
        publishedDate: new Date("2023-02-20"),
        views: 1500,
        downloads: 92,
        author: "Dr. Michael Chen, MD"
      },
      {
        id: "3",
        title: "Cardiovascular Disease Prevention",
        description: "Preventive strategies and community health initiatives",
        content: "A comprehensive study on cardiovascular disease prevention strategies, examining the effectiveness of community-based health programs and lifestyle interventions.",
        publishedDate: new Date("2023-03-25"),
        views: 1800,
        downloads: 76,
        author: "Dr. Emily Rodriguez, PhD"
      }
    ];

    samplePapers.forEach(paper => this.researchPapers.set(paper.id, paper));

    // Sample News Articles
    const sampleArticles: NewsArticle[] = [
      {
        id: "1",
        title: "CordiaEC Announces Strategic Partnership with Tech Innovators",
        excerpt: "CordiaEC has formed a strategic alliance with leading tech innovators to enhance its product offerings and expand its market reach.",
        content: "CordiaEC today announced a groundbreaking strategic partnership with several leading technology innovators to enhance its product offerings and expand its global market reach. This collaboration will focus on developing next-generation solutions for healthcare, sustainable energy, and digital transformation initiatives.",
        publishedDate: new Date("2024-01-15"),
        imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
      },
      {
        id: "2",
        title: "CordiaEC Launches New Suite of AI-Powered Solutions",
        excerpt: "CordiaEC has introduced a new suite of AI-powered solutions designed to help businesses optimize their operations and drive growth.",
        content: "CordiaEC has unveiled its latest suite of artificial intelligence-powered solutions designed to revolutionize how businesses operate and compete in the global marketplace. These innovative tools leverage machine learning and advanced analytics to provide unprecedented insights and automation capabilities.",
        publishedDate: new Date("2024-01-10"),
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
      },
      {
        id: "3",
        title: "CordiaEC Recognized as Industry Leader in Cloud Computing",
        excerpt: "CordiaEC has been recognized as an industry leader in cloud computing, earning accolades for its innovative solutions and customer satisfaction.",
        content: "CordiaEC has received prestigious industry recognition as a leader in cloud computing solutions, highlighting the company's commitment to innovation, customer satisfaction, and technological excellence. The award recognizes CordiaEC's significant contributions to advancing cloud infrastructure and services.",
        publishedDate: new Date("2024-01-05"),
        imageUrl: null
      },
      {
        id: "4",
        title: "Global Expansion: CordiaEC Opens New Offices in Europe",
        excerpt: "CordiaEC continues its global expansion with new offices in London, Berlin, and Paris to better serve European clients.",
        content: "CordiaEC announced the opening of three new European offices in London, Berlin, and Paris as part of its strategic global expansion initiative. These new locations will enhance CordiaEC's ability to serve European clients and partners, providing localized support and strengthening the company's presence in key European markets.",
        publishedDate: new Date("2023-12-20"),
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
      },
      {
        id: "5",
        title: "CordiaEC Launches Sustainability Initiative",
        excerpt: "CordiaEC commits to environmental sustainability with new green technology initiatives and carbon neutrality goals.",
        content: "CordiaEC has launched a comprehensive sustainability initiative aimed at achieving carbon neutrality by 2025. The program includes investments in green technology, renewable energy adoption, and sustainable business practices across all operations. This commitment reflects CordiaEC's dedication to environmental responsibility and sustainable business growth.",
        publishedDate: new Date("2023-12-15"),
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
      },
      {
        id: "6",
        title: "CordiaEC Wins Innovation Award at Tech Conference",
        excerpt: "CordiaEC's groundbreaking technology solutions earned recognition at the prestigious Global Tech Innovation Conference.",
        content: "CordiaEC was honored with the Innovation Excellence Award at the Global Tech Innovation Conference for its revolutionary approach to digital transformation solutions. The award recognizes CordiaEC's pioneering work in developing next-generation technology platforms that help businesses adapt to the rapidly evolving digital landscape.",
        publishedDate: new Date("2023-12-10"),
        imageUrl: null
      },
      {
        id: "7",
        title: "New Research and Development Center Opens",
        excerpt: "CordiaEC inaugurates state-of-the-art R&D facility to accelerate innovation in emerging technologies.",
        content: "CordiaEC has officially opened its new state-of-the-art Research and Development center, equipped with cutting-edge laboratories and collaborative spaces designed to accelerate innovation in artificial intelligence, machine learning, and emerging technologies. The facility will house over 200 researchers and engineers working on next-generation solutions.",
        publishedDate: new Date("2023-12-05"),
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
      },
      {
        id: "8",
        title: "CordiaEC Partners with Leading Universities",
        excerpt: "Strategic partnerships with top universities worldwide to advance research and develop next-generation talent.",
        content: "CordiaEC announced strategic partnerships with leading universities across the globe to advance cutting-edge research and develop the next generation of technological talent. These collaborations will focus on joint research projects, student exchange programs, and the development of innovative educational curricula that prepare students for future technology challenges.",
        publishedDate: new Date("2023-11-30"),
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
      },
      {
        id: "9",
        title: "CordiaEC Achieves Security Certification Milestone",
        excerpt: "CordiaEC earns prestigious international security certifications, reinforcing commitment to data protection and cybersecurity.",
        content: "CordiaEC has successfully achieved multiple prestigious international security certifications, including ISO 27001 and SOC 2 Type II, reinforcing the company's unwavering commitment to data protection and cybersecurity excellence. These certifications demonstrate CordiaEC's dedication to maintaining the highest standards of information security.",
        publishedDate: new Date("2023-11-25"),
        imageUrl: null
      },
      {
        id: "10",
        title: "CordiaEC Hosts Annual Innovation Summit",
        excerpt: "Industry leaders gather at CordiaEC's annual summit to discuss emerging technologies and future trends.",
        content: "CordiaEC successfully hosted its annual Innovation Summit, bringing together industry leaders, technology pioneers, and visionary entrepreneurs to discuss emerging technologies and future trends. The three-day event featured keynote presentations, panel discussions, and networking opportunities that fostered collaboration and knowledge sharing across industries.",
        publishedDate: new Date("2023-11-20"),
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
      }
    ];

    sampleArticles.forEach(article => this.newsArticles.set(article.id, article));

    // Sample Initiatives
    const sampleInitiatives: Initiative[] = [
      {
        id: "1",
        slug: "k-food",
        title: "K-Food Initiative",
        description: "Connecting Korean food brands with global buyers and distribution channels for international market expansion.",
        content: "The K-Food Initiative is designed to bridge the gap between innovative Korean food brands and international markets. Our comprehensive program provides market research, regulatory compliance support, distribution channel development, and strategic partnerships to help Korean food companies successfully expand globally. We work with local distributors, retailers, and food service providers to create sustainable market entry strategies.",
        imageUrl: null,
        category: "Food & Beverage"
      },
      {
        id: "2",
        slug: "k-beauty",
        title: "K-Beauty Initiative",
        description: "Empowering K-Beauty brands to certify and launch in overseas markets with comprehensive market entry support.",
        content: "Our K-Beauty Initiative provides comprehensive support for Korean beauty brands looking to enter international markets. We offer regulatory guidance, certification support, market analysis, and partnership development to ensure successful market entry and sustainable growth in the global beauty industry.",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        category: "Beauty & Cosmetics"
      },
      {
        id: "3",
        slug: "startups",
        title: "Startups Program",
        description: "Mentoring and funding diaspora-led startups for global expansion with strategic partnership opportunities.",
        content: "The Startups Program focuses on supporting diaspora-led startups with mentoring, funding opportunities, and strategic partnerships. We provide access to global networks, investor connections, and market development resources to help innovative startups scale internationally.",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        category: "Technology & Innovation"
      },
      {
        id: "4",
        slug: "vc-matching",
        title: "VC Matching",
        description: "Bridging innovative companies with top international venture capital for strategic investment opportunities.",
        content: "Our VC Matching program connects innovative companies with leading international venture capital firms. We facilitate strategic investment opportunities through our extensive network of investors, providing companies with access to capital, expertise, and global market opportunities.",
        imageUrl: null,
        category: "Investment & Finance"
      },
      {
        id: "5",
        slug: "internships",
        title: "Internships Program",
        description: "Offering cross-border internship opportunities for Korean diaspora youth in international organizations.",
        content: "The Internships Program creates valuable cross-border internship opportunities for Korean diaspora youth in leading international organizations. We partner with global companies, NGOs, and government agencies to provide meaningful work experiences that build career foundations and cultural bridges.",
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        category: "Education & Development"
      },
      {
        id: "6",
        slug: "forums",
        title: "Knowledge Forums",
        description: "Fostering knowledge exchange through online and offline seminars & forums for industry collaboration.",
        content: "Our Knowledge Forums facilitate meaningful knowledge exchange through both online and offline seminars, conferences, and collaborative forums. These platforms bring together industry leaders, researchers, and innovators to share insights, discuss trends, and develop collaborative solutions to global challenges.",
        imageUrl: null,
        category: "Knowledge & Collaboration"
      }
    ];

    sampleInitiatives.forEach(initiative => this.initiatives.set(initiative.id, initiative));
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = { 
      ...insertContact, 
      id, 
      createdAt: new Date() 
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getResearchPapers(page = 1, limit = 10): Promise<{ papers: ResearchPaper[], total: number }> {
    const allPapers = Array.from(this.researchPapers.values()).sort(
      (a, b) => b.publishedDate.getTime() - a.publishedDate.getTime()
    );
    const total = allPapers.length;
    const startIndex = (page - 1) * limit;
    const papers = allPapers.slice(startIndex, startIndex + limit);
    return { papers, total };
  }

  async getResearchPaper(id: string): Promise<ResearchPaper | undefined> {
    return this.researchPapers.get(id);
  }

  async incrementResearchPaperViews(id: string): Promise<void> {
    const paper = this.researchPapers.get(id);
    if (paper) {
      paper.views += 1;
      this.researchPapers.set(id, paper);
    }
  }

  async getNewsArticles(page = 1, limit = 10): Promise<{ articles: NewsArticle[], total: number }> {
    const allArticles = Array.from(this.newsArticles.values()).sort(
      (a, b) => b.publishedDate.getTime() - a.publishedDate.getTime()
    );
    const total = allArticles.length;
    const startIndex = (page - 1) * limit;
    const articles = allArticles.slice(startIndex, startIndex + limit);
    return { articles, total };
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }

  async getInitiatives(): Promise<Initiative[]> {
    return Array.from(this.initiatives.values());
  }

  async getInitiative(slug: string): Promise<Initiative | undefined> {
    return Array.from(this.initiatives.values()).find(
      (initiative) => initiative.slug === slug
    );
  }
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

// Use PostgreSQL storage instead of MemStorage
export const storage = new PostgreSQLStorage();
