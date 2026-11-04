# RLS Stage B: move contributor contact data out of the public table

**Repo:** web, `mosaic-photography`, branch `main`. Read `CLAUDE.md` first.
**Task:** `docs/TASKS.md` → Task 4 → #16 → Stage B (approved by Carles 2026-10-23).
**Do not commit and do not run SQL against Supabase.** Carles runs the migration in the
Supabase SQL editor and commits himself.

## Why

`public.contributors` has a SELECT policy `using (true)` for role `public`. Its columns
`email` and `submission_notes` can therefore be read by anyone holding the public anon
key, through the REST API. A column REVOKE is not an option: the mobile app reads
`select("*")` from `contributors`, and a REVOKE would make that query fail. Moving the
two columns into a separate table that has no policies fixes the leak. Dropping columns
does not break `select("*")`. The query just returns fewer fields.

## Facts checked 2026-11-04 (read-only, SQL editor)

- `contributors`: 2 rows; both have `email` and `submission_notes` set.
- Policies on `contributors`: SELECT `true`, INSERT/UPDATE/DELETE disallowed for `public`.
- No views depend on `email` / `submission_notes`.
- One trigger: `handle_contributors_updated_at`. Check in the code or migrations that it
  does not reference the two columns. If you can't tell, say so in your report.
- No app code reads these two columns:
  - Web: `src/utils/fetchContributorsSSR.ts` selects explicit public columns only.
  - Mobile (`C:\mosaicapp`): only lists them in the type `src/4-shared/types/contributor.ts`.
  - Writers: two importer scripts (below). The web form on `/community/photography` is a
    mailto. It doesn't write to the DB.

## Requirements

### 1. `migrations/013_contributors_private_contact.sql`

Follow the style of `migrations/011_rls_storage_avatars_qa_logs.sql`: header comment with
WHY, `begin; … commit;`, safe to re-run where possible, rollback block commented out at
the end.

- Create `public.contributor_private`:
  - `contributor_id` as primary key. Use the same type as `contributors.id` (check
    `docs/data-model.md`, the migrations, or the importer code; if you're unsure, say so).
    It references `contributors(id) on delete cascade`.
  - Columns `email text`, `submission_notes text`, `created_at timestamptz default now()`.
  - Reason: one row per contributor, gone when the contributor is deleted.
- `alter table … enable row level security;` with **no policies**. Also
  `revoke all on public.contributor_private from anon, authenticated;`.
  Reason: only the service role (importer scripts, dashboard) can touch it. The service
  role bypasses RLS.
- Copy the existing rows:
  `insert … select id, email, submission_notes from contributors where email is not null or submission_notes is not null on conflict (contributor_id) do nothing;`
- Guard before dropping: a `do $$ … $$` block that raises an exception if the number of
  contributors with email or notes ≠ the number of matching rows in `contributor_private`.
  Reason: never drop the columns before the copy is proven.
- `alter table public.contributors drop column if exists email, drop column if exists submission_notes;`
- Rollback (commented): re-add both columns, copy back from `contributor_private`, drop
  `contributor_private`.

### 2. Importer scripts: both of them

- `scripts/community/photography/import-photography-contributor.mjs` (current one, used
  by `docs/RUNBOOKS.md` routine 2)
- `scripts/contributors/import-contributor.mjs` (older copy, kept)

In each script:
- Remove `email` and `submission_notes` from the `contributors` insert.
- Right after a contributor is **created** (same branch), insert
  `{ contributor_id, email, submission_notes }` into `contributor_private` with the
  existing `supabaseAdmin` client. On error, `console.error` and `process.exit(1)`, the
  same as the contributor insert.
- Keep the existing `user_profiles` avatar lookup by `contributorData.email`. It reads
  the JSON input, not the DB column.

### 3. Web types and docs

- Search `src/` for `submission_notes` and for `email` on any contributor type. Remove
  the two fields from contributor types if they're there.
- `docs/data-model.md`: add `contributor_private` (columns, "service role only, no
  policies") and remove the two columns from `contributors` if they're listed.
- `docs/RUNBOOKS.md` routine 2, step about `contributor.json`: one sentence saying
  `email` / `submission_notes` are stored in `contributor_private`, not in `contributors`.
- `migrations/README.md`: add a 013 entry if the README lists migrations one by one.

## Out of scope

- Stage C (`user_profiles` / `public_profiles` view). Separate prompt later.
- #11 (importer writes during `--dry-run`). Don't change dry-run behaviour.
- The mobile repo. Its type cleanup is a follow-up. It needs no release.
- Any other refactoring of the importer scripts.

## Verify, then report

- `yarn lint` and `npx tsc --noEmit` are clean.
- `node --check` on both importer scripts.
- `grep -rn "submission_notes" src/ scripts/` → only the `contributor_private` insert lines.
- Report: the files you changed, the type of `contributors.id`, whether the trigger
  touches the columns, and anything you couldn't confirm.

Run /ponytail-review before committing.
