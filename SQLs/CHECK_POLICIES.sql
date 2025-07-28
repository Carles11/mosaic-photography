-- Query to see all current RLS policies on your tables
-- Copy and paste this into your Supabase SQL Editor and click "Run"
-- This will show us exactly what policies exist and their names

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('favorites', 'user_profiles')
ORDER BY tablename, policyname;
