# Prompt for openCode — slim the homepage payload + fix the meta description

Repo: Mosaic Photography (Next.js 15 App Router, React 19, TypeScript). Read `CLAUDE.md` first
and follow its 10 rules. Do NOT run any git write commands (no add/commit/push). Carles commits.

## Why

The live homepage HTML is **1.21 MB**. **946 KB** of it is the React Server Components payload
(`self.__next_f.push(...)` scripts): `src/app/page.tsx` passes ~1,000 full `images_resize` rows
to the client component `HomeClient`, and every field of every row is serialized into the HTML.
The visible HTML is only ~250 KB. Bing Webmaster Tools flags "HTML size is too long" on `/`.
Bing also flags the homepage meta description as an **error** (too long: ~205 chars; keep it
between 50 and 160).

Goal: send the client only the image fields it actually uses, without changing what the page
shows or how the gallery, filters and lightbox behave.

## Change 1 — meta description in `src/app/page.tsx`

Replace the value of `metadata.description` (the top-level one, NOT `openGraph`/`twitter`) with
exactly:

```
Public domain vintage nude photography by legendary photographers, with biographies, timelines and over 1,000 copyright-free fine-art images.
```

Do not change the title, the `openGraph` or `twitter` blocks, or the JSON-LD.

## Change 2 — find out which image fields the client really uses (report first)

`src/utils/fetchGalleryImagesSSR.ts` selects:
`id, base_url, filename, author, title, description, created_at, orientation, width, height,
print_quality, gender, color, nudity, year`
and then **adds** `url` (= `base_url` + `/` + `filename`, i.e. a duplicate of two fields) and
`mosaicType`.

1. Trace the `images` prop from `src/app/HomeClient.tsx` →
   `src/components/wrappers/HomeClientWrapper.tsx` → `src/components/gallery/Gallery.tsx` →
   `GalleryVirtualizer.tsx`, `ImageWrapper.tsx`, the lightbox, the filters
   (`src/context/settingsContext/filters.tsx`), comments, collections/favorites, and anything
   else that receives an image object from this list.
2. For **each** field above (including `url` and `mosaicType`), list the files and lines that read
   it on the client. Put the result as a table at the top of your final answer.
3. Note especially:
   - `url`: can every consumer build it from `base_url` + `filename` instead? Image URLs must go
     through `src/utils/imageResizingS3.ts` (CLAUDE.md rule 1) — check whether consumers already
     do that and `url` is only a fallback.
   - `created_at`: used for any sorting/filtering on the homepage?
   - `description`: used for `alt` text or the lightbox caption? If yes, it stays.

## Change 3 — trim the payload

Based on Change 2, and **only for fields with zero client consumers**:

1. Remove them from the object passed to `HomeClient`. Preferred place: map the array in
   `src/app/page.tsx` right before `<HomeClient images={...}>` to a slim object, and keep
   `buildHomePageSchema(images)` using the **full** objects (the JSON-LD needs `title`,
   `description`, `width`, `height`, `base_url`, `filename`).
2. If `url` is only used where `base_url` + `filename` are also available, replace those reads
   with the existing helpers in `src/utils/imageResizingS3.ts` (or a one-line join if the
   consumer needs the original-file URL) and stop sending `url`. If you are not sure a consumer
   can do without `url`, keep `url` and say so.
3. Update the TypeScript types so the slim type is explicit (e.g. a `HomeGalleryImage` type in
   `src/types/gallery.ts`, or `Pick<...>`), rather than casting with `as`.
4. Do NOT:
   - add pagination, infinite loading, or any client-side Supabase/API fetch (CLAUDE.md rule 7);
   - add image preloading (rule 2);
   - change the `nudity` default or filter persistence (rules 3 and 10);
   - change `fetchGalleryImagesSSR` for other callers — check with grep whether anything else
     calls it, and if so leave its return shape unchanged.

## Change 3b — photographer rows (audit finding, 2026-10-20)

`src/app/page.tsx` also passes photographers from `fetchPhotographersWithFeaturedSSR` /
`src/utils/fetchPhotographersBasic.ts`. An audit found every photographer's full
`biography` / `biography_md` (and possibly `intro_md`) is serialized to the homepage client
but never shown there. Apply the same rule: trace which photographer fields the homepage
client components read, and pass only those (slim type, no `as` casts). Do not change what
photographer PAGES (`/photographers/[surname]`) receive — check callers before editing a
shared fetcher.

## Change 4 — measure (before and after)

Run `yarn dev` and, before your changes and after them:

```bash
curl -s http://localhost:3000/ -o /tmp/home.html && wc -c /tmp/home.html
grep -o 'self.__next_f.push' /tmp/home.html | wc -l
```

and report the total byte size of the page and of the `self.__next_f` scripts
(e.g. with a short node or python one-liner). Dev numbers are larger than production; the
before/after ratio is what matters.

## Change 5 — report (do not implement) the bigger option

If the slim payload is still above ~400 KB, describe in 5–10 lines how the homepage could
server-render only the first N images and load the rest later **from the server** (route
handler or server action in `src/app/`, data still via a `*SSR.ts`-style server helper),
and what it would mean for the filters (filters currently run over the full list on the
client). Do not implement it.

## Checks before you finish

- `yarn lint` and `npx tsc --noEmit` clean.
- `yarn dev`: homepage renders, gallery scrolls, filters (nudity, color, orientation, author)
  still change the gallery, the lightbox opens and shows title/description, comment counts load.
- The homepage HTML still contains the H1, the `ld+json` script with 12 `ImageObject`s, and
  `<img>` tags for the gallery.
- `<meta name="description">` in the HTML shows the new text.

## Final answer format

1. The field-usage table (Change 2).
2. Files changed, with one line each on why.
3. Before/after sizes (Change 4).
4. The pagination note (Change 5), if applicable.
5. Anything you were unsure about and left as is.
