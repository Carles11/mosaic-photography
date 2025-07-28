-- Fix for Supabase Performance Warning: Auth RLS Initialization Plan
-- Copy and paste this into your Supabase SQL Editor and click "Run"

-- This fixes the performance issue by replacing auth.uid() with (select auth.uid())
-- This ensures auth.uid() is evaluated once per query instead of once per row

-- Drop and recreate user_profiles policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING ((select auth.uid()) = id);

-- Drop and recreate favorites policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING ((select auth.uid()) = user_id);

-- Performance improvement explanation:
-- Before: auth.uid() was called for EVERY row being evaluated
-- After: (select auth.uid()) is called ONCE per query and cached
-- This significantly improves performance when dealing with many rows
