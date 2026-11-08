# openCode prompt — fetch new photographers from Wikimedia Commons (Task 1)

> Written 2026-11-08 by Claude (orchestrator). Run in openCode from the web repo root
> `C:\Users\elcar\Documents\aaa_repos\mosaic-photography`. Read `CLAUDE.md` and
> `docs/RUNBOOKS.md` routine 1 first. Background: `docs/research/2026-11-08-new-photographers-sources.md`.

## Goal

Make adding a public-domain photographer a few commands instead of 16 manual steps:

1. A new script fetches candidate images from Wikimedia Commons and builds an HTML review sheet.
2. Carles reviews in the browser (keep / nudity / gender / title / portrait) and saves a decisions file.
3. The same script downloads only the kept originals with the filenames routine 1 requires.
4. Scripts 1–3 take the photographer as an argument instead of hardcoded lists; one wrapper runs them in order.

First users: `eugene-atget`, `gertrude-kasebier`, `rudolf-koppitz`.

## Context you need

- Folder for local images (outside git): `C:\Users\elcar\Documents\WEBs\Mosaic\IMGs\{folder}\`
  with `originals\` → `originalsWEBP\` (script 1) → `w400…w1600\` (script 2). CSV goes to
  `C:\Users\elcar\Documents\WEBs\Mosaic\Supabase\` (script 3). Keep these paths as defaults.
- Filename convention (parsed by `3-generate-supabase-csv.py`, do not change the parser's rules):
  `{folder}_{title-in-hyphens}_year-{YYYY}_{orientation}_{gender}_{color}[_not-nude].{ext}`
  orientation `vertical|horizontal|square`, gender `male|female|couple|group|mixed`, color `bw|color|sepia`.
  **No `not-nude` token ⇒ the image is imported as `nude`.** Lowercase ASCII, no spaces.
- Photographer portrait for cards: `000_aaa_{folder}.{ext}` (filtered out of galleries by
  `fetchGalleryImagesSSR.ts`, `fetchPhotographersBasic.ts`, `fetchPhotographerImageCountsSSR.ts`).
- Node 22 locally (built-in `fetch`). `sharp` is already a dependency. ESM `.mjs` like scripts 1–2.

## Part A — new `scripts/adding-new-photographers/0-fetch-from-commons.mjs`

Two modes in one file (one file on purpose: candidates and download share the Commons metadata
handling; splitting them would duplicate it).

### Mode 1: candidates (default)

```
node scripts/adding-new-photographers/0-fetch-from-commons.mjs --folder rudolf-koppitz \
  --category "Rudolf Koppitz" [--category "…"] [--file "File:…"] [--depth 2] [--min-px 1600] [--max-year 1930]
```

- Commons API `https://commons.wikimedia.org/w/api.php`, `format=json&formatversion=2`.
  Send a `User-Agent` header: `MosaicPhotographyImporter/1.0 (https://www.mosaic.photography)`.
  Follow `continue` tokens. Sleep ~200 ms between requests.
- Collect files from each `--category`, recursing into subcategories up to `--depth` (default 2).
  This is required: e.g. the best Koppitz file (`Bewegungsstudie (Movement Study) 1925, black and white
  photograph by Rudolf Koppitz.jpg`, 1960×2712) sits in `Category:Female nudes by Rudolf Koppitz` →
  `Category:Bewegungsstudie`, not in `Category:Rudolf Koppitz` itself. `--file` adds single files by title
  (repeatable). Dedupe by pageid.
- Per file request `prop=imageinfo|categories`, `iiprop=url|size|mime|extmetadata`,
  `iiurlwidth=400` (thumbnail for the sheet). Keep: title, original url, thumb url, width, height, mime,
  `LicenseShortName`, `License`, `DateTimeOriginal`, `ObjectName`, `ImageDescription` (strip HTML),
  `Artist` (strip HTML), `Credit` (strip HTML), description page url.
