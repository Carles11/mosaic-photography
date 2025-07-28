-- Ultimate Fix for Multiple Permissive Policies Issue
-- This approach drops ALL policies on favorites table and recreates clean ones
-- Copy and paste this into your Supabase SQL Editor and click "Run"

-- Step 1: Get a list of all current policies (for reference)
-- Uncomment to see what policies exist before we fix them:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'favorites' AND schemaname = 'public';

-- Step 2: Use a more aggressive approach - drop ALL policies on favorites table
-- This SQL will dynamically drop any policy that exists on the favorites table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop through all policies on the favorites table and drop them
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'favorites' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.favorites', policy_record.policyname);
    END LOOP;
END $$;

-- Step 3: Create exactly ONE optimized policy per action
-- SELECT policy (view favorites)
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING ((select auth.uid()) = user_id);

-- INSERT policy (add favorites) - ONLY ONE!
CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- DELETE policy (remove favorites)
CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING ((select auth.uid()) = user_id);

-- Step 4: Verify the fix worked
-- Uncomment to see the final clean policies:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'favorites' AND schemaname = 'public' ORDER BY cmd;
