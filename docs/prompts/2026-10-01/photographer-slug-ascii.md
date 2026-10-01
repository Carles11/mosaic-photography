# openCode prompt — ASCII photographer URLs in the sitemap (Task 1 slug decision A)

> Written 2026-10-01. Run from the web repo root. Do exactly these two items.
> Do NOT run any git write command (no add, commit, push, stash, checkout,
> restore). Carles commits.

## Context (read first)

Repo `mosaic-photography` (Next.js 15 App Router, TypeScript, Supabase,
AWS Amplify). Read `CLAUDE.md` first. Decision taken 2026-10-01: **photographer
URLs are ASCII only** (no accents).

Facts already checked:
- The photographer page `src/app/photographers/[surname]/page.tsx` resolves
  the URL by the Supabase column `photographers.slug`
  (`fetchPhotographerBySlugSSR`, `fetchAllPhotographerSlugsSSR` in
  `src/utils/fetchPhotographerByIdSSR.ts`). The slug in the DB for Jane de la
  Vaudère is already ASCII: `de-la-vaudere`. The site links to
  `/photographers/de-la-vaudere` and Google already shows that URL.
- **The bug:** `scripts/generate-sitemap-0.ts` does not use `slug`. It selects
  only `surname` and builds the URL as
  `surname.toLowerCase().replace(/\s+/g, "-")`, which produced the raw,
  non-ASCII `https://www.mosaic.photography/photographers/de-la-vaudère` in
  `public/sitemap-0.xml`. Google lists that URL as "Discovered – currently not
  indexed". No database change is needed.

## Item 1 — Sitemap uses the DB slug

In `scripts/generate-sitemap-0.ts`:
1. Change the photographers query from `.select("surname")` to
   `.select("surname, slug")`.
2. In the "Add photographer pages" loop, replace the line that builds `slug`
   from `surname` with the DB value, and skip bad rows loudly:

```ts
const slug = photographer.slug;
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.warn(`[sitemap-0] skipping photographer with missing or non-ASCII slug: ${photographer.surname} -> ${slug}`);
  return;
}
```

   (`return` inside `forEach` skips that row.) Leave the rest of the loop as is.
3. Do not touch any other part of the file.

## Item 2 — 301 for the accented URL

In `next.config.ts`, inside `async redirects()`, add after the
`/community/photography/elcarles` entry:

```ts
{
  source: "/photographers/de-la-vaudère",
  destination: "/photographers/de-la-vaudere",
  permanent: true,
},
```

## Verification

1. `yarn lint` and `yarn test` must pass.
2. `yarn build`. Note: the `postbuild` sitemap step is known to fail on this
   machine (Node 20, Supabase realtime needs native WebSocket). That is
   expected; only `next build` must succeed. Do NOT try to fix postbuild and do
   NOT edit `public/sitemap*.xml` by hand.
3. `yarn start`, then in a second terminal:

```bash
for u in "photographers/de-la-vaud%C3%A8re" "photographers/de-la-vaudere" "photographers/weston"; do
  printf "%s -> " "$u"; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "http://localhost:3000/$u"
done
```

Expected: the first → `308 http://localhost:3000/photographers/de-la-vaudere`,
the other two → `200`.

If the first line is NOT a 308: change the redirect `source` to the
percent-encoded form `"/photographers/de-la-vaud%C3%A8re"`, rebuild, retest.
If it still fails, put both entries back to the original `source` above, STOP
and report the outputs. Do not add middleware code.

4. Stop the server. If `public/sw.js` shows as modified in `git status`, leave
   it; Carles restores it.

## Final report (short)

1. Files changed.
2. Lint / test / next build: pass or fail (errors only).
3. The curl lines with real status codes, and which `source` form worked.
