-- 2026-06-11 증분 마이그레이션 (이미 적용됨 — 기록용)
-- hero_slides, popups 테이블 + RLS + 시드
-- ⚠️ migration.sql 전체 재실행 금지 (기존 데이터 삭제됨)

CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  headline TEXT NOT NULL,
  sub_lines TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'center'
    CHECK (position IN ('center','top-left','top-right','bottom-left','bottom-right')),
  width INTEGER NOT NULL DEFAULT 380,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hero_slides_public_read" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "hero_slides_admin_write" ON hero_slides FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "popups_public_read" ON popups FOR SELECT USING (true);
CREATE POLICY "popups_admin_write" ON popups FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

INSERT INTO hero_slides (image_url, headline, sub_lines, display_order) VALUES (
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
  'Global Bridges, Rooted in Korean Studies',
  E'Cordia links knowledge, people, and opportunities for those seeking a deeper understanding of Korea.\nWith expertise rooted in Korean Studies, we provide insights, partnerships, and cultural context.\nOur mission is to bridge local expertise with international networks across culture, business, and education.',
  1
);

INSERT INTO site_settings (key, value) VALUES ('hero_interval', '5')
ON CONFLICT (key) DO NOTHING;
