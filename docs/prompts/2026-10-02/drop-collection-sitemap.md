# openCode task: stop advertising user collections to search engines

Date: 2026-10-02 · Repo: mosaic-photography (Next.js 15) · Branch: main
Context: docs/TASKS.md Task 3, Findings 2026-10-02.

## Why

`/profile/collections/<uuid>` pages are user-made lists. They already send
`noindex` (`src/app/profile/collections/[id]/layout.tsx`), but they are also
listed in `public/collection-sitemap.xml`. A sitemap says "index this", the
page says "don't": a mixed signal, and Search Console currently shows 9 of
them under "Discovered – currently not indexed". Carles decided (2026-10-02)
they do not need to be indexed. Decision: keep them `noindex`, remove them
from every sitemap.

## Do exactly this (nothing else)

1. `package.json`: in the `postbuild` and `gen:sitemap` scripts, remove
   ` && tsx scripts/generate-collection-sitemap.ts` (keep everything else,
   including `tsx scripts/indexnow.ts` at the end of postbuild).
2. Delete `scripts/generate-collection-sitemap.ts`.
3. Delete `public/collection-sitemap.xml`.
4. `scripts/generate-sitemap-0.ts` (around line 178, the `sitemapIndex`
   template string): remove the `<sitemap>` block whose `<loc>` is
   `https://www.mosaic.photography/collection-sitemap.xml`. The index must
   keep exactly two entries: `sitemap-0.xml` and `image-sitemap.xml`.
5. `public/sitemap.xml` (committed copy): remove the same
   `collection-sitemap.xml` `<sitemap>` block. Keep the other two unchanged.
6. `public/robots.txt`: remove the line
   `Sitemap: https://www.mosaic.photography/collection-sitemap.xml`.
   Do NOT add any `Disallow` for `/profile/` (Google must be able to crawl
   the page to see its noindex).
7. `src/app/profile/collections/[id]/layout.tsx`: change
   `robots: { index: false, follow: false }` to
   `robots: { index: false, follow: true }` (links to photographer pages
   may pass signals; the page itself stays out of the index).
8. `scripts/indexnow.ts`: check it does not submit `/profile/collections/`
   URLs or read `collection-sitemap.xml`. If it does, remove that part.
9. Docs: in `docs/features/seo.md` remove the two table rows that mention
   `generate-collection-sitemap.ts` / `/collection-sitemap.xml`, and add one
   line under the sitemap table: "User collections (`/profile/collections/*`)
   are `noindex, follow` and not in any sitemap (decision 2026-10-02)."
   In `docs/RUNBOOKS.md` (routine 1, step 14) change
   "regenerates `sitemap-0`, `image-sitemap`, `collection-sitemap`" to
   "regenerates `sitemap-0`, `image-sitemap` and the `sitemap.xml` index".

## Rules

- Do not touch any other file. Do not change other robots/metadata.
- Do not run git add/commit/push. Carles commits.
- Do not run `npm run build` (postbuild needs prod secrets and pings IndexNow).

## Verify and report

- `npx tsc --noEmit` passes.
- `npm run lint` passes (or report pre-existing errors unchanged).
- `git grep -n "collection-sitemap"` returns matches only under
  `docs/seo-reports/`, `docs/prompts/` or `docs/TASKS.md`.
- `git status` lists exactly: package.json, scripts/generate-collection-sitemap.ts (deleted),
  public/collection-sitemap.xml (deleted), scripts/generate-sitemap-0.ts,
  public/sitemap.xml, public/robots.txt,
  src/app/profile/collections/[id]/layout.tsx, docs/features/seo.md,
  docs/RUNBOOKS.md (+ scripts/indexnow.ts only if step 8 needed a change).
- Reply with the `git diff --stat` and one line per step: done / not needed.