- Filters (each rejected file goes to the manifest with a `rejected_reason`, never silently dropped):
  - licence: keep only if `License` is `pd` or starts with `cc0`, or `LicenseShortName` contains
    "Public domain" / "CC0" / "Public Domain Mark". Anything else → `license`.
  - mime: jpeg, png, tiff only → `format`.
  - size: long side ≥ `--min-px` (default 1600) → `too_small`. Koppitz will be run with `--min-px 900`.
  - year: first 4-digit year 1820–1999 in `DateTimeOriginal`, else in `ObjectName`. Year > `--max-year`
    (default 1930) → `too_late`. **No year found → keep, flag `needs_year`** (Carles fills it in the sheet).
- Write `IMGs\{folder}\_commons\manifest.json` (all files, kept + rejected) and
  `IMGs\{folder}\_commons\review.html`.

### review.html (static, self-contained, opened from disk in Chrome)

- One card per kept candidate, **sorted by a normalised title** (lowercase, accents stripped, words like
  "met", "getty", "lccn…", "(cropped)", numbers in brackets removed) so duplicates sit next to each other.
  Show a "possible duplicate" badge when the normalised title equals the previous card's.
- Card: thumbnail (the Commons thumb URL), original size, licence, date string, Commons link,
  ObjectName, description (first 300 chars).
- Inputs per card:
  - `keep` checkbox: pre-ticked only for the largest file of each normalised-title group.
  - `nudity` radio `nude | not-nude` — **no default, must be picked for kept cards**.
  - `gender` select `male|female|couple|group|mixed` — no default, required for kept cards.
  - `possible minor` checkbox (Task 5 rule).
  - `title` text, prefilled from ObjectName in plain English words; Carles edits it
    (neutral wording; some Library of Congress titles use period racial terms and must be rewritten).
  - `year` number, prefilled; required.
  - `color` select `bw|sepia|color`, default `bw`.
  - `portrait` radio (one per sheet): this card becomes the photographer portrait.
- Top bar: counters (kept / missing required fields), a filter "show only kept", and a
  **"Save decisions" button** that downloads `decisions.json`. It refuses to save while a kept card lacks
  nudity, gender, title or year, and lists which ones.
- No external JS/CSS, no analytics, nothing sent anywhere. Thumbnails load from upload.wikimedia.org.

### Mode 2: download

```
node scripts/adding-new-photographers/0-fetch-from-commons.mjs --folder rudolf-koppitz --apply path\to\decisions.json
```

