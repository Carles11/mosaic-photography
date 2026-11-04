-- 013: RLS fix B (audit #16) — contributor contact data out of the public table.
--
-- Run after 012. Safe to re-run (create if not exists, on conflict do nothing,
-- drop column if exists; the guard is skipped once the columns are gone).
--
-- WHY THIS EXISTS
--
-- public.contributors has a SELECT policy using (true) for role public, so
-- email and submission_notes were readable by anyone holding the public anon
-- key through the REST API. A column REVOKE is not an option: the mobile app
-- reads select("*") from contributors and a REVOKE would make that query fail.
-- Dropping the columns does not break select("*"); it just returns fewer fields.
--
-- contributor_private gets RLS with NO policies and no anon/authenticated
-- grants: only the service role (importer scripts, dashboard) can touch it,
-- and the service role bypasses RLS.
--
-- No app code reads these columns (web: fetchContributorsSSR.ts selects public
-- columns only; mobile only lists them in a type). Writers are the two importer
-- scripts, updated in the same change to write contributor_private instead.
--
-- contributor_id is uuid, assuming contributors.id is uuid (both apps type it
-- as string; not confirmed from a migration). If it is not, the create table
-- fails on the foreign key and the whole transaction rolls back, nothing lost.

begin;

create table if not exists public.contributor_private (
  contributor_id   uuid primary key references public.contributors(id) on delete cascade,
  email            text,
  submission_notes text,
  created_at       timestamptz default now()
);

alter table public.contributor_private enable row level security;
revoke all on public.contributor_private from anon, authenticated;

-- Copy + guard only while the old columns still exist (re-run after 013 = no-op).
do $$
declare
  src int;
  dst int;
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'contributors'
               and column_name = 'email') then
    insert into public.contributor_private (contributor_id, email, submission_notes)
    select id, email, submission_notes from public.contributors
     where email is not null or submission_notes is not null
    on conflict (contributor_id) do nothing;

    select count(*) into src from public.contributors
     where email is not null or submission_notes is not null;
    select count(*) into dst from public.contributors c
      join public.contributor_private p on p.contributor_id = c.id
     where c.email is not null or c.submission_notes is not null;

    if src <> dst then
      raise exception '013 guard: % contributors with email/notes, % copied. Columns NOT dropped.', src, dst;
    end if;
  end if;
end $$;

alter table public.contributors
  drop column if exists email,
  drop column if exists submission_notes;

commit;

-- Check:
-- select column_name from information_schema.columns
--  where table_schema='public' and table_name='contributors'
--    and column_name in ('email','submission_notes');          -- expect 0 rows
-- select count(*) from public.contributor_private;              -- expect 2
-- select relrowsecurity from pg_class where oid = 'public.contributor_private'::regclass;  -- expect true
-- select count(*) from pg_policies where tablename = 'contributor_private';               -- expect 0

-- ROLLBACK (one paste, restores the pre-013 columns and data):
-- begin;
-- alter table public.contributors
--   add column if not exists email text,
--   add column if not exists submission_notes text;
-- update public.contributors c
--    set email = p.email, submission_notes = p.submission_notes
--   from public.contributor_private p
--  where p.contributor_id = c.id;
-- drop table if exists public.contributor_private;
-- commit;
