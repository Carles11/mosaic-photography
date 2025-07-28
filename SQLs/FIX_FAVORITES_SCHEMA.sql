-- Fix favorites table schema to support string image IDs
-- Run this in Supabase SQL Editor to fix the image_id column type

-- First, check current schema (uncomment to see current structure):
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'favorites' AND table_schema = 'public';

-- Drop the table and recreate with correct schema
-- (This will delete all existing favorites data)
DROP TABLE IF EXISTS public.favorites CASCADE;

-- Recreate with correct TEXT type for image_id
CREATE TABLE public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, image_id)
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX favorites_image_id_idx ON public.favorites(image_id);
CREATE INDEX favorites_user_image_idx ON public.favorites(user_id, image_id);

-- Add helpful comments
COMMENT ON TABLE public.favorites IS 'User favorite images';
COMMENT ON COLUMN public.favorites.user_id IS 'References auth.users.id';
COMMENT ON COLUMN public.favorites.image_id IS 'String identifier for images (e.g., filename, artwork ID)';

-- Verify the fix (uncomment to check final schema):
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'favorites' AND table_schema = 'public';
