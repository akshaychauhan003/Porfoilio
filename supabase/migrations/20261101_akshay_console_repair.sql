-- ════════════════════════════════════════════════════════════════
-- Akshay Console — Production repair migration (2026-11-01)
-- Run once in Supabase SQL Editor against project vppkucipdfbshqxjwlcx
-- Safe / idempotent: adds missing columns, enables Realtime, tightens RLS
-- Does NOT drop data
-- ════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. EXPERIENCES — missing columns (root cause of CRUD cloud failure)
-- Live schema previously only had:
--   id, role, company, location, duration, description, order_index, created_at
-- Client was sending category/video_url/live_url/is_active → PostgREST PGRST204
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'office';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS live_url TEXT DEFAULT '';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Backfill category from legacy location tags: "Remote [freelance]"
UPDATE public.experiences
SET category = 'freelance'
WHERE category IS DISTINCT FROM 'freelance'
  AND (
    location ILIKE '%[freelance]%'
    OR role ILIKE '%freelance%'
    OR company ILIKE '%travoqix%'
    OR company ILIKE '%krisha%'
  );

UPDATE public.experiences
SET category = 'office'
WHERE category IS NULL OR category = '';

-- Strip category tags from location display text (keep clean city/remote string)
UPDATE public.experiences
SET location = TRIM(REGEXP_REPLACE(COALESCE(location, ''), '\s*\[(freelance|office)\]\s*', '', 'gi'))
WHERE location ~* '\[(freelance|office)\]';

-- Known showcase media for seeded freelance entries (only fill when empty)
UPDATE public.experiences
SET video_url = COALESCE(NULLIF(video_url, ''), 'assets/videos/Travoqix.mp4'),
    live_url = COALESCE(NULLIF(live_url, ''), 'https://travoqix.in/')
WHERE company ILIKE '%travoqix%'
  AND (COALESCE(video_url, '') = '' OR COALESCE(live_url, '') = '');

UPDATE public.experiences SET is_active = TRUE WHERE is_active IS NULL;

CREATE INDEX IF NOT EXISTS idx_experiences_order ON public.experiences(order_index ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON public.experiences(category);

-- ─────────────────────────────────────────────────────────────
-- 2. PROJECTS — ensure optional columns exist
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS card_color TEXT DEFAULT '#3d8bff';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS preview_type TEXT DEFAULT 'video';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS live_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';

UPDATE public.projects SET is_active = TRUE WHERE is_active IS NULL;

CREATE INDEX IF NOT EXISTS idx_projects_order ON public.projects(order_index ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_active ON public.projects(is_active);

-- ─────────────────────────────────────────────────────────────
-- 3. CONTACT / REVIEWS — ensure moderation columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'contact_form';
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';

ALTER TABLE public.client_reviews ADD COLUMN IF NOT EXISTS company_website TEXT DEFAULT '';
ALTER TABLE public.client_reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.client_reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- ─────────────────────────────────────────────────────────────
-- 4. REALTIME — required for cross-device inbox/review sync
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.experiences REPLICA IDENTITY FULL;
ALTER TABLE public.client_reviews REPLICA IDENTITY FULL;
ALTER TABLE public.contact_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'projects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'experiences'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.experiences;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'client_reviews'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.client_reviews;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'contact_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 5. RLS — replace open "Allow full access … TO anon" policies
-- Public: read published content + submit messages/reviews
-- Admin: authenticated role only (Supabase Auth email/password)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

REVOKE ALL ON public.projects FROM anon;
REVOKE ALL ON public.experiences FROM anon;
REVOKE ALL ON public.client_reviews FROM anon;
REVOKE ALL ON public.contact_messages FROM anon;

GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.experiences TO anon;
GRANT SELECT, INSERT ON public.client_reviews TO anon;
GRANT INSERT ON public.contact_messages TO anon;

GRANT ALL ON public.projects TO authenticated, service_role;
GRANT ALL ON public.experiences TO authenticated, service_role;
GRANT ALL ON public.client_reviews TO authenticated, service_role;
GRANT ALL ON public.contact_messages TO authenticated, service_role;

-- Drop known legacy / open policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('projects', 'experiences', 'client_reviews', 'contact_messages')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

CREATE POLICY "Public can view active projects"
    ON public.projects FOR SELECT TO anon
    USING (COALESCE(is_active, true) = true);

CREATE POLICY "Admin has full access to projects"
    ON public.projects FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active experiences"
    ON public.experiences FOR SELECT TO anon
    USING (COALESCE(is_active, true) = true);

CREATE POLICY "Admin has full access to experiences"
    ON public.experiences FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Public can view approved reviews"
    ON public.client_reviews FOR SELECT TO anon
    USING (status = 'approved');

CREATE POLICY "Public can submit pending reviews"
    ON public.client_reviews FOR INSERT TO anon
    WITH CHECK (status = 'pending' OR status IS NULL);

CREATE POLICY "Admin has full access to reviews"
    ON public.client_reviews FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Public can submit contact messages"
    ON public.contact_messages FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Admin has full access to contact messages"
    ON public.contact_messages FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 6. STORAGE — public media bucket for project/experience assets
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access to Portfolio Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Portfolio Media Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Portfolio Media Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Portfolio Media Delete" ON storage.objects;

CREATE POLICY "Public Access to Portfolio Media"
    ON storage.objects FOR SELECT TO anon, authenticated
    USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admin Portfolio Media Upload"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'portfolio-media');

CREATE POLICY "Admin Portfolio Media Update"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admin Portfolio Media Delete"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'portfolio-media');

-- ─────────────────────────────────────────────────────────────
-- 7. OPTIONAL — seed missing password-hunter project if absent
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.projects (
    slug, title, category, description, tech_stack,
    live_url, github_url, video_url, thumbnail_url,
    preview_type, card_color, order_index, is_active
)
SELECT
    'password-hunter',
    'Password Hunter',
    'Cyber Security · Simulator',
    'Cyberpunk brute-force simulator with terminal storytelling, password analysis, installable app support, and real-time security theatre.',
    ARRAY['Next.js', 'Rust', 'CloudFront', 'DynamoDB', 'Lambda@Edge']::text[],
    '#', '', '', '',
    'surface', '#ef4444', 8, true
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE slug = 'password-hunter');
