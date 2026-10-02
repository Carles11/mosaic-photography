# RUNBOOKS — Mosaic (recurring routines)

> "Steps to follow to…" for jobs that repeat. Derived from the scripts in
> `scripts/`, `migrations/`, `docs/TASKS.md` and the affiliate runbook — the
> code is the truth; if a script changes, update the matching section here.
> Where to run: **Git Bash in the web repo root** unless stated. Secrets live in
> `.env.local` (repo root) and Amplify env vars — never paste them into docs/chat.
> Last reviewed: 2026-09-26

**Common prerequisites**
- `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (used by `scripts/lib/supabaseAdmin.mjs` and the sitemap scripts).
- AWS CLI logged in with write access to bucket `mosaic.photography` (served as `https://cdn.mosaic.photography/…`).
- `yarn install` done (sharp); Python 3 + Pillow for the `.py` scripts.
- Local image workspace (outside the repo): `C:\Users\elcar\Documents\WEBs\Mosaic\` → `IMGs\` (public-domain), `Contributors\` (community), `Supabase\` (CSV output).

---

## 1. Steps to follow to add a new public-domain photographer and their photos

**Scripts:** `scripts/adding-new-photographers/1-…mjs`, `2-…mjs`, `3-…py` · **Tables:** `photographers`, `images_resize` · **S3:** `mosaic-collections/public-domain-collection/{folder}/`

1. **Check rights.** Photographer must be clearly public domain (CC PDM 1.0). Note the source of the originals.
2. **Pick two names and keep them apart:**
   - `folder` = lowercase ASCII hyphen slug of the full name, e.g. `matthew-brady` → S3 folder, filename prefix, `base_url`.
   - `author` = display name, e.g. `Matthew Brady` → `photographers.author`, `images_resize.author`, `affiliate_products.photographer_author`. The photographer page joins images on `author` (`fetchPhotographerByIdSSR.ts`), so it must be **identical** in all three tables.
   - `slug` = URL `/photographers/{slug}` — ASCII only (see the `de-la-vaudère` problem in TASKS Task 1/3).
3. **Put originals** in `C:\Users\elcar\Documents\WEBs\Mosaic\IMGs\{folder}\originals\`.
4. **Rename every file** (lowercase, ASCII, no spaces — the parser in `3-…py` depends on it):
   `{folder}_{title-in-hyphens}_year-{YYYY}_{orientation}_{gender}_{color}[_not-nude].jpg`
   - orientation: `vertical|horizontal|square` · color: `bw|color|sepia` · gender: `male|female|couple|group|mixed`
   - no `not-nude` token ⇒ the image is imported as **`nude`**. Check each one.
   - portrait for cards: `000_aaa_{folder}.jpg` (filtered out of the gallery).
5. **Edit the hardcoded lists** (they still say `matthew-brady`, `julia-margaret-cameron`):
   - `authors` in `1-convert-originals-to-webp.mjs` and `2-generate-responsive-sizes.mjs`
   - `target_photographers` in `3-generate-supabase-csv.py`; add `"{folder}": "{author}"` to `photographer_map` if plain title-case would be wrong (von, de La, accents); change `OUTPUT_CSV` to a new file name.
6. **Run, in order:**
   ```bash
   node scripts/adding-new-photographers/1-convert-originals-to-webp.mjs   # → originalsWEBP/ (q95)
   node scripts/adding-new-photographers/2-generate-responsive-sizes.mjs   # → w400…w1600 (q85, never upscales)
   python scripts/adding-new-photographers/3-generate-supabase-csv.py      # → …\Mosaic\Supabase\<csv>
   ```
7. **Review the CSV:** `author` exact, `nudity` per row, `year`, `orientation`. `print_quality` is always `standard` here (`scripts/fix_print_quality.py` exists to correct it later).
8. **Upload to S3** (no script for this — same pattern as the contributor sync). Dry run first:
   ```bash
   aws s3 sync "C:\Users\elcar\Documents\WEBs\Mosaic\IMGs\{folder}" s3://mosaic.photography/mosaic-collections/public-domain-collection/{folder} --dryrun
   ```
   then again without `--dryrun`. Spot-check one `https://cdn.mosaic.photography/mosaic-collections/public-domain-collection/{folder}/w800/<file>.webp`.
