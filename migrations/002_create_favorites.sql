-- Migration: Create favorites table (if it doesn't exist)
-- This table stores user's favorite images

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, image_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites table
-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_image_id_idx ON public.favorites(image_id);
CREATE INDEX IF NOT EXISTS favorites_user_image_idx ON public.favorites(user_id, image_id);

-- Add helpful comments
COMMENT ON TABLE public.favorites IS 'User favorite images';
COMMENT ON COLUMN public.favorites.user_id IS 'References auth.users.id';
COMMENT ON COLUMN public.favorites.image_id IS 'Image identifier';
