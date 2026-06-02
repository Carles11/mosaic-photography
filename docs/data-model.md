# Data Model — Mosaic Photography

> Supabase (PostgreSQL) tables and data shapes.

## Supabase Tables

### `photographers`
| Column | Type | Notes |
|---|---|---|
| `id` | int | Primary key |
| `name` | text | First name |
| `surname` | text | Last name / URL slug |
| `author` | text | Matches image filenames + S3 folder |
| `biography` | text | HTML biography |
| `biography_md` | text | Markdown biography |
| `intro` | text | Short intro HTML |
| `intro_md` | text | Short intro Markdown |
| `birthdate` | text | Birth year or date |
| `deceasedate` | text\|null | Death year or date |
| `origin` | text | Country/nationality |
| `slug` | text | URL slug (usually = lowercase surname) |
| `website` | text\|null | External website URL |
| `instagram` | text\|null | Instagram handle |

### `images_resize`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid/text | Primary key |
| `base_url` | text | CDN base URL for this photographer |
| `filename` | text | Filename with extension (e.g., `anne-brigman_the-shore_1905-001_vertical_bw_nude.jpg`) |
| `author` | text | Matches `photographers.author` |
| `title` | text | Image title |
| `description` | text | Image description |
| `created_at` | timestamp | Record creation |
| `orientation` | text | `vertical` \| `horizontal` \| `square` |
| `width` | int | Original pixel width |
| `height` | int | Original pixel height |
| `color` | text | `bw` \| `color` |
| `nudity` | text | `nude` \| `not-nude` |
| `gender` | text | `female` \| `male` \| `mixed` |
| `year` | int | Approximate year of photograph |
| `print_quality` | text | `professional` \| `excellent` \| `good` \| `standard` \| `` |

Full image URL: `{base_url}/{size}/{filename_as_webp}`
Example: `https://cdn.mosaic.photography/mosaic-collections/public-domain-collection/anne-brigman/w800/anne-brigman_the-shore_1905-001_vertical_bw_nude.webp`

### `user_favorites`
| Column | Type | Notes |
|---|---|---|
| `id` | int | Primary key |
| `user_id` | uuid | Supabase auth user ID |
| `image_id` | text | References images_resize.id |
| `created_at` | timestamp | |

### `collections`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Owner |
| `name` | text | Collection name |
| `description` | text\|null | Optional description |
| `created_at` | timestamp | |
| `image_count` | int | Computed |
| `preview_images` | text[] | First 4 image URLs |

### `collection_favorites`
| Column | Type | Notes |
|---|---|---|
| `collection_id` | uuid | |
| `favorite_id` | int | References user_favorites.id |
| `added_at` | timestamp | |

### `comments`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Commenter |
| `image_id` | text | |
| `content` | text | Comment text |
| `created_at` | timestamp | |
| `updated_at` | timestamp\|null | |
| `user_email` | text | Display name (not actual email) |

### `user_profiles`
| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | Auth user ID |
| `filters` | jsonb | Persisted `GalleryFilter` object |
| (other profile fields) | | |

### `affiliate_advertisers`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `name` | text | |
| `slug` | text | Matches `/toolkit/[slug]` |
| `platform` | text | e.g., 'Awin', 'Amazon' |
| `template` | text\|null | 'marketplace' \| 'software' \| 'print' |
| `editorial_note` | jsonb | `{ en: string }` |
| (various URL fields) | | |

### `affiliate_products`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `advertiser_id` | uuid | FK to affiliate_advertisers |
| `type` | text | 'book' \| 'print' \| 'tool' |
| `title` | jsonb | `{ en: string }` |
| `description` | jsonb | `{ en: string }` |
| `affiliate_url` | text | |
| `photographer_author` | text\|null | Links to photographers.author |
| `featured` | boolean | |
| `sort_order` | int | |

---

## Row Level Security (RLS)

- `user_favorites`: users read/write own rows only
- `collections`: users manage own collections; public read for shared collections
- `comments`: public read; authenticated write own; see `migrations/003_setup_comments_rls.sql`
- `user_profiles`: users read/write own row only

---

## Supabase Client Usage

```typescript
// Browser (client components, contexts)
import { supabase } from '@/lib/supabaseClient';

// Server (server components, SSR utils)
import { supabaseServer } from '@/lib/supabaseServerClient';

// Never use service role key in browser code
```

---

## Migrations

Located in `migrations/` (numbered SQL files):
- `002_create_favorites.sql`
- `003_setup_comments_rls.sql`
- `004_fix_comments_schema.sql`
- `005_create_collections.sql`
- `006_fix_favorites_foreign_key.sql`
