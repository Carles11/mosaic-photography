# Prompt for openCode: fix 2 issues in the exclude_from_index change (uncommitted)

Repo: Mosaic Photography. Same rules as `docs/prompts/2026-10-24/exclude-from-index.md`
(no git writes, no `yarn build`, no DB/S3). Only these two fixes.

## Fix 1 (bug): `src/app/photographers/[surname]/page.tsx`

The `.filter(... exclude_from_index !== true)` was added to `imagesWithUrl` (~line 264). That list
also feeds the visible gallery (`<PhotographerGalleryZoom images={imagesWithUrl} />`, ~line 440)
and the "Collection Size" count (~lines 380, 438), so it HIDES the images on the page.
Decision: the images stay visible; only search engines must not get them.

- Remove the filter from `imagesWithUrl` (restore the original `.map` only).
- Apply the filter only where the JSON-LD is built: `const gallerySchemaImages = imagesWithUrl
  .filter((img) => (img as ImageWithOrientation).exclude_from_index !== true)
  .map(...)` (~line 273).

## Fix 2 (noise): `migrations/README.md`

The diff turned the empty line after `### 011_rls_storage_avatars_qa_logs.sql` into a line with a
single space. Restore it to an empty line.

## Check

`yarn lint`, `npx tsc --noEmit` (src), `yarn test`. Then show `git diff -- "src/app/photographers/[surname]/page.tsx" migrations/README.md`.
