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
    card_color TEXT DEFAULT '#3d8bff', -- Accent theme hex, gradient, or color code
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Schema Migration (safe to run on existing Supabase instances)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS card_color TEXT DEFAULT '#3d8bff';

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

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Allow public insert on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow read on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow update on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow delete on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated read on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated update on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated delete on contact_messages" ON contact_messages;

-- Contact Messages:
-- 1. Anyone (public anonymous & authenticated) can submit an inquiry via the portfolio
CREATE POLICY "Allow public insert on contact_messages" 
    ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 2. ONLY authenticated administrator (via Supabase Auth) can read, update, or delete private inquiries
CREATE POLICY "Allow authenticated read on contact_messages" 
    ON contact_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update on contact_messages" 
    ON contact_messages FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on contact_messages" 
    ON contact_messages FOR DELETE TO authenticated USING (true);

-- Client Reviews:
DROP POLICY IF EXISTS "Allow public insert pending client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow public read approved client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow authenticated full access on client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow insert on client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow read on client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow update on client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow delete on client_reviews" ON client_reviews;

-- 1. Public can ONLY submit reviews with pending status and unfeatured (moderation enforcement)
CREATE POLICY "Allow public insert pending client_reviews" 
    ON client_reviews FOR INSERT TO anon, authenticated 
    WITH CHECK (status = 'pending' AND is_featured = false);

-- 2. Public can ONLY read approved reviews on the live portfolio
CREATE POLICY "Allow public read approved client_reviews" 
    ON client_reviews FOR SELECT TO anon, authenticated 
    USING (status = 'approved');

-- 3. Authenticated administrator has full CRUD access (to approve, feature, edit, or delete)
CREATE POLICY "Allow authenticated full access on client_reviews" 
    ON client_reviews FOR ALL TO authenticated 
    USING (true) WITH CHECK (true);

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
    'Data Analyst Intern',
    'CodSoft',
    'Remote',
    'August 2025 — September 2025',
    'Designed modular data analysis and visualization pipelines with Python (Pandas, NumPy, Matplotlib) and Excel, streamlining structured exploratory data analysis (EDA) and automated summary generation.',
    1
),
(
    'Data Analyst Intern',
    'Sunbuzz Media',
    'Delhi, India',
    'January 2026 — February 2026',
    'Built end-to-end Python and SQL data processing pipelines, created executive KPI dashboards in Power BI and Tableau, and uncovered high-impact engagement trends across digital media campaigns.',
    2
),
(
    'Freelance Web Developer',
    'Travoqix',
    'Remote',
    'March 2026',
    'Engineered a high-performance frontend foundation featuring responsive booking workflows, modern UI architecture, and dynamic video showcase deployed live at travoqix.in.',
    3
),
(
    'Freelance Software Developer',
    'Krisha Events',
    'Remote',
    'September 2026 — Present',
    'Architecting a unified cross-platform event & finance management application across desktop and mobile. Implemented centralized budget tracking, vendor contract management, and automated client billing workflows.',
    4
),
(
    'AI/ML & API Developer Intern',
    'Delhi e-Governance Society (DeGS)',
    'Delhi, India',
    'August 2026 — Present',
    'Engineered enterprise backend APIs with Java 17, Spring Boot, and Spring Data JPA to digitize ground-level employee records and field inspection reports. Integrated automated validation pipelines, MySQL persistence, and machine learning models to modernize government workflows.',
    5
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
