# Prompt for openCode: image sitemap misses 165 images; sitemap scripts fail silently

Repo: Mosaic Photography (Next.js 15, TypeScript). Read `CLAUDE.md` first and follow its 10 rules.
Do NOT run any git write commands. Carles commits. Do NOT run `yarn build` (postbuild pings
IndexNow). Change ONLY the two files named below.

## Context (checked 2026-10-21)

- Supabase table `images_resize` has **1,165 rows** (SQL `count(*)`), all unique.
- `scripts/generate-image-sitemap.ts` fetches it with `.limit(5000)`, but the Supabase API returns
  at most **1,000 rows per request**, so `public/image-sitemap.xml` holds only 1,000 unique images.
  165 images are missing from the sitemap Google reads.
- Both sitemap scripts handle a Supabase error with `console.error` + `return`, so the process
  exits 0 and the build carries on. Postbuild (`package.json`) is
  `tsx scripts/generate-sitemap-0.ts && tsx scripts/generate-image-sitemap.ts && tsx scripts/indexnow.ts`.

## Change 1: `scripts/generate-image-sitemap.ts`: fetch every row

Replace the single `images_resize` query with a loop that pages through the table:
`.order("id").range(from, from + 999)`, same `select(...)` columns as today, appending each page,
stopping when a page returns fewer than 1,000 rows. Remove `.limit(5000)`. Keep it inline in this
file (no shared helper; only one script needs it). After the loop, log
`[image-sitemap] fetched N images_resize rows`.
At the end, before writing, log the number of `<image:image>` entries written.

Reason for `.order("id")`: without a fixed order, pages can overlap or skip rows.

## Change 2: both sitemap scripts fail loudly instead of writing partial files

Files: `scripts/generate-image-sitemap.ts` and `scripts/generate-sitemap-0.ts`.

1. Every place that today does `console.error(...)` + `return` after a Supabase error:
   keep the `console.error`, then `process.exit(1)` instead of `return`.
2. Refuse to write when the data is empty: in `generate-image-sitemap.ts` if the fetched images
   or photographers are empty, and in `generate-sitemap-0.ts` if photographers are empty →
   `console.error("[<script>] refusing to write: no <table> rows")` + `process.exit(1)`.
   (Contributors and active advertisers may legitimately be empty; leave those as they are.)
3. Replace the last line `xxx().catch(console.error);` in both files with
   `.catch((err) => { console.error(err); process.exit(1); });`

Reason: a non-zero exit stops the `&&` chain and fails the Amplify build, so the previous live
deploy and its sitemaps stay up. A silently partial sitemap tells Google pages disappeared.
This is deliberate: do not soften it to a warning.

## Out of scope (do NOT change)

- The homepage gallery fetch `src/utils/fetchGalleryImagesSSR.ts` (also capped at 1,000; Carles
  decides separately because of payload size).
- `scripts/restore-missing-large-renditions.mjs`, `scripts/indexnow.ts`, any `src/` file.
- XML format, `imageLoc`, captions, the homepage `<url>` block with 10 images, photographer
  matching by `author`/`surname`.
- No new dependencies, no tests, no refactor of the duplicated Supabase client setup.

## Verify (report every number)

1. `yarn gen:sitemap` (needs `.env.local`; it only writes the 3 files in `public/`, no IndexNow).
   Report: rows fetched (expect 1,165), `<image:image>` count, and unique `<image:loc>` count:
   `grep -o "<image:loc>[^<]*" public/image-sitemap.xml | sort -u | wc -l` (before: 1,000;
   expect ~1,165; report any shortfall and which `author` values did not match a photographer).
2. Failure path: temporarily change the table name in the image query to `images_resize_x`, run
   `yarn generate-image-sitemap`, then `echo $?`. Expect non-zero, and `public/image-sitemap.xml`
   unchanged from step 1. Revert the temporary change and confirm with `git diff scripts/`.
3. `yarn lint` and `npx tsc --noEmit`: clean.
4. Leave the regenerated `public/*.xml` files in the working tree (Carles commits them).
5. Final reply: files changed, the numbers above, and anything skipped or unchecked.
