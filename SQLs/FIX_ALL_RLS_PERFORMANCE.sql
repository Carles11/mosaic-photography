-- Fix for remaining Auth RLS Performance Issues
-- This will fix any remaining policies that still use auth.uid() without subquery optimization
-- Copy and paste this into your Supabase SQL Editor and click "Run"

-- Check and fix any remaining favorites table policies
-- This covers all possible policy names that might exist

-- Drop ALL existing policies on favorites table (they will be recreated optimally)
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Only allow users to view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Only allow users to add favorites for themselves" ON public.favorites;
DROP POLICY IF EXISTS "Only allow users to remove their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow users to view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow users to add their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow users to remove their own favorites" ON public.favorites;

-- Create optimized policies for favorites table
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING ((select auth.uid()) = user_id);

-- Also check and fix user_profiles policies if any remain
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Only allow users to view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Only allow users to update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.user_profiles;

-- Create optimized policies for user_profiles table
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING ((select auth.uid()) = id);

-- This comprehensive fix ensures ALL policies use the optimized (select auth.uid()) pattern
-- which evaluates auth.uid() once per query instead of once per row