9. **Supabase → `photographers`:** insert the row (`name, surname, author, slug, biography(_md), intro(_md), birthdate, deceasedate, origin, website, instagram`).
10. **Supabase → `images_resize`:** Table editor → Import data from CSV → the file from step 6.
11. **Check renditions:** `node scripts/restore-missing-large-renditions.mjs --dry-run` (must report no gaps for the new folder).
12. **Optional (code → openCode prompt):** timeline entries in `src/lib/timeline/photographersTimelines.ts`.
13. **Optional:** affiliate products for the photographer (routine 3, `photographer_author = {author}`); otherwise the page tops up from general products automatically.
14. **Deploy:** routine 5. `postbuild` regenerates `sitemap-0`, `image-sitemap` and the `sitemap.xml` index and pings IndexNow.
15. **Verify** the acceptance criteria in `docs/TASKS.md` Task 1 (page, `Person` JSON-LD, `/photographers/{slug}.md`, sitemaps, homepage carousel).
16. **Mobile:** nothing to code (same tables); open the app and check the photographer + images appear.

---

## 2. Steps to follow to add a new user to the community pages (photography contributor)

**Script:** `scripts/community/photography/import-photography-contributor.mjs` (+ its `import-instructions.txt`) · **Tables:** `contributors`, `contributor_images` · **S3:** `mosaic-collections/community/photography/{slug}/` · **Page:** `/community/photography/{slug}`

