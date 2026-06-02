# Feature: Gallery

> Masonry photo gallery with filtering, virtualisation, lightbox, and social features.

## Files

| File | Role |
|---|---|
| `src/utils/fetchGalleryImagesSSR.ts` | Fetches + processes images from Supabase |
| `src/components/gallery/Gallery.tsx` | Applies filters, attaches photographer slugs |
| `src/components/gallery/GalleryVirtualizer.tsx` | Masonry grid, lightbox, downloads, favorites |
| `src/components/gallery/PhotographerGalleryZoom.tsx` | Per-photographer zoomed lightbox view |
| `src/components/wrappers/ImageWrapper.tsx` | Picks CDN rendition, emits JSON-LD |
| `src/context/settingsContext/filters.tsx` | Filter state, persisted to Supabase |
| `src/utils/imageResizingS3.ts` | **All CDN URL construction** |
| `src/utils/mosaicLayout.ts` | Masonry layout calculations |

---

## Data Flow

```
fetchGalleryImagesSSR()
  → Supabase: images_resize (id, base_url, filename, author, orientation, color, nudity, year, ...)
  → filter: remove filename starting with "000_aaa" (photographer portraits)
  → shuffle: random order every load
  → add mosaicType per image:
      index % 3 === 0          → "large"  (spans 2 rows)
      horizontal && index%4<2  → "wide"   (spans 2 cols)
      index % 9 === 2          → "tall"
      else                     → "normal"
  → HomeClient → Gallery → GalleryVirtualizer
```

---

## Gallery Filters

**Default:** `nudity: "nude"` — this is intentional for the site's audience.

Filter shape (`GalleryFilter` in `src/types/gallery.ts`):
```typescript
{
  orientation?: "vertical" | "horizontal" | null;
  color?: "bw" | "color" | null;
  nudity?: "nude" | "not-nude" | null;
  gender?: "male" | "female" | "mixed" | null;
  print_quality?: "professional" | "excellent" | "good" | "standard" | "" | null;
  year?: { from: number; to: number } | null;
}
```

Filters are:
- Local UI state in `FiltersProvider`
- Persisted to `user_profiles.filters` column for logged-in users
- Applied in `Gallery.tsx` client-side (not at the DB query level)

Filters modal: open via `open('galleryFilters', { filters, onApply, onClose })`

---

## ImageWrapper

`src/components/wrappers/ImageWrapper.tsx` is the primary image rendering component.

It:
- Receives `ImageData` (or array)
- Calls `getBestS3FolderForWidth()` to pick the correct CDN rendition
- Renders `next/image` with correct `width`, `height`, `alt`
- Emits `ImageObject` JSON-LD for image SEO
- Supports `showOverlayButtons` to show HeartButton + CommentsLauncher

**Never construct CDN URLs outside this component or `imageResizingS3.ts`.**

---

## Masonry Grid (GalleryVirtualizer)

Uses `@virtuoso.dev/masonry` for windowed rendering.

- Only renders images in/near viewport (performance)
- Each card can open: lightbox · comments modal · download modal · add-to-collection modal · photographer modal
- Coordinates favorites toggle via `FavoritesContext`

---

## Lightbox

Uses `yet-another-react-lightbox`. Opens from `GalleryVirtualizer`.

Progressive zoom loading:
- `getAllS3Urls(image)` builds `s3Progressive` array
- `getProgressiveZoomSrc(s3Progressive, zoomLevel, width)` picks optimal size
- At zoom=1: max w1600 (never originals for browsing)
- At zoom>1: scales up to originalsWEBP

---

## Download System

`src/utils/getAvailableDownloadOptionsForImage.ts` — determines available options per image quality tier.
`src/utils/handleDownloadOptionClick.ts` — handles download execution.
Opens via: `open('downloadOptions', { image, onDownloadOption, onClose })`

---

## Key Invariants

- **Do not preload images.** Removed intentionally. Next.js lazy loading handles it.
- **Do not query Supabase for filtering.** Filters run client-side on already-fetched data.
- **Gallery defaults to `nudity: "nude"`.** Don't change this default.
- **`000_aaa_` prefix = photographer portrait.** Always filtered out of gallery.
