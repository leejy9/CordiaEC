-- Create contacts table
CREATE TABLE IF NOT EXISTS "contacts" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "email" text NOT NULL,
  "message" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS "news_articles" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "content" text NOT NULL,
  "excerpt" text NOT NULL,
  "published_date" timestamp NOT NULL,
  "image_url" text
);

-- Create initiatives table
CREATE TABLE IF NOT EXISTS "initiatives" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "content" text NOT NULL,
  "image_url" text,
  "category" text NOT NULL
);

-- Create research_papers table
CREATE TABLE IF NOT EXISTS "research_papers" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text NOT NULL,
  "content" text NOT NULL,
  "published_date" timestamp NOT NULL,
  "views" integer DEFAULT 0 NOT NULL,
  "downloads" integer DEFAULT 0 NOT NULL,
  "author" text NOT NULL
);

-- Create history_posts table
CREATE TABLE IF NOT EXISTS "history_posts" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "summary" text NOT NULL,
  "content" text NOT NULL,
  "event_date" timestamp NOT NULL,
  "thumbnail_url" text,
  "link_url" text,
  "is_published" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