- For each kept item **not** flagged `possible minor`: download the original into `IMGs\{folder}\originals\`
  with the convention filename. `possible minor` items are not downloaded; list them in the output
  (Carles decides those by hand, Task 5).
  - title slug: NFKD, strip accents, lowercase, non-alphanumerics → `-`, collapse, max 60 chars.
  - orientation from width/height: ratio within 0.95–1.05 → `square`, else `vertical` / `horizontal`.
  - `_not-nude` suffix only when nudity = not-nude.
  - extension from mime (`.jpg`, `.png`, `.tif`).
  - name clash → append `-2`, `-3` to the title slug.
- Portrait item → `000_aaa_{folder}.{ext}` (also downloaded even if below `--min-px`; portraits are card
  thumbnails, e.g. Koppitz's only self-portrait `KOPPITZ R.jpg` is 285×385).
- Skip files that already exist (re-runs must be safe). Retry a failed download twice, then report it.
- Write `IMGs\{folder}\_commons\sources.csv`: filename, commons_title, description_url, original_url,
  license, credit, artist, date_string, year, nudity, gender, possible_minor. This is our provenance record.
- Print a summary: downloaded / skipped existing / failed / minors held back.

## Part B — scripts 1–3 take the photographer as arguments

- `1-convert-originals-to-webp.mjs` and `2-generate-responsive-sizes.mjs`: replace the hardcoded
  `authors` arrays with `--folder <slug>` (repeatable). No `--folder` → print usage and exit 1
  (never fall back to the old Brady/Cameron list).
- `3-generate-supabase-csv.py`: `--folder <slug> --author "<display name>"` (one photographer per run)
  and `--out <file>` (default `images_resize_{folder}_{YYYY-MM-DD}.csv` in the Supabase folder).
  `--author` is required because `fix_author()` title-cases the slug and loses accents
  ("eugene-atget" → "Eugene Atget", but the display name and join key must be "Eugène Atget").
  Keep the parser and `fix_author()` as they are for other uses; `--author` just overrides the result.
  Exit 1 with a message if the folder or `originalsWEBP` is missing or if 0 rows were produced.
- New `scripts/adding-new-photographers/run-pipeline.mjs --folder <slug> --author "<name>"`:
  runs 1 → 2 → 3 in order (child_process, `python` on Windows), stops at the first non-zero exit.

## Part C — docs

- `docs/RUNBOOKS.md` routine 1: replace steps 3–7 with the new flow (candidates → review.html →
  decisions.json → `--apply` → `run-pipeline.mjs` → review CSV). Keep steps 8–16. Update
  "Last reviewed". Remove the inconsistency bullet about hardcoded lists if you fixed it.

## Out of scope (do not do)

- No S3 upload, no Supabase access, no `.env` reads, no SQL. Carles uploads and imports by hand.
- No AI / ML / vision on the images (hard rule: no AI on nude images). Nudity and gender come only
  from Carles's choices in the sheet.
- Don't build CDN URLs anywhere new (CLAUDE.md rule 1); `CDN_BASE` in script 3 stays as is.
- Don't change the filename convention, the parser rules, the WebP qualities or `TARGET_WIDTHS`.
- Don't touch `src/`, other scripts, `package.json` dependencies (none needed), or the old
  `scripts/resize-images*.mjs` / `generate_images_csv.py`.
- No tests framework changes. No "for later" options beyond what is listed.

## Check before you report

1. `node scripts/adding-new-photographers/0-fetch-from-commons.mjs --folder rudolf-koppitz --category "Rudolf Koppitz" --min-px 900`
   → manifest + review.html exist; the Bewegungsstudie file above is a kept candidate; report kept /
   rejected counts by reason. **Do not run `--apply`** (Carles reviews first).
2. Open `review.html` structure check only (no need to view the images): required-field check works
   with a hand-made 1-item `decisions.json` → run `--apply` against a temp folder name
   `--folder _test-commons` with that 1 item marked not-nude, confirm the filename format, then delete
   `IMGs\_test-commons`.
3. `node scripts/adding-new-photographers/1-convert-originals-to-webp.mjs` without args → usage, exit 1.
4. `python scripts/adding-new-photographers/3-generate-supabase-csv.py` without args → usage, exit 1.
5. `yarn lint` still clean (scripts are outside `src/`, so it should be unaffected).

## Report back

Files changed, the counts from check 1, any Commons API surprise (licence fields, missing dates),
and anything you skipped. Do not commit; Carles commits.

## Part D — low-resolution rule (added 2026-11-08 07:55, Carles; do this after Parts A–C)

Mosaic promises "high-resolution images, free to download". Low-res files are allowed only as a rare,
deliberate exception, never the norm.

- `--min-px` stays **1600 for every photographer** (that is what produces the full w1600 rendition).
  Ignore the earlier "Koppitz with `--min-px 900`" note.
- New `--low-res-floor` (default 900): files with long side between the floor and `--min-px` are not
  rejected; they go to the manifest as `low_res` and to a **separate section at the bottom of
  review.html** ("Low resolution — exceptions only"), unticked, with a visible badge showing the size.
  Below the floor → rejected `too_small` as before.
- Keeping a low-res card needs a second tick, "accept low-res exception", in addition to `keep`.
- `--apply` prints the number of low-res exceptions kept and a **warning when they are more than 10 %
  of the kept images**; `sources.csv` gets a `low_res` column (true/false).
- The portrait is exempt (card thumbnail).
- Add the rule in one line to `docs/RUNBOOKS.md` routine 1.
- Licence "No restrictions" (Library of Congress / Flickr Commons "no known copyright restrictions"):
  don't reject. Mark the card with a badge "No known restrictions: check" and record
  `license_note=no_known_restrictions` in the manifest and `sources.csv`. Käsebier's LoC files need this.
