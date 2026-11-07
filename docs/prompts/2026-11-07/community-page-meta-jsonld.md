# Prompt for openCode: /community/photography metadata, duplicate paragraph, JSON-LD

Repo: mosaic-photography (Next.js 15 App Router). Read `CLAUDE.md` first (the 10 rules).
Do the changes below and nothing else. Do not commit.

## Background (why)

The community pages show **contemporary** photographs owned by their photographers
(licences like CC BY, stored in `contributors.license_default`). They are **not** public
domain. Today some metadata on these pages says "public domain", which is wrong and
confuses search engines and AI answers. Also, the pages have no JSON-LD, which breaks
rule 8 in CLAUDE.md ("Every public page needs metadata export + JSON-LD").

Next.js merges metadata **shallowly**: a page's `openGraph` object replaces the root
layout's `openGraph` completely, and a page without `twitter` inherits the layout's
`twitter`. That is why `/community/photography` currently has no `og:image` and shows the
layout's Twitter description "A curated gallery of public domain photographs by legendary
photographers…".

## Files

1. `src/app/community/photography/page.tsx` (hub)
2. `src/app/community/photography/[slug]/page.tsx` (one contributor)

Reference for the JSON-LD pattern (copy its style, do not import from it):
`src/app/photographers/page.tsx` lines ~74–125 (`collectionPageJsonLd`, `breadcrumbJsonLd`,
`<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(...) }} />`,
`serializeJsonLd` from `@/helpers/jsonLd`). Always use `serializeJsonLd`, never `JSON.stringify`
(it escapes `<`).

## Changes

### A. Hub page `src/app/community/photography/page.tsx`

1. **Duplicate paragraph.** The sentence "Unlike the public domain archive, these photographs
   are contemporary work — owned by the photographers who made them, presented here by their
   choice. Mosaic displays them. The photographers keep everything else." appears twice:
   in the header intro `<p>` (lines ~40–46) and in the info card `<p>` (lines ~65–70).
   - Keep it **only in the info card** (lines ~65–70), unchanged.
   - In the header intro `<p>`, remove those three sentences and keep only:
     "Their work reflects a similar appreciation for craftsmanship, visual storytelling, and
     photographic heritage." → rewrite it so it stands alone:
     "Their work shares the archive's appreciation for craftsmanship, visual storytelling and
     photographic heritage."
2. **Metadata.** In `export const metadata`:
   - Add to `openGraph`: `images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "Mosaic Photography community: contemporary photographers" }]`.
   - Add a `twitter` block:
     ```ts
     twitter: {
       card: "summary_large_image",
       title: "Community Contributors – Mosaic Photography",
       description: "<same text as metadata.description>",
       images: ["/images/og-image.jpg"],
     },
     ```
   - Put the description text in one `const PAGE_DESCRIPTION` and reuse it in
     `description`, `openGraph.description`, `twitter.description` and the JSON-LD
     (reason: one source, no drift). Text stays as today.
3. **JSON-LD** (required, rule 8). Inside the component, after `contributors` is fetched,
   render two `<script type="application/ld+json">` blocks at the top of `<main>`:
   - `CollectionPage`: `name` "Mosaic Photography community", `url` the canonical URL,
     `description` PAGE_DESCRIPTION, `mainEntity` = `ItemList` of the contributors
     (`ListItem` with `position`, `name` = `c.name`, `url` = `https://www.mosaic.photography/community/photography/${c.slug}`).
     If there are no contributors, emit `itemListElement: []`.
   - `BreadcrumbList`: Home (`https://www.mosaic.photography/`) → Community
     (`https://www.mosaic.photography/community/photography`).

### B. Contributor page `src/app/community/photography/[slug]/page.tsx`

1. **Wrong wording in `generateMetadata`.**
   - Found branch: `description` is
     "`${name}` contributor gallery on Mosaic Photography. Browse photographs, collections and public domain works."
     → change to
     "`${name}` – contemporary photographs shared on Mosaic Photography's community gallery. The photographer keeps all rights."
   - Not-found branch: `openGraph.description` says "Mosaic is a free, ad-free archive of
     public domain photography…" → use the same text as that branch's `description`.
     Also fix "private works" → "contemporary works" in that branch's `description`.
2. **Metadata images + twitter** (found branch):
   - `generateMetadata` already calls `fetchContributorBySlugSSR`. To get an image, call
     `fetchContributorBySlugWithFeaturedSSR(slug)` instead (it returns the contributor plus
     `featuredImage`; check its return shape in `src/utils/fetchContributorBySlugWithFeaturedSSR.ts`
     and how the hub page builds `imageUrl` from `featuredImage.s3Progressive?.[0]?.url ?? featuredImage.url`).
     Use exactly that expression for the image URL (rule 1: never build CDN URLs by hand).
     Fallback: `/images/og-image.jpg`.
   - Add `openGraph.images: [{ url: imageUrl, alt: contributor.name }]` (no width/height
     unless the image object already has real `width`/`height`; if it does, pass them).
   - Add `twitter: { card: "summary_large_image", title, description, images: [imageUrl] }`.
   - Not-found branch: add `twitter` with the same title/description and `/images/og-image.jpg`.
3. **JSON-LD** (required, rule 8) in the page component, when the contributor exists:
   - `ProfilePage` with `mainEntity` = `Person`: `name` contributor.name, `url` the canonical
     URL, `image` the same imageUrl as above (only if a featured image exists),
     `description` = `contributor.description` if present (plain text, max 300 chars,
     cut at a word boundary), `nationality`/`address` **not** added.
   - `BreadcrumbList`: Home → Community (`/community/photography`) → contributor name (canonical URL).
   - Do not add per-image `license` fields (licences differ per contributor; out of scope).

## Out of scope (do not touch)

- The root layout metadata (`src/app/layout.tsx`), the homepage, FAQ texts, `layout.tsx.bak`.
- Page layout, CSS, `PhotographyClientForm`, `ShareButtons`, fetchers' queries.
- The contributor importer scripts, Supabase, sitemaps, `llms.txt`.
- No new shared helper/component for JSON-LD; inline objects like `photographers/page.tsx`.

## Check before you finish

```bash
yarn lint
npx tsc --noEmit
yarn dev
```
Then:
```bash
curl -s http://localhost:3000/community/photography | grep -c "Unlike the public domain archive"   # expect 1
curl -s http://localhost:3000/community/photography | grep -o '<meta name="twitter:description"[^>]*>'
curl -s http://localhost:3000/community/photography | grep -c 'application/ld+json'               # expect >= 2
curl -s http://localhost:3000/community/photography/elcarles78 | grep -o '<meta property="og:image"[^>]*>'
curl -s http://localhost:3000/community/photography/elcarles78 | grep -c 'application/ld+json'   # expect >= 2
curl -s http://localhost:3000/community/photography/elcarles78 | grep -ci 'public domain works'  # expect 0
```
Report: the diff summary, the outputs of the commands above, and anything you skipped.
