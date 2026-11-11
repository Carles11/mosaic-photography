# RUNBOOKS — Mosaic (recurring routines)

> "Steps to follow to…" for jobs that repeat. Derived from the scripts in
> `scripts/`, `migrations/`, `docs/TASKS.md` and the affiliate runbook — the
> code is the truth; if a script changes, update the matching section here.
> Where to run: **Git Bash in the web repo root** unless stated. Secrets live in
> `.env.local` (repo root) and Amplify env vars — never paste them into docs/chat.
> Last reviewed: 2026-11-08

**Common prerequisites**
- `.env` with `NEXT_PUBLIC_SUPABASE_URL` and `.env.local` with `SUPABASE_SERVICE_ROLE_KEY` (scripts load `.env`, then `.env.local` on top; used by `scripts/lib/supabaseAdmin.mjs` and the sitemap scripts).
- AWS CLI logged in with write access to bucket `mosaic.photography` (served as `https://cdn.mosaic.photography/…`).
- `yarn install` done (sharp); Python 3 + Pillow for the `.py` scripts.
- Local image workspace (outside the repo): `C:\Users\elcar\Documents\WEBs\Mosaic\` → `IMGs\` (public-domain), `Contributors\` (community), `Supabase\` (CSV output).

---

## 1. Steps to follow to add a new public-domain photographer and their photos

**Scripts:** `scripts/adding-new-photographers/0-…mjs`, `1-…mjs`, `2-…mjs`, `3-…py`, `run-pipeline.mjs`, `4-publish.mjs` · **Tables:** `photographers`, `images_resize` · **S3:** `mosaic-collections/public-domain-collection/{folder}/`

1. **Check rights.** Photographer must be clearly public domain (CC PDM 1.0). Note the source of the originals.
2. **Pick two names and keep them apart:**
   - `folder` = lowercase ASCII hyphen slug of the full name, e.g. `matthew-brady` → S3 folder, filename prefix, `base_url`.
   - `author` = display name, e.g. `Matthew Brady` → `photographers.author`, `images_resize.author`, `affiliate_products.photographer_author`. The photographer page joins images on `author` (`fetchPhotographerByIdSSR.ts`), so it must be **identical** in all three tables.
   - `slug` = URL `/photographers/{slug}` — ASCII only (see the `de-la-vaudère` problem in TASKS Task 1/3).
3. **Fetch candidates from Wikimedia Commons** (writes `IMGs\{folder}\_commons\manifest.json` + `review.html`):
   ```bash
   node scripts/adding-new-photographers/0-fetch-from-commons.mjs --folder {folder} \
     --category "Photographs by …" [--category "…"] [--file "File:…"] [--depth 2] [--min-px 1600] [--low-res-floor 900] [--max-year 1930]
   ```
   Recurses into subcategories; keeps PD/CC0 only (LoC/Flickr “No restrictions” is accepted and flagged “No known restrictions: check”); jpeg/png/tiff; long side ≥ `--min-px` (1600) is normal, between `--low-res-floor` (900) and `--min-px` goes to the separate “Low resolution — exceptions only” section, below the floor is rejected. Explicit `--file` items skip the size filter so a small card portrait can still be reviewed. Rejected files stay in the manifest with a reason.
   **Low-res rule:** `--min-px` stays 1600; a low-res card needs both `keep` and `accept low-res exception`, and `--apply` warns when exceptions exceed 10 % of kept images (portraits exempt).
4. **Review in the browser.** Open `IMGs\{folder}\_commons\review.html` from disk in Chrome. For each kept card choose keep, nudity (`nude|not-nude`), gender, possible minor, title, year, colour and (optionally) the portrait. **Save decisions** → `decisions.json` (refuses while a kept card lacks nudity, gender, title or year; low-res cards also need “accept low-res exception”).
5. **Download the kept originals** with the routine-1 filenames + provenance:
   ```bash
   node scripts/adding-new-photographers/0-fetch-from-commons.mjs --folder {folder} --apply path\to\decisions.json
   ```
   `possible minor` items are not downloaded (decide by hand, Task 5). `IMGs\{folder}\_commons\sources.csv` records Commons title, description URL, licence, credit, artist, date and the sheet's choices, including `low_res` and `license_note`. `--apply` prints the number of low-res exceptions kept and warns above 10 % of kept images.
6. **Run the pipeline** (1 → 2 → 3, stops at the first failure):
   ```bash
   node scripts/adding-new-photographers/run-pipeline.mjs --folder {folder} --author "{author}"
   ```
   → `originalsWEBP/` (q95), `w400…w1600/` (q85, never upscales), `…\Mosaic\Supabase\images_resize_{folder}_{date}.csv`.
7. **Review the CSV:** `author` exact, `nudity` per row, `year`, `orientation`. `print_quality` is always `standard` here (`scripts/fix_print_quality.py` exists to correct it later).
8. **Write `IMGs\{folder}\_commons\photographer.json`** (Claude, orchestrator): `name, surname, author, slug, origin, intro, intro_md, biography, biography_md, birthdate, deceasedate` (+ `website`, `instagram`, usually `null`). Web reads `intro_md`/`biography_md`; mobile reads plain-text `intro`/`biography` (`SHOULD_RENDER_MARKDOWN = false`), so all four are required. `intro_md` starts with `# {Full Name} (YYYY–YYYY)` like the existing rows. Dates are `YYYY-MM-DD` (`timestamptz` columns; a bare year is rejected). The portrait row needs a `year` and `orientation` too: put them in the portrait filename before step 6, or edit the CSV.
9. **Plan** (validates everything locally, reads Supabase, runs `aws s3 sync --dryrun`; writes nothing):
   ```bash
   node scripts/adding-new-photographers/4-publish.mjs --folder {folder} [--csv path\to\images_resize_{folder}_….csv]
   ```
   Screenshot the plan to Claude.
