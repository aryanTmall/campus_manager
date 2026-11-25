-- ===================================================
-- Campus Manager: Complete Database Setup & Seed Script
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ===================================================

-- 1. Delete old tables
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Create Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'student'
);

-- 3. Create Events Table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    capacity INT DEFAULT 50,
    status TEXT DEFAULT 'upcoming'
);

-- 4. Create Registrations Table
CREATE TABLE public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- 5. Insert Sample Users
INSERT INTO public.users (email, role)
VALUES
('organizer@gmail.com', 'organizer'),
('rahul@gmail.com', 'student'),
('priya@gmail.com', 'student'),
('amit@gmail.com', 'student');

-- 6. Insert Sample Events
INSERT INTO public.events
(organizer_id, title, capacity, status)
SELECT id, 'Python Workshop', 50, 'upcoming'
FROM public.users WHERE email = 'organizer@gmail.com'
UNION ALL
SELECT id, 'AI Workshop', 100, 'upcoming'
FROM public.users WHERE email = 'organizer@gmail.com'
UNION ALL
SELECT id, 'Machine Learning', 40, 'upcoming'
FROM public.users WHERE email = 'organizer@gmail.com'
UNION ALL
SELECT id, 'Data Science', 80, 'upcoming'
FROM public.users WHERE email = 'organizer@gmail.com'
UNION ALL
SELECT id, 'Generative AI', 60, 'upcoming'
FROM public.users WHERE email = 'organizer@gmail.com';

-- 7. Insert Sample Registrations
INSERT INTO public.registrations (user_id, event_id)
SELECT u.id, e.id
FROM public.users u
CROSS JOIN public.events e
WHERE
(u.email = 'rahul@gmail.com' AND e.title = 'Python Workshop')
OR
(u.email = 'priya@gmail.com' AND e.title = 'Python Workshop')
OR
(u.email = 'amit@gmail.com' AND e.title = 'AI Workshop');

-- ===================================================
-- 8. GRANT API ACCESS TO ANON & AUTHENTICATED ROLES
-- (Required for Supabase Python SDK / PostgREST)
-- ===================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.users TO anon, authenticated;
GRANT SELECT ON TABLE public.events TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.registrations TO anon, authenticated;

-- ===================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow public read on users
DROP POLICY IF EXISTS "Public can view users" ON public.users;
CREATE POLICY "Public can view users"
ON public.users FOR SELECT
TO anon, authenticated
USING (true);

-- Allow public read on events
DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events"
ON public.events FOR SELECT
TO anon, authenticated
USING (true);

-- Allow public read on registrations
DROP POLICY IF EXISTS "Public can view registrations" ON public.registrations;
CREATE POLICY "Public can view registrations"
ON public.registrations FOR SELECT
TO anon, authenticated
USING (true);

-- Allow public to create new registrations
DROP POLICY IF EXISTS "Public can create registrations" ON public.registrations;
CREATE POLICY "Public can create registrations"
ON public.registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);
