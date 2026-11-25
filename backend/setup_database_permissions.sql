-- ===================================================
-- Campus Manager: Supabase Table Permissions & RLS Policies
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ===================================================

-- 1. Grant usage on schema public to anon and authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant table permissions
GRANT SELECT ON TABLE public.users TO anon, authenticated;
GRANT SELECT ON TABLE public.events TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.registrations TO anon, authenticated;

-- 3. Enable Row Level Security (RLS) on each table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 4. Policies for 'users' (allow public to view user email and role)
DROP POLICY IF EXISTS "Public can view users" ON public.users;
DROP POLICY IF EXISTS "public_read_user_names" ON public.users;
CREATE POLICY "Public can view users"
ON public.users
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Policies for 'events' (allow public to browse events)
DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (true);

-- 6. Policies for 'registrations' (allow public to view and register)
DROP POLICY IF EXISTS "Public can view registrations" ON public.registrations;
CREATE POLICY "Public can view registrations"
ON public.registrations
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Public can create registrations" ON public.registrations;
CREATE POLICY "Public can create registrations"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
