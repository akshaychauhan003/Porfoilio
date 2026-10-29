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
    company_website TEXT DEFAULT '',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Schema Migration (safe to run on existing Supabase instances)
ALTER TABLE client_reviews ADD COLUMN IF NOT EXISTS company_website TEXT DEFAULT '';

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
-- Note: Both the live portfolio website and mobile console communicate with Supabase
-- using the public/publishable key. We allow public access on all 4 tables so changes
-- made in the mobile app immediately synchronize live to the portfolio website.

-- Enable Row Level Security with clean, permissive policies for anon and authenticated
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Explicitly grant full permissions to anon, authenticated, and service_role
GRANT ALL ON TABLE contact_messages TO anon, authenticated, service_role;
GRANT ALL ON TABLE client_reviews TO anon, authenticated, service_role;
GRANT ALL ON TABLE projects TO anon, authenticated, service_role;
GRANT ALL ON TABLE experiences TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Clean and recreate permissive policies
DROP POLICY IF EXISTS "Allow public insert on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow read on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow update on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow delete on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated read on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated update on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated delete on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow full access on contact_messages" ON contact_messages;

CREATE POLICY "Allow full access on contact_messages" 
    ON contact_messages FOR ALL TO anon, authenticated 
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete on client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow public insert on client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow read on client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow update on client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow public insert pending client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow public read approved client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow authenticated full access on client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow insert on client_reviews" ON client_reviews;
DROP POLICY IF EXISTS "Allow full access on client_reviews" ON client_reviews;

CREATE POLICY "Allow full access on client_reviews" 
    ON client_reviews FOR ALL TO anon, authenticated 
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read active projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated full access on projects" ON projects;
DROP POLICY IF EXISTS "Allow full access on projects" ON projects;

CREATE POLICY "Allow full access on projects" 
    ON projects FOR ALL TO anon, authenticated 
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read experiences" ON experiences;
DROP POLICY IF EXISTS "Allow authenticated full access on experiences" ON experiences;
DROP POLICY IF EXISTS "Allow full access on experiences" ON experiences;

CREATE POLICY "Allow full access on experiences" 
    ON experiences FOR ALL TO anon, authenticated 
    USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 6. COMPLETE SEED DATA (All 6 Portfolio Projects & 5 Experiences)
-- ─────────────────────────────────────────────────────────────

