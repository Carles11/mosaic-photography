-- Fix for Multiple Permissive Policies Performance Issue
-- This removes duplicate policies and keeps only one optimized policy per action
-- Copy and paste this into your Supabase SQL Editor and click "Run"

-- First, let's see what policies currently exist (optional - just for reference)
-- You can uncomment this to see current policies before fixing:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'favorites' AND schemaname = 'public';

-- Remove ALL existing policies on favorites table to clean up duplicates
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Only allow users to view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Only allow users to add favorites for themselves" ON public.favorites;
DROP POLICY IF EXISTS "Only allow users to add favorites for themselves." ON public.favorites;
DROP POLICY IF EXISTS "Users can add favorites for themselves" ON public.favorites;
DROP POLICY IF EXISTS "Users can add favorites for themselves." ON public.favorites;
DROP POLICY IF EXISTS "Only allow users to remove their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Only allow users to remove their own favorites." ON public.favorites;
DROP POLICY IF EXISTS "Allow users to view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow users to add their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow users to remove their own favorites" ON public.favorites;

-- Create ONE optimized policy per action (no duplicates)
-- SELECT policy
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING ((select auth.uid()) = user_id);

-- INSERT policy (only one!)
CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- DELETE policy
CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING ((select auth.uid()) = user_id);

-- Verify no duplicate policies exist
-- Uncomment to check the result:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'favorites' AND schemaname = 'public' ORDER BY cmd, policyname;
