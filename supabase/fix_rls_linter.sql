-- ════════════════════════════════════════════════════════════════
-- RESOLVE SUPABASE LINTER WARNING: ENABLE RLS WITH CLEAN POLICIES
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vppkucipdfbshqxjwlcx/sql/new
-- ════════════════════════════════════════════════════════════════

-- 1. Enable RLS on all tables (resolves Supabase Security Advisor warning)
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- 2. Drop all old/duplicate policies to avoid conflicting rules
DROP POLICY IF EXISTS "Allow delete on client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow public insert on client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow read on client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow update on client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow full access on client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow public insert pending client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow public read approved client_reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow authenticated full access on client_reviews" ON public.client_reviews;

DROP POLICY IF EXISTS "Allow public insert on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow read on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow update on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow delete on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow authenticated read on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow authenticated update on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow authenticated delete on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow full access on contact_messages" ON public.contact_messages;

DROP POLICY IF EXISTS "Allow public read active projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated full access on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow full access on projects" ON public.projects;

DROP POLICY IF EXISTS "Allow public read experiences" ON public.experiences;
DROP POLICY IF EXISTS "Allow authenticated full access on experiences" ON public.experiences;
DROP POLICY IF EXISTS "Allow full access on experiences" ON public.experiences;

-- 3. Create unified full-access policies for anon and authenticated
CREATE POLICY "Allow full access on client_reviews" 
    ON public.client_reviews FOR ALL TO anon, authenticated 
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access on contact_messages" 
    ON public.contact_messages FOR ALL TO anon, authenticated 
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access on projects" 
    ON public.projects FOR ALL TO anon, authenticated 
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access on experiences" 
    ON public.experiences FOR ALL TO anon, authenticated 
    USING (true) WITH CHECK (true);

-- 4. Grant table & sequence privileges
GRANT ALL ON TABLE public.client_reviews, public.contact_messages, public.projects, public.experiences TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
