-- ════════════════════════════════════════════════════════════════
-- SUPABASE QUICK PERMISSION FIX FOR PORTFOLIO & DASHBOARD
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vppkucipdfbshqxjwlcx/sql/new
-- ════════════════════════════════════════════════════════════════

-- 1. Ensure required schema columns exist
ALTER TABLE IF EXISTS client_reviews ADD COLUMN IF NOT EXISTS company_website TEXT DEFAULT '';
ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS card_color TEXT DEFAULT '#3d8bff';

-- 2. Open / Disable Row Level Security on all 4 portfolio tables
-- This instantly allows the portfolio website and dashboard to read & write data without 401/42501 errors:
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_reviews DISABLE ROW LEVEL SECURITY;

-- 3. Grant full table and sequence permissions to public (anon), authenticated, and service_role
GRANT ALL ON TABLE contact_messages TO anon, authenticated, service_role;
GRANT ALL ON TABLE projects TO anon, authenticated, service_role;
GRANT ALL ON TABLE experiences TO anon, authenticated, service_role;
GRANT ALL ON TABLE client_reviews TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. In case RLS is re-enabled in the future, create permissive fallback policies
DROP POLICY IF EXISTS "Allow full access on contact_messages" ON contact_messages;
CREATE POLICY "Allow full access on contact_messages" ON contact_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access on projects" ON projects;
CREATE POLICY "Allow full access on projects" ON projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access on experiences" ON experiences;
CREATE POLICY "Allow full access on experiences" ON experiences FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access on client_reviews" ON client_reviews;
CREATE POLICY "Allow full access on client_reviews" ON client_reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Seed all portfolio projects into cloud table so they appear in dashboard
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
    'degs-platform',
    'DeGS Digitization Platform',
    'Enterprise Backend · Govt of Delhi',
    'Scalable enterprise digitization platform engineered for Delhi e-Governance Society (DeGS) to digitize ground-level employee records, field inspections, and administrative workflows with structured validation.',
    ARRAY['Java 17', 'Spring Boot', 'Spring Data JPA', 'MySQL', 'REST APIs', 'RBAC'],
    '#',
    '',
    '',
    'surface',
    '#f59e0b',
    3,
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
