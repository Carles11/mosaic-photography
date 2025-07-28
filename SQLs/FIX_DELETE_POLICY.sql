-- Quick fix for the specific "remove their own favorites" policy
-- Copy and paste this into your Supabase SQL Editor and click "Run"

-- Drop any DELETE policies on favorites table with various possible names
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Only allow users to remove their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow users to remove their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

-- Create the optimized DELETE policy
CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING ((select auth.uid()) = user_id);

-- This fixes the specific performance warning about the DELETE policy
