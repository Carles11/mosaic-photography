-- Migration: Fix favorites table foreign key constraint
-- The favorites table currently references the old "images" table
-- but we now use "images_resize" table for all galleries

-- Drop the existing foreign key constraint that references the old "images" table
ALTER TABLE public.favorites 
DROP CONSTRAINT IF EXISTS favorites_image_id_fkey;

-- Option 1: Add new foreign key constraint to images_resize table
-- Uncomment the line below if you want referential integrity with images_resize
-- ALTER TABLE public.favorites 
-- ADD CONSTRAINT favorites_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.images_resize(id);

-- Option 2: No foreign key constraint (more flexible)
-- This allows favorites to reference any image ID without strict database validation
-- The application logic will handle validation

-- Add a comment to document the change
COMMENT ON COLUMN public.favorites.image_id IS 'Image identifier - references images_resize table (no FK constraint for flexibility)';