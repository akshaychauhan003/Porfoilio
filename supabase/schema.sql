-- ════════════════════════════════════════════════════════════════
-- SUPABASE DATABASE SCHEMA FOR AKSHAY SINGH CHAUHAN'S PORTFOLIO
-- ════════════════════════════════════════════════════════════════
-- Copy and run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. CONTACT MESSAGES TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
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

-- Index for quick sorting by latest inquiries
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 2. CLIENT REVIEWS TABLE (With Admin Moderation)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    client_title TEXT NOT NULL,
    client_company TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index for fetching approved reviews on public site
CREATE INDEX IF NOT EXISTS idx_client_reviews_approved ON client_reviews(status, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 3. PROJECTS TABLE (Dynamic Showcase)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT[] NOT NULL,
    live_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    preview_type TEXT DEFAULT 'video', -- 'video' or 'surface'
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index ASC, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 4. EXPERIENCES TABLE (Horizontal Journey Timeline)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT DEFAULT 'Remote',
    duration TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_experiences_order ON experiences(order_index ASC, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Contact Messages: Anyone can insert, only authenticated users (Admin) can view/manage
CREATE POLICY "Allow public insert on contact_messages" 
    ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read on contact_messages" 
    ON contact_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update on contact_messages" 
    ON contact_messages FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on contact_messages" 
    ON contact_messages FOR DELETE TO authenticated USING (true);

-- Client Reviews: Anyone can insert (as pending), anyone can read approved, authenticated can full CRUD
CREATE POLICY "Allow public insert pending client_reviews" 
    ON client_reviews FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');

CREATE POLICY "Allow public read approved client_reviews" 
    ON client_reviews FOR SELECT TO anon, authenticated USING (status = 'approved');

CREATE POLICY "Allow authenticated full access on client_reviews" 
    ON client_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Projects: Anyone can read active, authenticated can full CRUD
CREATE POLICY "Allow public read active projects" 
    ON projects FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Allow authenticated full access on projects" 
    ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Experiences: Anyone can read, authenticated can full CRUD
CREATE POLICY "Allow public read experiences" 
    ON experiences FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow authenticated full access on experiences" 
    ON experiences FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 6. INITIAL SEED DATA
-- ─────────────────────────────────────────────────────────────

-- Seed Projects
INSERT INTO projects (slug, title, category, description, tech_stack, live_url, github_url, video_url, preview_type, order_index)
VALUES 
(
    'travoqix',
    'Travoqix',
    'Travel & Tourism',
    'Delhi-based travel platform built for premium group, corporate, and custom journeys with polished booking flows and cinematic brand presentation.',
    ARRAY['Go', 'Kafka', 'Redis', 'Kubernetes', 'Prometheus', 'TimescaleDB'],
    'https://travoqix.in/',
    '',
    'assets/videos/Travoqix.mp4',
    'video',
    1
),
(
    'fr-bot',
    'FR Bot',
    'AI & Automation',
    'Rule-based assistant designed for fast intent resolution with keyword routing, structured fallback responses, and repeatable interaction flows.',
    ARRAY['Python', 'NLP', 'Regex', 'FastAPI'],
    '#',
    '',
    '',
    'surface',
    2
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Experiences
INSERT INTO experiences (role, company, location, duration, description, order_index)
VALUES 
(
    'Freelance Developer',
    'Travoqix',
    'Remote',
    'March 2026',
    'Engineered a scalable frontend foundation with cinematic UI, automated booking flows, and production-safe delivery for a live travel product.',
    1
),
(
    'Data Analyst Intern',
    'Sunbuzz Media',
    'Delhi',
    'January 2025 — February 2025',
    'Built Python and SQL analysis workflows, delivered dashboard reporting, and surfaced actionable patterns from multi-source business data.',
    2
),
(
    'Data Analyst Intern',
    'CodeSoft',
    'Remote',
    'August 2025 — September 2025',
    'Delivered reusable analysis pipelines spanning cleaning, EDA, visualization, and reporting while reducing repetitive reporting effort across structured datasets.',
    3
);

-- Seed Initial Verified Reviews
INSERT INTO client_reviews (client_name, client_title, client_company, rating, review_text, status, is_featured)
VALUES 
(
    'Mr. Satyajit Nanda',
    'CEO',
    'Travoqix',
    5,
    'I am really impressed with the work done on Travoqix. The website turned out far better and more beautiful than we expected. The attention to detail, animations, and overall design quality were excellent. The project was completed in just 2 weeks, while the expected timeline was 30 days. Everything was handled professionally and smoothly. Highly recommended for quality web development work.',
    'approved',
    true
),
(
    'Mr. Aniket Gupta',
    'COO',
    'Sunbuzz Media',
    5,
    'Outstanding analytical and problem-solving capability. Delivered clean dashboards and automated repetitive data pipeline tasks with precision.',
    'approved',
    true
);
