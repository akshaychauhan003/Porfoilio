-- ════════════════════════════════════════════════════════════════
-- SUPABASE DATABASE SCHEMA FOR AKSHAY SINGH CHAUHAN'S PORTFOLIO
-- ════════════════════════════════════════════════════════════════
-- Copy and run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. CONTACT MESSAGES TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT DEFAULT '',
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    website TEXT DEFAULT '',
    is_read BOOLEAN DEFAULT FALSE,
    source TEXT DEFAULT 'contact_form', -- 'contact_form' or 'hire_now_click'
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'contact_form';
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';

-- Index for quick sorting by latest inquiries
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_unread ON public.contact_messages(is_read, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 2. CLIENT REVIEWS TABLE (With Admin Moderation)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    client_title TEXT NOT NULL,
    client_company TEXT NOT NULL,
    company_website TEXT DEFAULT '',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL DEFAULT 5,
    review_text TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Schema Migration (safe to run on existing Supabase instances)
ALTER TABLE public.client_reviews ADD COLUMN IF NOT EXISTS company_website TEXT DEFAULT '';
ALTER TABLE public.client_reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.client_reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Index for fetching approved reviews on public site
CREATE INDEX IF NOT EXISTS idx_client_reviews_approved ON public.client_reviews(status, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 3. PROJECTS TABLE (Dynamic Showcase)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    live_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    preview_type TEXT DEFAULT 'video', -- 'video' or 'surface'
    card_color TEXT DEFAULT '#3d8bff', -- Accent theme hex, gradient, or color code
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Schema Migration (safe to run on existing Supabase instances)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS card_color TEXT DEFAULT '#3d8bff';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS preview_type TEXT DEFAULT 'video';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS live_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_projects_order ON public.projects(order_index ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_active ON public.projects(is_active);

-- ─────────────────────────────────────────────────────────────
-- 4. EXPERIENCES TABLE (Dual Track: Office & Freelance)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT DEFAULT 'Remote',
    duration TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'office', -- 'office' or 'freelance'
    video_url TEXT DEFAULT '',
    live_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'office';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS live_url TEXT DEFAULT '';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_experiences_order ON public.experiences(order_index ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON public.experiences(category);

-- ─────────────────────────────────────────────────────────────
-- 5. REALTIME PUBLICATION CONFIGURATION
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.experiences REPLICA IDENTITY FULL;
ALTER TABLE public.client_reviews REPLICA IDENTITY FULL;
ALTER TABLE public.contact_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'projects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'experiences'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.experiences;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'client_reviews'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.client_reviews;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'contact_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.experiences TO anon;
GRANT SELECT, INSERT ON public.client_reviews TO anon;
GRANT INSERT ON public.contact_messages TO anon;

GRANT ALL ON public.projects TO authenticated, service_role;
GRANT ALL ON public.experiences TO authenticated, service_role;
GRANT ALL ON public.client_reviews TO authenticated, service_role;
GRANT ALL ON public.contact_messages TO authenticated, service_role;

-- Clean up older policies
DROP POLICY IF EXISTS "Public can view active projects" ON public.projects;
DROP POLICY IF EXISTS "Admin has full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow full access on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public read active projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated full access on projects" ON public.projects;

DROP POLICY IF EXISTS "Public can view experiences" ON public.experiences;
DROP POLICY IF EXISTS "Admin has full access to experiences" ON public.experiences;
DROP POLICY IF EXISTS "Allow full access on experiences" ON public.experiences;
DROP POLICY IF EXISTS "Allow public read experiences" ON public.experiences;
DROP POLICY IF EXISTS "Allow authenticated full access on experiences" ON public.experiences;

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Public can submit reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Admin has full access to reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow full access on client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow public read approved client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow public insert on client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow public insert pending client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow authenticated full access on client_reviews" ON public.client_reviews;

DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin has full access to contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow full access on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow public insert on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow read on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow update on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow delete on contact_messages" ON public.contact_messages;

-- Apply strict policies
CREATE POLICY "Public can view active projects"
    ON public.projects FOR SELECT
    TO anon
    USING (is_active = true);

CREATE POLICY "Admin has full access to projects"
    ON public.projects FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can view experiences"
    ON public.experiences FOR SELECT
    TO anon
    USING (is_active = true);

CREATE POLICY "Admin has full access to experiences"
    ON public.experiences FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can view approved reviews"
    ON public.client_reviews FOR SELECT
    TO anon
    USING (status = 'approved');

CREATE POLICY "Public can submit reviews"
    ON public.client_reviews FOR INSERT
    TO anon
    WITH CHECK (status = 'pending' OR status IS NULL);

CREATE POLICY "Admin has full access to reviews"
    ON public.client_reviews FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can submit contact messages"
    ON public.contact_messages FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Admin has full access to contact messages"
    ON public.contact_messages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 7. SUPABASE STORAGE BUCKET CONFIGURATION
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access to Portfolio Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Portfolio Media Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Portfolio Media Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Portfolio Media Delete" ON storage.objects;

CREATE POLICY "Public Access to Portfolio Media"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admin Portfolio Media Upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-media');

CREATE POLICY "Admin Portfolio Media Update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admin Portfolio Media Delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'portfolio-media');
