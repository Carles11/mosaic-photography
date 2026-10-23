-- 011: RLS fix A (audit #16) — own-folder avatars, no qa_logs reads.
--
-- Run after 010. Safe to re-run (every create is preceded by its drop).
--
-- WHY THIS EXISTS
--
-- storage.objects had two open policies:
--   "open insert test"             INSERT to anon, authenticated  with check (true)
--   "Allow all for avatars bucket" ALL    to public               bucket_id = 'avatars'
-- so anyone holding the public anon key could upload any file to ANY bucket,
-- and read / overwrite / delete ANY user's avatar.
--
-- Both apps only ever touch avatars/<auth.uid()>/avatar.jpg
-- (web: src/components/profile/AvatarUpload.tsx, mobile: avatarApi.ts), so
-- each logged-in user gets their own folder and nothing else.
--
-- SELECT is needed because upload(..., { upsert: true }) reads the existing
-- object before updating it. Public avatar URLs keep working without a
-- public SELECT policy because the bucket itself is public.
--
-- store-public-images gets no policy on purpose: only the dashboard /
-- service role writes to it, and those bypass RLS.
--
-- qa_logs: "Allow select when authenticated" let every logged-in user read
-- every row. Nothing reads qa_logs; mobile only inserts (qaLogger.ts), and
-- its insert policy is left alone.

begin;

drop policy if exists "open insert test" on storage.objects;
drop policy if exists "Allow all for avatars bucket" on storage.objects;

drop policy if exists "avatars_select_own" on storage.objects;
create policy "avatars_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Allow select when authenticated" on public.qa_logs;

commit;

-- Check:
-- select policyname, cmd, roles, qual, with_check from pg_policies
--  where (schemaname='storage' and tablename='objects') or tablename='qa_logs';
--
-- Expected: exactly 4 storage.objects rows, roles {authenticated}; qa_logs
-- shows only its pre-existing INSERT policy (if any, untouched), no SELECT:
--   avatars_select_own  SELECT  qual = own-folder predicate   with_check = null
--   avatars_insert_own  INSERT  qual = null                   with_check = own-folder predicate
--   avatars_update_own  UPDATE  qual = own-folder predicate   with_check = own-folder predicate
--   avatars_delete_own  DELETE  qual = own-folder predicate   with_check = null
-- own-folder predicate ≈
--   ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text))
-- No "open insert test", no "Allow all for avatars bucket",
-- no "Allow select when authenticated".

-- ROLLBACK (one paste, restores the pre-011 policies exactly):
-- begin;
-- drop policy if exists "avatars_select_own" on storage.objects;
-- drop policy if exists "avatars_insert_own" on storage.objects;
-- drop policy if exists "avatars_update_own" on storage.objects;
-- drop policy if exists "avatars_delete_own" on storage.objects;
-- drop policy if exists "open insert test" on storage.objects;
-- create policy "open insert test" on storage.objects
--   for insert to anon, authenticated
--   with check (true);
-- drop policy if exists "Allow all for avatars bucket" on storage.objects;
-- create policy "Allow all for avatars bucket" on storage.objects
--   for all to public
--   using (bucket_id = 'avatars')
--   with check (bucket_id = 'avatars');
-- drop policy if exists "Allow select when authenticated" on public.qa_logs;
-- create policy "Allow select when authenticated" on public.qa_logs
--   for select to authenticated
--   using (auth.uid() is not null);
-- commit;
