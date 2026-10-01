# openCode prompt — image sitemap: DB slug + no duplicate images

> Written 2026-10-01. Run from the web repo root. Do exactly these two items in
> ONE file: `scripts/generate-image-sitemap.ts`. Do NOT run any git write
> command (no add, commit, push, stash, checkout, restore). Carles commits.

## Context

Repo `mosaic-photography` (Next.js 15, TypeScript, Supabase, AWS Amplify).
Read `CLAUDE.md` first. Decision 2026-10-01: photographer URLs are ASCII only
and come from the DB column `photographers.slug`.

Earlier today `scripts/generate-sitemap-0.ts` was fixed the same way (see its
"Add photographer pages" loop — copy that pattern). The image sitemap still has
the old bug:

- It selects `name, surname, origin` from `photographers` and builds the page
  URL as `surname.toLowerCase().replace(/\s+/g, "-")`. Result in the live
  `image-sitemap.xml`: `<loc>https://www.mosaic.photography/photographers/de-la-vaudère</loc>`
  with 38 images attached — a non-ASCII URL that now 308-redirects.
- The live file has 1010 `<image:loc>` entries but only 1000 unique ones:
  10 images are listed twice.

## Item 1 — use the DB slug

1. Change the photographers query to `.select("name, surname, origin, slug")`.
2. In the `photographers.forEach` loop, replace the line
   `const slug = \`${photographer.surname}\`.toLowerCase().replace(/\s+/g, "-");`
   with:

```ts
const slug = photographer.slug;
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.warn(`[image-sitemap] skipping photographer with missing or non-ASCII slug: ${photographer.surname} -> ${slug}`);
  return;
}
```

3. Do NOT change how images are matched to photographers
   (`img.author...includes(photographer.surname...)`) — out of scope.

## Item 2 — never list the same image twice

1. Just before `photographers.forEach(`, add:
   `const seenImageLocs = new Set<string>();`
2. Make sure each image `<image:loc>` is emitted at most once in the whole
   file. Simplest way: inside the loop, before building the `<url>` block,
   filter `photographerImages` to the ones whose computed loc is not yet in
   `seenImageLocs`, adding each kept loc to the set. To get the loc, extract
   the URL-building lines from `makeImageXml` into a small helper
   `imageLoc(image)` that returns the same string `makeImageXml` uses now, and
   make `makeImageXml` call that helper (so the URL logic exists only once).
3. If after filtering a photographer has 0 images, skip the `<url>` block (the
   existing `if (photographerImages.length > 0)` should then use the filtered list).
4. At the end, `console.log` how many duplicates were skipped.

Do not touch anything else in the file (size buckets, encoding, captions, the
homepage block, file writing).

## Verification

1. `yarn lint`, `yarn test`, `yarn build` (`next build` must pass; the
   `postbuild` step is known to fail on this machine with "Node.js 20 detected
   without native WebSocket support" — expected, do not fix, do not edit
   `public/*.xml` by hand).
2. `npx tsc --noEmit -p .` should show no new errors in
   `scripts/generate-image-sitemap.ts` (if the scripts folder is not part of
   the tsconfig, just say so).

## Final report (short)

1. The diff summary of `scripts/generate-image-sitemap.ts`.
2. Lint / test / next build / tsc: pass or fail (errors only).

---

## Follow-up (same day) — undo the homepage seeding

The 10 "duplicates" turned out to be the homepage's featured images, listed
once under `/` and once under their photographer page. That is valid for
Google and the photographer page is the more relevant one, so they must stay
in both places.

In `scripts/generate-image-sitemap.ts`, delete exactly these three lines
(the comment and the seeding call) and nothing else:

```ts
  // The homepage featured images above are already in the file; seed the set so
  // they are not repeated again inside a photographer <url> block.
  images.slice(0, 10).forEach((image) => seenImageLocs.add(imageLoc(image)));
```

Keep `seenImageLocs`, the filter, `imageLoc()` and the console.log. Then run
`yarn lint` and `npx tsc --noEmit -p .` and report pass/fail. No git write
commands.