1. **Intake.** Submissions arrive by email via the form on `/community/photography` (mailto `submissions@mosaic.photography`). Confirm rights + chosen licence with the contributor (default `cc-by-4.0` — community images are **not** public domain).
2. **Choose the slug** — ASCII, final. Never change it later (the `elcarles` → `elcarles78` change lost its 301; see TASKS Task 3).
3. **Create the folder** `C:\Users\elcar\Documents\WEBs\Mosaic\Contributors\{slug}\` with:
   - `contributor.json` — template in `import-instructions.txt` (slug, name, bio, description, website, instagram, featured, license_default, default_license_url, country, email, source_type `community`, nudity, workType, category). Use the **same email** as their Mosaic account so the avatar is copied from `user_profiles`.
   - `images.json` — optional per-image overrides (title, description, year, featured, nudity).
   - `originals\used\` — the final images (`.jpg .jpeg .png .tif .tiff .webp .nef`).
4. **Dry run:**
   ```bash
   node scripts/community/photography/import-photography-contributor.mjs {slug} --dry-run
   ```
5. **Real run** (converts → resizes → creates contributor if the slug is new → inserts images with print quality from megapixels → syncs originals + webp/sizes to S3; never deletes on S3):
   ```bash
   node scripts/community/photography/import-photography-contributor.mjs {slug}
   ```
   Flags: `--skip-convert` (images already processed), `--skip-s3` (DB only).
6. **Deploy** (routine 5) so `sitemap-0.xml` includes the contributor and IndexNow is pinged.
7. **Verify** `/community/photography/{slug}` (bio, avatar, images, licence shown) and that the URL is in `sitemap-0.xml`.

> `scripts/contributors/*` are the older one-step-at-a-time versions, hardcoded to `elcarles`. The community script above replaces them; use them only to re-run a single step.

---

## 3. Steps to follow to add a new affiliate partner (route + content)

**Tables:** `affiliate_advertisers`, `affiliate_products` · **Page:** `/toolkit/{slug}` · **Fetchers:** `src/utils/fetchAffiliateDataSSR.ts` · Full worked example: `affiliate-reports/AFFILIATE-RUNBOOK-2026-09-11.md` (TASCHEN).

1. **Fit check (decision, record in TASKS Task 2):** on-topic only — books, prints, photo software. Nothing adult-adjacent, no off-topic partners (June 2026 spam update). Prefer Awin; note cookie length and commission.
2. **Join the programme** (Awin → advertiser). Note the advertiser ID (`awinmid`) and get a tracked deep link. Ask permission to use product images.
3. **Write a migration** `migrations/0NN_{partner}.sql` (next free number; last is `010`) — openCode prompt:
   - `affiliate_advertisers`: `name, slug, platform, template (default|software|print|marketplace), logo_url, description, website_url, header_url, banner_image_url, promo_url, banner_link_url, promo_code, promo_code_url, editorial_note {"en": "…"}, is_active true`. **`website_url` must be a tracked link** — it is the hero CTA (lesson from migration 009).
   - `affiliate_products`: `advertiser_id, type (book|print|tool|framing), title {"en"}, description {"en"}, affiliate_url (tracked), image_url (CDN), photographer_author (= photographers.author, or null for general), featured, sort_order, is_active true`.
4. **Run the migration:** Supabase → SQL editor → paste → Run (one file at a time, in order).
5. **Images to CDN:** `s3://mosaic.photography/advertisers/product_images/{slug}/…webp` (+ hero/banner creative) → check `https://cdn.mosaic.photography/advertisers/product_images/{slug}/<file>.webp`.
6. **Only if the partner has per-country programmes:** a router like `src/app/api/go/taschen/route.ts` (Claude Code task). Any server-only runtime env var must be added to Amplify env vars **and** to the `grep` line in `amplify.yml`.
7. **Local check:** `yarn dev` → `/toolkit/{slug}` 200 with the right template; disclosure badge visible; links carry `rel="sponsored noopener noreferrer"`; homepage shelf and photographer pages OK.
8. **Ship:** `yarn tsc --noEmit && yarn lint && yarn build` (use `yarn tsc`, never `npx tsc`), then routine 5. Only active advertisers are prerendered and put in `sitemap-0.xml`.
9. **Verify tracking:** click a live link → Awin → Reports → Clicks (today).
10. Update `src/app/legal/terms-of-service/page.tsx` if it's a new network; mobile reads the same tables (always filter `is_active`, open links via `resolveAffiliateUrl.ts` — see `C:\mosaicapp\README.md`).

**Retire a partner:** `is_active = false` on the advertiser and its products — never delete rows. Known issue: retired `/toolkit/*` slugs currently soft-404 (TASKS Task 2).

---

## 4. Steps to follow to run a database migration

1. openCode writes `migrations/0NN_name.sql` (numbered, idempotent where possible) and `migrations/README.md` gets a line.
2. Carles: Supabase → SQL editor → paste → Run. One file at a time, in order. Screenshot the result if anything fails.
3. Update types in `src/types/supabase.ts` if columns changed; tell the mobile repo (shared DB).

## 5. Steps to follow to deploy the web

1. `yarn tsc --noEmit && yarn lint && yarn build` locally (3 lint warnings = known baseline).
2. Commit + push to `main` (Git Bash). Amplify builds automatically (`amplify.yml`, Node 22) and runs `postbuild`: sitemaps + IndexNow.
3. Watch the Amplify build go green; spot-check the changed pages and `https://www.mosaic.photography/sitemap-0.xml`.

## 6. Steps to follow to release the mobile app (`C:\mosaicapp`)

From `C:\mosaicapp\README.md` → "Release Checklist":
1. Bump `version` in `package.json` and `app.config.js` (also `runtimeVersion`).
2. `npx tsc --noEmit` and `npm run lint`.
3. Test login, filters, age gate, downloads, favorites, collections, comments, reports, profile.
4. JS-only change → `eas update --channel production --message "…"`. Native change → `eas build --profile production` then `eas submit --profile production`.

---

## Inconsistencies found while writing this (not fixed — Carles decides)

- `docs/TASKS.md` Task 1 says `author` "must match the S3 folder name and the image filename prefix". The code uses `author` = display name (`Matthew Brady`) and the folder/prefix = slug (`matthew-brady`). Routine 1 follows the code.
- Root `README.md` "How to upload new images" describes the older flow (`resize-images.mjs`, `generate_images_csv.py`); routine 1 is the current one.
- No script uploads public-domain photographer folders to S3 (step 8 is a manual `aws s3 sync`).
- The contributor script's usage message still points to `scripts/contributors/import-contributor.mjs`.