10. **Publish:** same command with `--yes`. It syncs to S3 (excludes `_commons/`, never `--delete`), checks every file the app can request (`originalsWEBP` + each `w{n}` ≤ image width) answers 200 on the CDN, and only then inserts the `photographers` row (skipped if the author exists) and the missing `images_resize` rows. Re-running is a no-op. It prints rollback SQL/`aws s3 rm --dryrun` but never runs them. Node 20 needs `NODE_OPTIONS=--experimental-websocket`.
11. *(Fallback, by hand, if the script can't be used:)* `aws s3 sync "…\IMGs\{folder}" s3://mosaic.photography/mosaic-collections/public-domain-collection/{folder} --exclude "_commons/*" --dryrun`, then without `--dryrun`; spot-check a `w800` URL on the CDN; insert the `photographers` row in the table editor; Table editor → Import data from CSV for `images_resize`.
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
   - `contributor.json` — template in `import-instructions.txt` (slug, name, bio, description, website, instagram, featured, license_default, default_license_url, country, email, source_type `community`, nudity, workType, category). Use the **same email** as their Mosaic account so the avatar is copied from `user_profiles`. The importer stores `email` and `submission_notes` in `contributor_private` (service role only), not in `contributors`.
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

**OTA safety (added 2026-11-10):** `runtimeVersion` is a plain string (`1.4.0`), not a fingerprint, so
an OTA reaches every store build with that string even if its native code differs. Before any
`eas update`, open expo.dev → Builds → the live production build per platform and compare its commit
with `master` (`git diff --stat <commit> master`; any change in `package.json`, `app.config.js`,
`plugins/` or native folders = not OTA-safe for that platform). As of 2026-11-10: **iOS 1.4.0 (47) is
OTA-safe, Android 1.4.0 (30) is NOT** (built from `a0348f4`, before RNFirebase 24.1.0) → always pass
`--platform ios` until a new Android build is live. Publish without `--environment`: the Supabase
`EXPO_PUBLIC_*` vars live in the committed `.env`, not in the EAS `production` environment.
**Update 2026-11-11:** `master` is runtime **1.4.1**. Android 1.4.1 (31) built from `ea43235` (in Play review);
iOS store build is still 1.4.0 (47), so an OTA from `master` reaches Android 31 only. Next iOS change = new
iOS build (routine above, native path).

## 7. Report email alerts

A trigger on `public.reports` emails `mosaic@rio-frances.com` through Resend on every new report (`migrations/015_report_email_alerts.sql`).

- **Key:** Supabase Vault secret `resend_api_key` (Project → Integrations → Vault). Never put it anywhere else.
- **Rotate:** create a new key in Resend, edit the secret's value in Vault (keep the name), then delete the old key in Resend. The trigger reads the secret on every report, so nothing else changes.
- **Check failures** (SQL editor; `pg_net` keeps responses for only 6 hours):
  `select id, status_code, content, timed_out, error_msg, created from net._http_response order by created desc limit 20;`
  Good: `status_code` 200 and an `id` in `content`. 400 or 401 = key invalid or deleted, 403 = key inactive or suspended, or recipient or sender not allowed (`content` says which), 429 = Resend limit.
- **Missed emails:** a failed email never blocks a report, so check `select * from public.reports where status = 'pending' order by created_at desc;`. If the key is missing or the trigger hits a SQL error, it only logs a warning (Supabase → Logs → Postgres).
- **Recipient:** must stay the Resend account address, and `from` must stay `onboarding@resend.dev`, until a domain is verified in Resend.
- **Never add `net` or `vault` to Data API → Exposed schemas.** `pg_net`'s queue holds the key for a few seconds and Supabase grants it to `PUBLIC` (owner `supabase_admin`, can't be revoked by us). Keeping `net` unexposed is what keeps it private (checked 2026-11-06).

---

## Inconsistencies found while writing this (not fixed — Carles decides)

- `docs/TASKS.md` Task 1 says `author` "must match the S3 folder name and the image filename prefix". The code uses `author` = display name (`Matthew Brady`) and the folder/prefix = slug (`matthew-brady`). Routine 1 follows the code.
- Root `README.md` "How to upload new images" describes the older flow (`resize-images.mjs`, `generate_images_csv.py`); routine 1 is the current one.
- No script uploads public-domain photographer folders to S3 (step 8 is a manual `aws s3 sync`).
- The contributor script's usage message still points to `scripts/contributors/import-contributor.mjs`.
