# Database Migrations

This folder contains SQL migration files for the Mosaic Photography project.

## How to Run Migrations

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the "SQL Editor" section
3. Copy and paste the content of each migration file in order:
   - `001_create_user_profiles.sql`
   - `002_create_favorites.sql`
4. Execute each migration by clicking "Run"

### Using Supabase CLI (Alternative)

If you have the Supabase CLI installed:

```bash
# Make sure you're logged in and linked to your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

## Migration Files

### 001_create_user_profiles.sql

Creates the `user_profiles` table to store extended user information:

- `id` - UUID referencing auth.users.id
- `name` - Display name
- `instagram` - Instagram handle (without @)
- `website` - User's website URL
- `created_at` / `updated_at` - Timestamps

Includes Row Level Security (RLS) policies so users can only access their own profiles.

### 002_create_favorites.sql

Creates the `favorites` table to store user's favorite images:

- `id` - Primary key UUID
- `user_id` - References auth.users.id
- `image_id` - Image identifier
- `created_at` - Timestamp

Includes RLS policies and proper indexing for performance.

### 003_setup_comments_rls.sql

Sets up Row Level Security (RLS) policies for the `comments` table:

- Enables RLS on the comments table
- Allows anyone to read comments (public access)
- Allows only authenticated users to create comments
- Allows users to edit/delete only their own comments
- Creates performance indexes

**Note**: This migration assumes the `comments` table already exists. You need to create it manually first:

```sql
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_id INT8 NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Verification

After running the migrations, you can verify they worked by checking:

1. In Supabase Dashboard → Table Editor:
   - `user_profiles` table exists
   - `favorites` table exists

2. In Supabase Dashboard → Authentication → Policies:
   - RLS policies are created for both tables

## Notes

- All tables have Row Level Security enabled
- Users can only access/modify their own data
- Foreign key constraints ensure data integrity
- Proper indexes are created for performance
- Automatic timestamp updating is set up
