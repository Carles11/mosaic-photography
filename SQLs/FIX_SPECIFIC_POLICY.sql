-- Fix for specific policy "Users can add favorites for themselves"
-- Copy and paste this into your Supabase SQL Editor and click "Run"

-- Drop the specific policy that's causing the warning
DROP POLICY IF EXISTS "Users can add favorites for themselves" ON public.favorites;

-- Recreate it with the optimized auth.uid() pattern
CREATE POLICY "Users can add favorites for themselves" ON public.favorites
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- This fixes the specific warning about the INSERT policy for favorites
