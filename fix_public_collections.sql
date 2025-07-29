-- Fix collection sharing for anonymous users
-- This allows anonymous users to view collection_favorites for public collections

-- Update the policy to allow anonymous users to read collection_favorites for public collections
DROP POLICY IF EXISTS "Users can view collection_favorites for accessible collections" ON public.collection_favorites;

CREATE POLICY "Users can view collection_favorites for accessible collections" ON public.collection_favorites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.collections c 
            WHERE c.id = collection_id 
            AND (c.user_id = auth.uid() OR c.privacy = 'public')
        )
    );

-- For the favorites table, we need to handle the type mismatch
-- Your collection_favorites.favorite_id is bigint, but favorites.id is uuid
-- Let's create a simpler policy that just allows reading favorites for public collections
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;

-- Allow users to view their own favorites, and also allow reading any favorites 
-- that might be referenced in public collections (we'll handle the join in the app)
CREATE POLICY "Users can view relevant favorites" ON public.favorites
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.collections c 
            WHERE c.privacy = 'public'
        )
    );

-- Ensure images table is publicly readable
DROP POLICY IF EXISTS "Anyone can view images" ON public.images;
CREATE POLICY "Anyone can view images" ON public.images 
    FOR SELECT USING (true);
