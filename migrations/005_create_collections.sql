-- Migration: Update existing collections tables for Phase 2 features
-- The collections and collection_favorites tables already exist
-- This migration adds missing columns and ensures proper policies

-- Add missing columns if they don't exist
ALTER TABLE public.collections 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.collection_favorites 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Note: Your existing schema has:
-- collections.id: uuid
-- collections.user_id: uuid  
-- collections.privacy: text default 'private'
-- collection_favorites.favorite_id: bigint (not uuid)

-- Ensure RLS is enabled
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for collections table
-- Users can view their own collections and public collections
CREATE POLICY "Users can view own and public collections" ON public.collections
    FOR SELECT USING (
        auth.uid() = user_id OR privacy = 'public'
    );

-- Users can insert their own collections
CREATE POLICY "Users can insert own collections" ON public.collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own collections
CREATE POLICY "Users can update own collections" ON public.collections
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own collections
CREATE POLICY "Users can delete own collections" ON public.collections
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for collection_favorites table
-- Users can view collection_favorites for their own collections or public collections
CREATE POLICY "Users can view collection_favorites for accessible collections" ON public.collection_favorites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.collections c 
            WHERE c.id = collection_id 
            AND (c.user_id = auth.uid() OR c.privacy = 'public')
        )
    );

-- Users can insert collection_favorites for their own collections
CREATE POLICY "Users can insert into own collections" ON public.collection_favorites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.collections c 
            WHERE c.id = collection_id 
            AND c.user_id = auth.uid()
        )
    );

-- Users can update collection_favorites for their own collections
CREATE POLICY "Users can update own collection_favorites" ON public.collection_favorites
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.collections c 
            WHERE c.id = collection_id 
            AND c.user_id = auth.uid()
        )
    );

-- Users can delete collection_favorites from their own collections
CREATE POLICY "Users can delete from own collections" ON public.collection_favorites
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.collections c 
            WHERE c.id = collection_id 
            AND c.user_id = auth.uid()
        )
    );

-- Create trigger for updated_at on collections
CREATE OR REPLACE FUNCTION public.handle_collections_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_collections_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS collections_user_id_idx ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS collections_privacy_idx ON public.collections(privacy);
CREATE INDEX IF NOT EXISTS collections_created_at_idx ON public.collections(created_at DESC);
CREATE INDEX IF NOT EXISTS collection_favorites_collection_id_idx ON public.collection_favorites(collection_id);
CREATE INDEX IF NOT EXISTS collection_favorites_favorite_id_idx ON public.collection_favorites(favorite_id);
CREATE INDEX IF NOT EXISTS collection_favorites_display_order_idx ON public.collection_favorites(collection_id, display_order);

-- Add helpful comments
COMMENT ON TABLE public.collections IS 'User collections of favorite images';
COMMENT ON COLUMN public.collections.user_id IS 'References auth.users.id';
COMMENT ON COLUMN public.collections.privacy IS 'Collection visibility: private or public';
COMMENT ON TABLE public.collection_favorites IS 'Junction table linking collections to favorite images';
COMMENT ON COLUMN public.collection_favorites.display_order IS 'Order of images within collection (for drag-drop reordering)';
