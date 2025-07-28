-- Fix for Supabase Security Warning: Function Search Path Mutable
-- Copy and paste this into your Supabase SQL Editor and click "Run"

-- Replace the existing function with a secure version
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- This fixes the security warning by:
-- 1. Adding SECURITY DEFINER - ensures function runs with creator's privileges
-- 2. Setting search_path = public - prevents search path manipulation attacks
-- 3. Making the search_path immutable for this function
