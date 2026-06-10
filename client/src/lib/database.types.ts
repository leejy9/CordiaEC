export interface Initiative {
  slug: string;
  title: string;
  label: string;
  category: string;
  description: string;
  content: string;
  image_url: string | null;
  display_order: number;
}

export interface Post {
  id: string;
  board: "news" | "diaspora";
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  link_url: string | null;
  initiative_slug: string | null;
  is_pinned_home: boolean;
  published_date: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  period_label: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
}

export interface SiteSetting {
  key: string;
  value: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// supabase-js가 요구하는 Database 제네릭 타입
export type Database = {
  public: {
    Tables: {
      initiatives: {
        Row: Initiative;
        Insert: Initiative;
        Update: Partial<Initiative>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at">;
        Update: Partial<Omit<Post, "id" | "created_at">>;
      };
      milestones: {
        Row: Milestone;
        Insert: Omit<Milestone, "id">;
        Update: Partial<Omit<Milestone, "id">>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: SiteSetting;
        Update: Pick<SiteSetting, "value">;
      };
      contacts: {
        Row: Contact;
        Insert: Omit<Contact, "id" | "created_at">;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
