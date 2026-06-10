-- ============================================================
-- CordiaEC Database Migration
-- Run this once in Supabase Dashboard > SQL Editor
-- ============================================================

-- 기존 테이블 정리 (처음에만 필요)
DROP TABLE IF EXISTS initiatives CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- ① 이니셔티브 (6개 고정, 내용만 수정 가능)
CREATE TABLE initiatives (
  slug        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  label       TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT NOT NULL,
  content     TEXT NOT NULL,
  image_url   TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- ② 게시글 (뉴스 + K-Diaspora 통합)
CREATE TABLE posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board            TEXT NOT NULL CHECK (board IN ('news', 'diaspora')),
  title            TEXT NOT NULL,
  excerpt          TEXT NOT NULL,
  content          TEXT NOT NULL,
  image_url        TEXT,
  link_url         TEXT,
  initiative_slug  TEXT REFERENCES initiatives(slug) ON DELETE SET NULL,
  is_pinned_home   BOOLEAN NOT NULL DEFAULT false,
  published_date   TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ③ 연혁
CREATE TABLE milestones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_label  TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  image_url     TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- ④ 홈/사이트 설정 (key-value)
CREATE TABLE site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ⑤ 문의
CREATE TABLE contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RLS 활성화
-- ============================================================
ALTER TABLE initiatives    ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS 정책
-- ============================================================

-- initiatives: 모두 읽기 / 관리자만 쓰기
CREATE POLICY "initiatives_public_read"  ON initiatives FOR SELECT USING (true);
CREATE POLICY "initiatives_admin_write"  ON initiatives FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- posts: 모두 읽기 / 관리자만 쓰기
CREATE POLICY "posts_public_read"  ON posts FOR SELECT USING (true);
CREATE POLICY "posts_admin_write"  ON posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- milestones: 모두 읽기 / 관리자만 쓰기
CREATE POLICY "milestones_public_read"  ON milestones FOR SELECT USING (true);
CREATE POLICY "milestones_admin_write"  ON milestones FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- site_settings: 모두 읽기 / 관리자만 쓰기
CREATE POLICY "site_settings_public_read"  ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin_write"  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- contacts: 비로그인은 INSERT만 / 읽기·삭제는 관리자만
CREATE POLICY "contacts_public_insert"  ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "contacts_admin_read"     ON contacts FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "contacts_admin_delete"   ON contacts FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- Storage 버킷 (이미지)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- 버킷 정책: 모두 읽기 / 관리자만 업로드·삭제
CREATE POLICY "post_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "post_images_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "post_images_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images' AND auth.role() = 'authenticated'
  );

-- ============================================================
-- 시드 데이터: 이니셔티브 6개
-- ============================================================
INSERT INTO initiatives (slug, title, label, category, description, content, image_url, display_order) VALUES
(
  'k-food', 'K-Food Initiative', 'K-Food', 'Food & Beverage',
  'Showcasing Korean cuisine as a cultural brand with strategic market insights.',
  'The K-Food Initiative bridges innovative Korean food brands with international markets. We partner with producers, restaurants, and cultural institutions to position Korean cuisine as a premium global lifestyle category, providing market intelligence, distribution partnerships, and brand storytelling support.',
  'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1936&auto=format&fit=crop',
  1
),
(
  'k-beauty', 'K-Beauty Initiative', 'K-Beauty', 'Beauty & Cosmetics',
  'Positioning K-Beauty as a global lifestyle movement, not just a product.',
  'Our K-Beauty Initiative supports Korean beauty brands and creators in building durable global presence. From regulatory navigation to retail and digital launches, we help brands tell authentic stories that resonate with international audiences.',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200',
  2
),
(
  'startups', 'Startups Program', 'Startups', 'Technology & Innovation',
  'Connecting diaspora-led startups with Korea''s expertise and global expansion networks.',
  'The Startups Program connects diaspora founders with Korea''s deep technical expertise, manufacturing capabilities, and capital markets. We facilitate partnerships, market entry strategies, and provide a launchpad for cross-border ventures.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200',
  3
),
(
  'vc-matching', 'VC Matching', 'VC Matching', 'Investment & Finance',
  'Bridging Korean ventures with top-tier global investors through trusted partnerships.',
  'VC Matching connects high-potential Korean and Korean-diaspora ventures with global investors. We curate introductions, facilitate due diligence, and structure cross-border investment opportunities backed by long-standing relationships.',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200',
  4
),
(
  'internships', 'Internships Program', 'Internships', 'Education & Development',
  'Empowering next-generation leaders through cross-border career experiences.',
  'Our Internships Program places emerging diaspora talent into Korean and global organizations, building cross-cultural fluency and career pathways. We design programs in collaboration with universities, corporates, and cultural institutions.',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200',
  5
),
(
  'forums', 'Global Summit', 'Knowledge Forums', 'Knowledge & Collaboration',
  'A global stage where Korean Studies meets international collaboration.',
  'Our Knowledge Forums bring together scholars, practitioners, and policymakers in curated summits and working groups. These events generate actionable insights and lasting partnerships at the intersection of Korean expertise and global challenge.',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200',
  6
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 시드 데이터: 연혁 4개
-- ============================================================
INSERT INTO milestones (period_label, title, description, image_url, display_order) VALUES
(
  'Founded in 1985',
  'Founded in 1985',
  'Inha University Institute of International Relations established',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
  1
),
(
  'Expanded in 2022',
  'Expanded in 2022',
  'K-Academic Diffusion Research Center launched to expand academic and cultural initiatives',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
  2
),
(
  'New beginning in 2025',
  'New beginning in 2025',
  'Cordia founded as a global hub, connecting expertise in Korean Studies with business and cultural opportunities',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
  3
),
(
  'Today & Beyond',
  'Today & Beyond',
  'Growing into a trusted platform for global networks and cross-border collaboration',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
  4
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 시드 데이터: 홈 기본 설정
-- ============================================================
INSERT INTO site_settings (key, value) VALUES
  ('home_board_title', 'Latest News'),
  ('home_board_count', '3')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