-- Seed All Portfolio Projects
INSERT INTO projects (slug, title, category, description, tech_stack, live_url, github_url, video_url, preview_type, card_color, order_index, is_active)
VALUES 
(
    'travoqix',
    'Travoqix',
    'Travel & Tourism · Production',
    'Delhi-based live travel platform built for curated group tours, corporate getaways, and bespoke expeditions with frictionless booking flows, modern UI architecture, and cinematic presentation.',
    ARRAY['React', 'TypeScript', 'Node.js', 'REST APIs', 'Motion UI', 'Vercel'],
    'https://travoqix.in/',
    '',
    'assets/videos/Travoqix.mp4',
    'video',
    '#3d8bff',
    1,
    true
),
(
    'titan',
    'TITAN – Smart Inventory & Sales System',
    'Desktop Systems · Security',
    'Offline-first smart inventory and POS system built with Electron, React, and TypeScript with embedded SQLite. Features local face-recognition authentication, encrypted credential storage, and automated PDF/CSV business reporting.',
    ARRAY['Electron', 'React', 'TypeScript', 'SQLite', 'Face Auth', 'Local Encryption'],
    '#',
    '',
    '',
    'surface',
    '#3d8bff',
    2,
    true
),
(
    'caseflow',
    'CaseFlow Legal Manager',
    'Legal Tech · Workflow AI',
    'AI-assisted legal workflow automation platform orchestrating case intake summarization, appointment scheduling, and structured client-lawyer communications with NLP pipelines.',
    ARRAY['Python', 'Flask', 'NLP Pipelines', 'SQLite', 'Automation'],
    '#',
    '',
    '',
    'surface',
    '#06b6d4',
    4,
    true
),
(
    'boxoffice-oracle',
    'BoxOffice Oracle',
    'Predictive ML · Data Science',
    'Predictive machine learning pipeline analyzing historical cinematic, budget, and distribution features with regression and classification models to forecast box-office commercial viability.',
    ARRAY['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib'],
    '#',
    '',
    '',
    'surface',
    '#8b5cf6',
    5,
    true
),
(
    'akrti-dashboard',
    'AKRTI BI Dashboard',
    'Business Intelligence · Analytics',
    'Comprehensive enterprise KPI intelligence dashboard providing executive visibility into revenue velocity, customer retention patterns, and multi-dimensional operational metrics.',
    ARRAY['Power BI', 'Tableau', 'DAX', 'SQL', 'KPI Analytics'],
    '#',
    '',
    '',
    'surface',
    '#f59e0b',
    6,
    true
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
    '#10b981',
    7,
    true
),
(
    'password-hunter',
    'Password Hunter',
    'Cyber Security',
    'Cyberpunk brute-force simulator with terminal storytelling, password analysis, installable app support, and real-time security theatre.',
    ARRAY['Next.js', 'Rust', 'CloudFront', 'DynamoDB', 'Lambda@Edge'],
    '#',
    '',
    '',
    'surface',
    '#ef4444',
    8,
    true
)
ON CONFLICT (slug) DO UPDATE SET 
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    tech_stack = EXCLUDED.tech_stack,
    live_url = EXCLUDED.live_url,
    video_url = EXCLUDED.video_url,
    preview_type = EXCLUDED.preview_type,
    card_color = EXCLUDED.card_color,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active;

-- Seed All 5 Experiences
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
    'January 2025 — February 2025',
    'Built end-to-end Python and SQL data processing pipelines, created executive KPI dashboards in Power BI and Tableau, and uncovered high-impact engagement trends across digital media campaigns.',
    2
),
(
    'Freelance Web Developer',
    'Travoqix',
    'Remote',
    'March 2025',
    'Engineered a high-performance frontend foundation featuring responsive booking workflows, modern UI architecture, and dynamic video showcase deployed live at travoqix.in.',
    3
),
(
    'Freelance Software Developer',
    'Krisha Events',
    'Remote',
    'September 2025 — Present',
    'Architecting a unified cross-platform event & finance management application across desktop and mobile. Implemented centralized budget tracking, vendor contract management, and automated client billing workflows.',
    4
),
(
    'AI/ML & API Developer Intern',
    'Delhi e-Governance Society (DeGS)',
    'Delhi, India',
    'August 2025 — Present',
    'Engineered enterprise backend APIs with Java 17, Spring Boot, and Spring Data JPA to digitize ground-level employee records and field inspection reports. Integrated automated validation pipelines, MySQL persistence, and machine learning models to modernize government workflows.',
    5
);

-- Seed Initial Verified Reviews
INSERT INTO client_reviews (client_name, client_title, client_company, company_website, rating, review_text, status, is_featured)
VALUES 
(
    'Mr. Satyajit Nanda',
    'CEO',
    'Travoqix',
    'https://travoqix.in/',
    5,
    'I am really impressed with the work done on Travoqix. The website turned out far better and more beautiful than we expected. The attention to detail, animations, and overall design quality were excellent. The project was completed in just 2 weeks, while the expected timeline was 30 days. Everything was handled professionally and smoothly. Highly recommended for quality web development work.',
    'approved',
    true
),
(
    'Mr. Aniket Gupta',
    'COO',
    'Sunbuzz Media',
    '',
    5,
    'Outstanding analytical and problem-solving capability. Delivered clean dashboards and automated repetitive data pipeline tasks with precision.',
    'approved',
    true
)
ON CONFLICT DO NOTHING;
