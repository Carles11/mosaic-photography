-- Migration: Setup RLS policies for comments table
-- This assumes the comments table already exists in Supabase with int8 image_id
-- Run this after creating the comments table manually

-- Enable Row Level Security on comments table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read comments (both logged in and anonymous users)
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (true);

-- Policy: Only authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments" ON public.comments
    FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING ((select auth.uid()) = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS comments_image_id_idx ON public.comments(image_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at DESC);

-- Create composite index for efficient queries
CREATE INDEX IF NOT EXISTS comments_image_id_created_at_idx ON public.comments(image_id, created_at DESC);

-- Add helpful comments
COMMENT ON TABLE public.comments IS 'User comments on images';
COMMENT ON COLUMN public.comments.user_id IS 'References auth.users.id';
COMMENT ON COLUMN public.comments.image_id IS 'Image identifier (int8/bigint)';
COMMENT ON COLUMN public.comments.content IS 'Comment text content';
