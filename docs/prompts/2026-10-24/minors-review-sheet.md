# Prompt for openCode: local contact sheet to review nude images (read-only)

Repo: Mosaic Photography (Next.js 15, TypeScript). Read `CLAUDE.md` first and follow its rules.
Do NOT run any git write commands (Carles commits). Do NOT run `yarn build` (postbuild
regenerates sitemaps and pings IndexNow). Do NOT write to Supabase or S3.

Context (2026-10-24): Carles must review every image marked `nudity = 'nude'` by eye and pick
the ones that could show a person under 18, so they can be withdrawn from the site later.
He needs a local page that shows the thumbnails and lets him tick images and copy their IDs.
The review is done by a human only: do NOT add any image analysis, AI or classification.

## What to build

### 1. `scripts/review-sheet.ts` (new file)

- Copy the env + client setup from the top of `scripts/generate-image-sitemap.ts`
  (dotenv `.env` then `.env.local`, `createClient` with the service role key). Reason: same
  pattern as the other scripts.
- Select from `images_resize`: `id, base_url, filename, title, author, year, gender, width,
  orientation` where `nudity = 'nude'`. Page with `.range()` in blocks of 1000 like
  `generate-image-sitemap.ts` does (Supabase caps a request at 1,000 rows). Read-only.
- Expected total: **682** rows. If 0 rows or a Supabase error: print it and `process.exit(1)`.
- Group by `author`, in this order (review priority), then any other author alphabetically:
  1. `Wilhelm Von Plueschow`  2. `Baron Wilhelm Von Gloeden`  3. `Fred Holland Day`
  4. `Felix Jacques Moulin`   5. `Julia Margaret Cameron`
  Inside a group, sort by `filename`.
- Thumbnail URL: use `getBestS3FolderForWidth(image, 400).url` from
  `src/utils/imageResizingS3.ts` (CLAUDE.md rule 1: never build CDN URLs by hand). Import it
  with a relative path if the `@/` alias does not resolve under `tsx`; check by running it.
- Write ONE self-contained HTML file to `review/nude-review.html` (create the folder).
  Print the per-author counts and the total at the end.

### 2. The HTML page (inline CSS + inline JS, no external libraries)

- One section per author: heading `Author — N images`.
- Grid of cards (CSS grid, `repeat(auto-fill, minmax(220px, 1fr))`). Each card: `<img
  loading="lazy">` (thumbnail), a checkbox, then small text: `id`, `year`, `gender`,
  `filename`.
- Clicking the image toggles the card's checkbox. A ticked card gets a thick red border.
- Sticky bar at the top: "N selected", a button **Copy selected IDs** (copies the ticked ids
  as one comma-separated line, e.g. `12,57,301`, via `navigator.clipboard.writeText`), and a
  button **Clear all**.
- Save the ticked ids in `localStorage` (key `nude-review-v1`) and restore them on load,
  inside try/catch. Reason: Carles reviews 682 images over several sittings.
- A line at the top: "Generated <ISO date> · 682 nude images · tick any image where the
  person could be under 18".
- Plain, neutral styling. No other features.

### 3. `.gitignore`

Add, under the existing "saved page snapshots" block:

```
# local review sheets (contain nude thumbnails and review notes; never commit)
/review/
```

## Out of scope

- No changes under `src/`, no package.json script, no tests for this script.
- No DB writes, no moving/hiding rows, no S3 changes (those come in a later prompt).
- No pagination, filters or search on the page.

## Check before you finish

1. Run `npx tsx scripts/review-sheet.ts` from the repo root. Paste the per-author counts
   (should total 682: Plueschow 224, Gloeden 127, Holland Day 48, Moulin 14, Cameron 1, …).
2. Confirm `review/nude-review.html` exists and give its size. Do not open the images.
3. `git status --short` must show only `.gitignore` and `scripts/review-sheet.ts`
   (the `review/` folder must NOT appear).
4. Report what you skipped or did not check.
