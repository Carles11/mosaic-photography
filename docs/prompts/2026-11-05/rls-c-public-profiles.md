# RLS Stage C: stop `user_profiles` from being readable by everyone

**Repo:** web, `mosaic-photography`, branch `main`. Read `CLAUDE.md` first.
**Task:** `docs/TASKS.md` → Task 4 → #16 → Stage C (approved by Carles 2026-10-23).
**Do not commit and do not run SQL against Supabase.** Carles runs the migration in the
Supabase SQL editor and commits himself.

## Why

`public.user_profiles` has a SELECT policy `"Allow read of public profile fields"` with
`using (true)` for role `public`. RLS filters rows, not columns, so anyone holding the
public anon key can read every user's `email`, `filters`, `role`, `last-name`, etc.
through the REST API (134 rows). The only cross-user read the apps need is the display
name of comment authors.

## Facts checked 2026-11-05 (read-only, SQL editor)

Policies on `public.user_profiles` (all for role `public`):

| policyname | cmd | qual / with_check |
|---|---|---|
| Users can delete own profile | DELETE | `(select auth.uid()) = id` |
| Users can insert own profile | INSERT | check `(select auth.uid()) = id` |
| **Allow read of public profile fields** | SELECT | **`true`** ← the leak |
| Users can view own profile | SELECT | `(select auth.uid()) = id` |
| Users can update own profile | UPDATE | `(select auth.uid()) = id` |

So own-row reads keep working after the `true` policy is dropped.

Columns: `id uuid, name, instagram, website, created_at, updated_at, own_store_url,
own_store_name, "last-name", role, email, filters jsonb, avatar_url`.

Grants: `anon` and `authenticated` both have full table privileges (Supabase default).

Code that reads `user_profiles` (checked 2026-11-05):
- Web, **other users' rows:** only `src/context/CommentsContext.tsx` ~line 185:
  `.select("id, name").in("id", userIds)` (names of comment authors).
- Web, own row only: `CommentsContext.tsx` ~line 264 (`.eq("id", user.id)`),
  `settingsContext/filters.tsx`, `profile/ProfileForm.tsx`, `profile/AvatarUpload.tsx`.
  Check each of these really filters by the logged-in user's id; report any that don't.
- Mobile (`C:\mosaicapp`): own row only (`profileApi.ts`, `FiltersContext.tsx`,
  `use-nudity-consent.ts`, `use-persistent-gallery-filters.ts`). Mobile comments
  (`commentsApi.ts`) do not read names. **No mobile change needed.**
- Scripts: `scripts/community/photography/import-photography-contributor.mjs` reads
  `user_profiles` with the service role, which bypasses RLS. No change.

## Requirements

### 1. `migrations/014_user_profiles_public_view.sql`

Follow the style of `migrations/011_rls_storage_avatars_qa_logs.sql` and `013`: header
comment with WHY, `begin; … commit;`, safe to re-run, rollback block commented out at
the end.

- `create or replace view public.public_profiles as select p.id, p.name from
  public.user_profiles p where exists (select 1 from public.comments c where c.user_id = p.id);`
  - Owner: the default (postgres). **Do not** set `security_invoker = true`.
    Reason: the view must read past RLS so it can show names of other users; it only
    exposes `id` and `name`, and only for users who have posted a comment (comments are
    already public). Add a SQL comment saying the Supabase advisor will flag it as a
    "security definer view" and that this is intended.
  - Check `migrations/003_setup_comments_rls.sql` / `004` for the exact name of the
    `comments` user column (`user_id` is what the web code uses). If it differs, use the
    real one and say so.
- `revoke all on public.public_profiles from anon, authenticated;` then
  `grant select on public.public_profiles to anon, authenticated;`
  Reason: read-only, and explicit rather than relying on default privileges.
- `drop policy if exists "Allow read of public profile fields" on public.user_profiles;`
- Leave the four own-row policies and the table grants untouched.
- At the end, as a comment, a **verification block** Carles can paste into the SQL editor
  (read-only, ends in `rollback`):
  ```sql
  begin;
  set local role anon;
  select count(*) as anon_profiles from public.user_profiles;   -- expect 0
  select count(*) as anon_public  from public.public_profiles;  -- expect = number of comment authors
  select * from public.public_profiles limit 3;                 -- only id, name
  rollback;
  ```
- Rollback (commented): recreate the `true` SELECT policy exactly as it was
  (`for select to public using (true)`), drop the view.

### 2. Web code

- `src/context/CommentsContext.tsx`, the cross-user read only (~line 185): change
  `.from("user_profiles")` to `.from("public_profiles")`. Same select (`id, name`),
  same `.in("id", userIds)`. Nothing else in the file.
- If `src/types/supabase.ts` is a generated DB type file that lists views, add
  `public_profiles` (`id: string; name: string | null`) in the same style. If it isn't,
  don't add a type.

### 3. Docs

- `docs/data-model.md`: replace the vague `user_profiles` table with the real columns
  above (one line each, keep it short), add `public_profiles` (view: `id`, `name` of
  comment authors, readable by anon), and in the RLS list add the view.
- `migrations/README.md`: add a 014 entry if the README lists migrations one by one.

## Out of scope

- The table grants to anon/authenticated (TRUNCATE etc. are not reachable through the
  REST API). Mention it in the report, don't change it.
- Comment avatars, author profile pages, or any other new feature using the view.
- The mobile repo. Nothing to change there.
- #15 (hidden write errors), #7 (filters), any refactor of `CommentsContext`.
- Stage B's skipped upsert in the importer scripts.

## Verify, then report

- `yarn lint` and `npx tsc --noEmit` are clean; `yarn test` passes.
- `grep -rn "user_profiles" src/` → no remaining cross-user read (list each hit with
  "own row" or not).
- Report: files changed, the real name of the comments user column, whether
  `src/types/supabase.ts` got a view type, and anything you couldn't confirm.

Run /ponytail-review before committing.
