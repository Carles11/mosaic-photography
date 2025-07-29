# Comments Feature Setup Guide

This guide will help you set up the comments feature for your mosaic photography application.

## Database Setup

### Step 1: Create the Comments Table

First, you need to manually create the `comments` table in your Supabase database:

1. Go to your [Supabase Dashboard](https://supabase.com)
2. Navigate to the **SQL Editor** tab
3. Copy and paste the following SQL code and click "Run":

```sql
-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_id INT8 NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Important**: Note that `image_id` is `TEXT NOT NULL`, not UUID, because your images use string IDs like "4960", "4955", etc.

### Step 2: Set up Row Level Security (RLS)

After creating the table, run the RLS migration:

1. In the same **SQL Editor**, copy and paste the content from:
   `migrations/004_fix_comments_schema.sql`
2. Click "Run" to execute

**Alternative**: If you created the table with the wrong schema initially, just run the migration `004_fix_comments_schema.sql` which will drop and recreate the table with the correct schema.

Or run this SQL directly:

```sql
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
CREATE INDEX IF NOT EXISTS comments_image_id_created_at_idx ON public.comments(image_id, created_at DESC);
```

### Step 3: Verify Setup

1. Go to the **Table Editor** tab in your Supabase dashboard
2. You should see a new table called `comments`
3. Check that the RLS policies are active in the **Authentication > Policies** section

## Features Overview

### ✅ What's Implemented:

- **Comments Icon**: Each image shows a comment bubble icon with a badge displaying the number of comments
- **Comments Modal**: Click the icon to open a modal with all comments for that image
- **Add Comments**: Logged-in users can add new comments
- **Edit Comments**: Users can edit their own comments
- **Delete Comments**: Users can delete their own comments
- **Read-Only Access**: Non-logged-in users can view comments but need to log in to interact
- **PhotoSwipe Integration**: Comments are also available when viewing images in the gallery modal

### 🔒 Security:

- **Row Level Security**: Users can only modify their own comments
- **Authentication**: Only logged-in users can create/edit/delete comments
- **Public Reading**: Anyone can read comments (encourages engagement)

### 📱 Responsive Design:

- Mobile-friendly comment interface
- Optimized for both desktop and mobile viewing
- Consistent with your existing design system

## How to Use

1. **Viewing Comments**: Click the comment icon (💬) on any image
2. **Adding Comments**: Log in and type in the comment form, then click "Post Comment"
3. **Editing Comments**: Click the edit button (✏️) on your own comments
4. **Deleting Comments**: Click the delete button (🗑️) on your own comments

## Files Modified/Created

### New Files:

- `src/context/CommentsContext.tsx` - Comments state management
- `src/components/buttons/CommentsButton.tsx` - Comment icon with badge
- `src/components/comments/CommentForm.tsx` - Form for adding comments
- `src/components/comments/CommentItem.tsx` - Individual comment display
- `src/components/modals/comments/CommentsModal.tsx` - Main comments modal
- `migrations/003_setup_comments_rls.sql` - Database setup

### Modified Files:

- `src/types/index.ts` - Added comment types
- `src/app/layout.tsx` - Added CommentsProvider
- `src/components/wrappers/ImageWrapper.tsx` - Added comments button
- `src/components/wrappers/PhotoSwipeWrapper.tsx` - Added modal comments support

## Troubleshooting

### Comments not loading?

- Check that the `comments` table exists in your Supabase database
- Verify RLS policies are set up correctly
- Check browser console for any error messages

### Can't add comments?

- Make sure you're logged in
- Check that the RLS policies allow authenticated users to insert
- Verify the table structure matches the expected columns

### Database errors?

- Run the SQL setup commands again
- Check that your Supabase project has the correct permissions
- Ensure the `auth.users` table exists (it should be created automatically by Supabase Auth)

## Next Steps

The comments feature is now fully integrated into your application! Users can:

- View comment counts on images
- Read all comments for any image
- Add, edit, and delete their own comments (when logged in)
- Enjoy a seamless experience both in grid view and PhotoSwipe modal view

The feature follows your existing patterns and integrates seamlessly with your authentication system.
