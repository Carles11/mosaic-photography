# Feature: Photographers

> Individual photographer pages with biography, timeline, and gallery.

## Files

| File | Role |
|---|---|
| `src/app/photographers/[surname]/page.tsx` | Dynamic photographer page (server) |
| `src/app/photographers/client/PhotographerLinks.tsx` | External links (website, instagram) |
| `src/utils/fetchPhotographerByIdSSR.ts` | Fetches single photographer + images |
| `src/utils/fetchPhotographersBasic.ts` | Lightweight photographer list |
| `src/utils/fetchPhotographersWithFeaturedSSR.ts` | Photographers + featured images (homepage) |
| `src/components/cards/PhotographersViewCard.tsx` | Card in photographer grid |
| `src/components/sliders/photographers/` | Embla carousel on homepage |
| `src/components/gallery/PhotographerGalleryZoom.tsx` | Zoomed gallery for one photographer |
| `src/components/timeline/Timeline.tsx` | Historical timeline component |
| `src/lib/timeline/photographersTimelines.ts` | Timeline data per photographer |
| `src/components/modals/photographer/PhotographerModalBody.tsx` | Photographer info modal |

---

## Data Shape

`Photographer` type (`src/types/gallery.ts`):
```typescript
{
  id: number;
  name: string;           // First name
  surname: string;        // Last name (also the URL slug)
  author: string;         // Matches image filename prefix and S3 folder name
  biography?: string;     // HTML version
  biography_md?: string;  // Markdown version (preferred for AI/agents)
  intro?: string;         // Short intro HTML
  intro_md?: string;
  birthdate: string;
  deceasedate?: string | null;
  origin?: string;
  slug?: string;          // URL slug (usually === surname.toLowerCase())
  website?: string;
  instagram?: string;
  images?: ImageData[];
}
```

---

## URL Structure

Photographer pages: `/photographers/{surname}` (lowercase)

Examples:
- `/photographers/stieglitz` → Alfred Stieglitz
- `/photographers/brigman` → Anne Brigman
- `/photographers/demachy` → Robert Demachy

**Agent/AI access:** Append `.md` to get raw Markdown biography:
- `https://www.mosaic.photography/photographers/stieglitz.md`

---

## Page Structure

`src/app/photographers/[surname]/page.tsx` (server component):

1. Fetches photographer data via `fetchPhotographerByIdSSR(surname)`
2. Exports `generateMetadata` — builds title, description, canonical, OG/Twitter
3. Emits `Person` JSON-LD schema with `name`, `birthDate`, `deathDate`, `nationality`, `description`
4. Renders: intro → biography (react-markdown) → historical timeline → gallery

---

## Image Naming Convention

Photographer images follow:
```
{author}_{title}_{year}-xxx_{orientation}_{color}[_{nudity}].jpg/webp
```

- `author`: matches `photographer.author` field (e.g., `anne-brigman`)
- Photographer portrait: `000_aaa_{author}.webp` (filtered out of gallery)
- S3 folder: `{author}/` under CDN base

---

## Adding a New Photographer

1. Add row to `photographers` Supabase table (all required fields)
2. Create S3 folder: `{author}/` with subfolders: `originals/`, `originalsWEBP/`, `w400/`, `w600/`, `w800/`, `w1200/`, `w1600/`
3. Run scripts:
   - `scripts/adding-new-photographers/1-convert-originals-to-webp.mjs`
   - `scripts/adding-new-photographers/2-generate-responsive-sizes.mjs`
   - `scripts/adding-new-photographers/3-generate-supabase-csv.py`
4. Import generated CSV into `images_resize` Supabase table
5. Add timeline data to `src/lib/timeline/photographersTimelines.ts` (optional)
6. Run `yarn build` to regenerate sitemaps

---

## Timeline

`src/lib/timeline/photographersTimelines.ts` contains static timeline data.
`src/components/timeline/Timeline.tsx` uses `react-chrono` to render it.

Each entry: `{ title: string; cardTitle: string; cardDetailedText: string; }`
