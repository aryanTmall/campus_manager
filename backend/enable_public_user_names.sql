GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT (name) ON TABLE public.users TO anon;

DROP POLICY IF EXISTS public_read_user_names ON public.users;
CREATE POLICY public_read_user_names
ON public.users
FOR SELECT
TO anon
USING (true);
