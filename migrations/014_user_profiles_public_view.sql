-- 014: RLS fix C (audit #16) — user_profiles no longer readable by everyone.
--
-- Run after 013. Safe to re-run (create or replace view, drop policy if exists).
--
-- WHY THIS EXISTS
--
-- public.user_profiles has a SELECT policy "Allow read of public profile fields"
-- using (true) for role public. RLS filters rows, not columns, so anyone holding
-- the public anon key could read every user's email, filters, role, last-name,
-- etc. through the REST API.
--
-- The only cross-user read either app needs is the display name of comment
-- authors (web: src/context/CommentsContext.tsx). That moves to the view below;
-- every other read is of the user's own row, covered by "Users can view own
-- profile". The four own-row policies and the table grants are left untouched.
--
-- The view deliberately does NOT set security_invoker = true: it must read past
-- RLS to show other users' names. The Supabase advisor will flag it as a
-- "security definer view"; that is intended. It exposes only id and name, and
-- only for users who have posted a comment (comments are already public).

begin;

create or replace view public.public_profiles as
  select p.id, p.name
    from public.user_profiles p
   where exists (select 1 from public.comments c where c.user_id = p.id);

revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

drop policy if exists "Allow read of public profile fields" on public.user_profiles;

commit;

-- Check:
-- select policyname, cmd, qual, with_check from pg_policies
--  where schemaname='public' and tablename='user_profiles';
--
-- Expected: exactly 4 rows, no "Allow read of public profile fields":
--   Users can delete own profile  DELETE
--   Users can insert own profile  INSERT
--   Users can view own profile    SELECT
--   Users can update own profile  UPDATE

-- Verification (read-only, paste into the SQL editor):
-- begin;
-- set local role anon;
-- select count(*) as anon_profiles from public.user_profiles;   -- expect 0
-- select count(*) as anon_public  from public.public_profiles;  -- expect = number of comment authors
-- select * from public.public_profiles limit 3;                 -- only id, name
-- rollback;

-- ROLLBACK (one paste, restores the pre-014 policy):
-- begin;
-- drop policy if exists "Allow read of public profile fields" on public.user_profiles;
-- create policy "Allow read of public profile fields" on public.user_profiles
--   for select to public
--   using (true);
-- drop view if exists public.public_profiles;
-- commit;
