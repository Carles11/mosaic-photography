-- Migration: Create user_profiles table
-- This table stores additional user profile information beyond what's in auth.users

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    instagram TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING ((select auth.uid()) = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING ((select auth.uid()) = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING ((select auth.uid()) = id);

-- Create an index on the primary key for better performance
CREATE INDEX IF NOT EXISTS user_profiles_id_idx ON public.user_profiles(id);

-- Function to automatically update the updated_at timestamp
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

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add some helpful comments
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';
COMMENT ON COLUMN public.user_profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN public.user_profiles.name IS 'User display name';
COMMENT ON COLUMN public.user_profiles.instagram IS 'Instagram handle without @ symbol';
COMMENT ON COLUMN public.user_profiles.website IS 'User website URL';
