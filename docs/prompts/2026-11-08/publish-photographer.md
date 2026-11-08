# Claude Code prompt — `4-publish.mjs`: upload a new photographer to S3 and Supabase (Task 1)

> Written 2026-11-08 by Claude (orchestrator). Run in **Claude Code** (writes to the production DB) from
> `C:\Users\elcar\Documents\aaa_repos\mosaic-photography`. Read `CLAUDE.md`, `docs/RUNBOOKS.md` routine 1
> (already updated for `0-fetch-from-commons.mjs` / `run-pipeline.mjs`), `docs/data-model.md`,
> `scripts/adding-new-photographers/*`, `scripts/lib/supabaseAdmin.mjs`, and Task 4 #11 in `docs/TASKS.md`.

## Goal

One script replaces RUNBOOKS routine 1 steps 8–11 (S3 upload, `photographers` row, CSV import into
`images_resize`, renditions check) for **public-domain photographers**, with safe defaults:

```
node scripts/adding-new-photographers/4-publish.mjs --folder rudolf-koppitz            # plan only
node scripts/adding-new-photographers/4-publish.mjs --folder rudolf-koppitz --yes      # do it
```

First run will be Koppitz (~8 images), then Atget and Käsebier.

## Inputs (all already on disk after routine 1 steps 3–7)

- `C:\Users\elcar\Documents\WEBs\Mosaic\IMGs\{folder}\` with `originals\`, `originalsWEBP\`, `w400…w1600\`,
  and `_commons\` (manifest, review, decisions, `sources.csv`).
- The CSV written by `3-generate-supabase-csv.py` (`--csv <path>`; default: newest
  `images_resize_{folder}_*.csv` in `C:\Users\elcar\Documents\WEBs\Mosaic\Supabase\`).
- `IMGs\{folder}\_commons\photographer.json`, written by Claude (orchestrator) per photographer:
  `name, surname, author, slug, birthdate, deceasedate, origin, intro_md, biography_md` (+ `intro`,
  `biography` HTML if the code needs them, see check below). `website`/`instagram` null.

## What the script does, in this order (each step is a deliberate requirement)

1. **Validate locally** (stop on any failure, exit 1, nothing remote touched):
   - folder exists; every `originalsWEBP\*.webp` has a CSV row and vice versa; every row's `author`
     equals `photographer.json.author` exactly (accents included) — it is the join key
     (`fetchPhotographerByIdSSR.ts`); `slug` is lowercase ASCII and not used by another photographer;
     no CSV row with empty `nudity`/`year`/`orientation`; exactly one `000_aaa_{folder}.*` portrait.
   - print the plan: file counts per subfolder, rows to insert, photographer row, S3 target.
2. **S3 upload** with the AWS CLI already logged in on Carles's PC (child_process, no SDK, no keys in code):
   `aws s3 sync "<IMGs\{folder}>" s3://mosaic.photography/mosaic-collections/public-domain-collection/{folder} --exclude "_commons/*"`.
   **Never `--delete`.** Without `--yes` run it with `--dryrun` and show the output.
3. **Verify on the CDN** (only with `--yes`, after the sync): HEAD every uploaded webp under
   `originalsWEBP` and `w400…w1600` at `https://cdn.mosaic.photography/mosaic-collections/public-domain-collection/{folder}/…`
   (concurrency ≤ 8). Any non-200 → stop before touching Supabase, list the failures, exit 1.
   This URL is built only here, for a post-upload check; app code keeps using `src/utils/imageResizingS3.ts` (rule 1).
4. **Supabase `photographers`**: insert the row from `photographer.json` if no row has that `author` or
   `slug`. If one exists: don't update it, print "exists, skipped" (updates stay manual).
5. **Supabase `images_resize`**: select existing `filename`s for this `author`; insert only rows whose
   filename is missing (don't rely on a unique constraint; check whether one exists and say so in the
   report). Insert in batches of ≤ 200. Re-running must be a no-op.
6. **Report**: uploaded files, CDN checks, photographer row (inserted/skipped + id), image rows
   inserted/skipped, and **printed (not executed) rollback commands**: the SQL to delete this author's
   new rows by id list, and `aws s3 rm --recursive --dryrun` for the folder.

Order matters: Supabase is written only after the files are verified on the CDN, the opposite of the
contributor importer's bug (#11).

## Checks you must do before writing the script

- Which `photographers` columns do the web page and the mobile app actually read (`biography` vs
  `biography_md`, `intro` vs `intro_md`)? Read web `src/utils/fetchPhotographer*.ts` and the mobile repo
  `C:\mosaicapp` read-only (grep `from("photographers")`). Require in `photographer.json` exactly the
  fields that are read; tell me which in the report so I write them.
- `scripts/lib/supabaseAdmin.mjs` loads `.env` only; RUNBOOKS says secrets live in `.env.local`. Make the
  script load `.env.local` (same pattern as the other scripts) without changing `supabaseAdmin.mjs`
  for its existing callers.
- Does `images_resize` need `exclude_from_index` (migration 012) or any other non-null column on insert?
- Node 20 locally may need `NODE_OPTIONS=--experimental-websocket` for supabase-js (see Task 4 #10 note);
  handle or document it.

## Out of scope

- Don't change `import-contributor.mjs` or the contributor `.sh` scripts (#11 is a separate task).
- No migrations, no schema changes, no RLS changes. No deletes anywhere (rollback is printed only).
- No changes to `src/`, no deploy, no git commands. No new dependencies.
- No AI on images. No updates to existing rows.

## Docs

- `docs/RUNBOOKS.md` routine 1: replace steps 8–11 with `4-publish.mjs` (plan → screenshot to Claude →
  `--yes`), keep the manual commands as a fallback note. Update "Last reviewed".

## Test

- Plan mode against a fake folder `_test-publish` (2 tiny webps + CSV + photographer.json): validation
  errors and plan output work. **Do not run `--yes` against production.** Carles does the first real run.
- `yarn lint` clean.

Run /ponytail-review before committing.
