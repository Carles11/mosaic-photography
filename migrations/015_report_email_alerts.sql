-- 015: email the owner on every new row in public.reports (docs/TASKS.md, Task 6).
--
-- Before running: run this read-only check and confirm the types (reports.id,
-- comment_id = uuid; reports.image_id = bigint; reports.created_at = timestamptz).
-- Stop and report back if they differ. Then create the Vault secret resend_api_key.
--
-- select table_name, column_name, data_type, is_nullable
--   from information_schema.columns
--  where table_schema = 'public'
--    and (table_name = 'reports'
--      or (table_name = 'comments'      and column_name in ('id','content','user_id','image_id'))
--      or (table_name = 'images_resize' and column_name in ('id','filename','author'))
--      or (table_name = 'user_profiles' and column_name in ('id','name')))
--  order by table_name, ordinal_position;
--
-- Safe to re-run (if not exists, create or replace, drop trigger if exists).
--
-- WHY THIS SHAPE
--
-- pg_net queues the request and sends it after commit, so a failed email can't
-- block a report. SQL errors inside a trigger still would, hence the exception
-- handler below. security definer is deliberate: the function reads the Vault
-- secret and related rows regardless of the reporter's RLS.
--
-- No domain is verified in Resend, so sender and recipient are fixed: Resend
-- rejects (403) any recipient other than the account address.
--
-- The revoke below is safe. The EXECUTE check is in CreateTriggerFiringOn (Postgres
-- src/backend/commands/trigger.c), at CREATE TRIGGER time; ExecCallTriggerFunc has
-- none when firing. The CREATE TRIGGER docs only state the create-time requirement.
-- Check 2 at the end of this file confirms it for the role the app inserts as.

begin;

create extension if not exists pg_net;

create or replace function public.notify_new_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
  v_comment text;
  v_comment_author text;
  v_comment_image text;
  v_image text;
  v_image_author text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'resend_api_key';

  if v_key is null then
    raise warning 'notify_new_report: Vault secret resend_api_key is missing, no email for report %', new.id;
    return new;
  end if;

  -- Ids compare as text: comments.image_id is text (migration 004), reports.image_id
  -- is a number, and docs/data-model.md is unsure about images_resize.id.
  if new.comment_id is not null then
    select left(c.content, 500), coalesce(nullif(p.name, ''), c.user_id::text), i.filename
      into v_comment, v_comment_author, v_comment_image
      from public.comments c
      left join public.user_profiles p on p.id = c.user_id
      left join public.images_resize i on i.id::text = c.image_id::text
     where c.id = new.comment_id;
  end if;

  if new.image_id is not null then
    select i.filename, i.author
      into v_image, v_image_author
      from public.images_resize i
     where i.id::text = new.image_id::text;
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body := jsonb_build_object(
      'from', 'Mosaic reports <onboarding@resend.dev>',
      'to', 'mosaic@rio-frances.com',
      'subject', format(
        'Mosaic: new report%s: %s',
        case
          when new.comment_id is not null then ' on a comment'
          when new.image_id is not null then ' on an image'
          else ''
        end,
        -- reason can be free text from the app; a subject must stay on one line
        left(regexp_replace(new.reason, '\s+', ' ', 'g'), 40)
      ),
      -- concat_ws skips nulls, so an empty field drops its line, not the whole body
      'text', concat_ws(E'\n',
        'Report id: ' || new.id,
        'Created: ' || to_char(new.created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI:SS') || ' UTC',
        'Reason: ' || new.reason,
        'Status: ' || new.status,
        'Comment: ' || v_comment,
        'Comment author: ' || v_comment_author,
        'Comment on image: ' || v_comment_image,
        'Image: ' || v_image,
        'Image author: ' || v_image_author,
        'Reported user id: ' || new.reported_user_id,
        'Reporter id: ' || new.reporter_id,
        '',
        'https://supabase.com/dashboard/project/gdzqgrfitiixbhlhppef/editor',
        'Set status to reviewed or rejected when handled.'
      )
    ),
    -- the 2 s default can report timed_out although Resend accepted the email
    timeout_milliseconds := 10000
  );

  return new;
exception when others then
  -- never lose a report because of its email
  raise warning 'notify_new_report failed for report %: %', new.id, sqlerrm;
  return new;
end;
$$;

revoke all on function public.notify_new_report() from public, anon, authenticated;

drop trigger if exists reports_notify_insert on public.reports;
create trigger reports_notify_insert
  after insert on public.reports
  for each row execute function public.notify_new_report();

commit;

-- Check 1, read-only: pg_net holds the API key in net.http_request_queue until it is
-- sent, so app roles must not be able to read it. Expect false, false.
-- select has_table_privilege('anon', 'net.http_request_queue', 'select') as anon,
--        has_table_privilege('authenticated', 'net.http_request_queue', 'select') as authenticated;

-- Check 2, sends nothing (rolled back): the trigger fires for the role the app uses
-- after the revoke. Expect no "permission denied for function notify_new_report".
-- begin;
-- select set_config('request.jwt.claims', '{"sub":"<CARLES_USER_ID>","role":"authenticated"}', true);
-- set local role authenticated;
-- insert into public.reports (reporter_id, image_id, reason)
-- values ('<CARLES_USER_ID>', 1410, 'TEST – delete me');
-- rollback;

-- TEST: THREE SEPARATE RUNS. pg_net sends only after commit and one SQL-editor run is
-- one transaction, so pasted together the select shows nothing and looks like a failure.
--
-- Run 1:
-- insert into public.reports (reporter_id, image_id, reason)
-- values ('<CARLES_USER_ID>', 1410, 'TEST – delete me');
--
-- Run 2, a few seconds later. Good: status_code 200, content has an "id".
-- select * from net._http_response order by created desc limit 3;
--
-- Run 3:
-- delete from public.reports where reason = 'TEST – delete me';

-- ROLLBACK (one paste, leaves pg_net installed):
-- begin;
-- drop trigger if exists reports_notify_insert on public.reports;
-- drop function if exists public.notify_new_report();
-- commit;
