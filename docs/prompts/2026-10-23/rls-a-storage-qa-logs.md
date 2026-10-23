# Prompt — RLS fix A: storage avatars + qa_logs (Claude Code)

> Audit item #16, stage A of 3 (A storage + qa_logs → B contributors private
> table → C public_profiles view). Background: `docs/TASKS.md`, Task 4, #16,
> "2026-10-23 — read-only check done".

## Context

Live policies on `storage.objects` today (read from `pg_policies` 2026-10-23):

| policyname | cmd | roles | using | with check |
|---|---|---|---|---|
| `open insert test` | INSERT | anon, authenticated | — | `true` |
| `Allow all for avatars bucket` | ALL | public | `bucket_id = 'avatars'` | `bucket_id = 'avatars'` |

Effect: anyone with the public anon key can upload any file to **any** bucket,
and read/overwrite/delete **any** user's avatar.

Buckets: `avatars` (public, 3 files, all `<uuid>/avatar.jpg`) and
`store-public-images` (public, 51 files, uploaded via the dashboard; no code
writes to it).

Both apps write avatars only as `avatars/<userId>/avatar.jpg` with
`upsert: true`, and remove the same path:
- web: `src/components/profile/AvatarUpload.tsx`
- mobile (read-only, other repo): `C:\mosaicapp\src\2-features\profile\api\avatarApi.ts`

`public.qa_logs` has `Allow select when authenticated` (any logged-in user reads
all rows). Nothing in either repo reads `qa_logs`; mobile only inserts
(`C:\mosaicapp\src\4-shared\lib\qaLogger.ts`).

## Task

1. **Verify first, change nothing yet:** in both files above, confirm that
   `userId` is the logged-in user's `auth.uid()` (session user id), not a
   profile id or anything else. If it isn't, stop and report.
2. Write `migrations/011_rls_storage_avatars_qa_logs.sql`:
   - `drop policy if exists "open insert test" on storage.objects;`
   - `drop policy if exists "Allow all for avatars bucket" on storage.objects;`
   - Four policies on `storage.objects`, role `authenticated` only, each limited
     to `bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text`:
     SELECT (using), INSERT (with check), UPDATE (using + with check), DELETE (using).
     Reason for SELECT: Supabase `upload(..., { upsert: true })` needs SELECT +
     UPDATE on the existing object. Public avatar URLs keep working without a
     SELECT policy because the bucket is public.
   - `drop policy if exists "Allow select when authenticated" on public.qa_logs;`
   - Wrap everything in `begin; … commit;`. Use `drop policy if exists` /
     guarded creates so the file can be re-run (RUNBOOKS routine 4: idempotent).
   - **Required:** a commented-out `-- ROLLBACK` block at the end that recreates
     the two old storage policies and the qa_logs policy exactly as in the table
     above. Reason: Carles runs SQL by hand and needs a one-paste undo.
3. Add one line for 011 to `migrations/README.md` (match the existing format).
4. Write a verification block at the bottom of the migration as SQL comments:
   the `pg_policies` query to run afterwards
   (`select policyname, cmd, roles, qual, with_check from pg_policies where (schemaname='storage' and tablename='objects') or tablename='qa_logs';`)
   and the expected rows.

## Out of scope

- Any change to `contributors`, `user_profiles`, `favorites`, `collections`,
  `collection_favorites` (stages B/C and later).
- The `store-public-images` bucket: no policy for it (dashboard/service role
  uploads bypass RLS). Don't add one.
- App code in either repo (no code change is needed for stage A).
- `src/types/supabase.ts` (no columns change).
- Running the SQL: Carles runs it in the Supabase SQL editor. Don't use the
  service role key or any CLI against the live project.

## Done when

- Step 1 result reported (file + line where `userId` comes from, both repos).
- `migrations/011_rls_storage_avatars_qa_logs.sql` + README line exist.
- Reply lists: the 6 statements in order, the rollback block, and what Carles
  must test after running it (web avatar upload + delete while logged in;
  mobile avatar upload; anon upload must now fail).

Run /ponytail-review before committing.
