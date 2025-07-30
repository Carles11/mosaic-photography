-- Fix for Multiple Permissive Policies on public.images table
-- Issue: Table public.images has multiple permissive policies for role anon for action SELECT
-- Policies: "Allow everyone to read images" and "Anyone can view images"
-- Copy and paste this into your Supabase SQL Editor and click "Run"

-- Drop both existing policies to clean up duplicates
DROP POLICY IF EXISTS "Allow everyone to read images" ON public.images;
DROP POLICY IF EXISTS "Anyone can view images" ON public.images;

-- Create ONE optimized policy for images table
-- This allows everyone (including anonymous users) to read images
CREATE POLICY "Anyone can view images" ON public.images 
    FOR SELECT USING (true);

-- Verify no duplicate policies exist
-- Uncomment to check the result:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'images' AND schemaname = 'public' ORDER BY cmd, policyname;
