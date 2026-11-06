# Prompt for Claude Code: email alert on every new report (migration 015)

> Written 2026-11-06. Start in the web repo:
> `cd ~/Documents/aaa_repos/mosaic-photography && claude`, then:
> "Read docs/prompts/2026-11-06/report-email-alerts.md and do it."

---

## Goal

When a row is inserted into `public.reports` (a user reports a comment or an image; today only
the mobile app does this), send one plain-text email to the owner within a minute. Nobody gets
told about reports today: the only report ever sat `pending` for 9 months (`docs/TASKS.md`,
Task 4, "Comment moderation").

## Context you need

- Supabase project `gdzqgrfitiixbhlhppef`, Free plan. Migrations are plain SQL files in
  `migrations/`, run by hand in the Supabase SQL editor (see `migrations/README.md`). The last one
  is `014_user_profiles_public_view.sql`. Use its style, including the rollback block at the end.
- There is **no** `supabase/` folder, no Supabase CLI setup and no Edge Function in this repo. Keep
  it that way (see Requirements).
- `public.reports` columns (from the mobile model): `id uuid`, `reporter_id uuid`,
  `reported_user_id uuid null`, `comment_id uuid null`, `image_id bigint null`, `reason text`,
  `created_at timestamptz`, `status text` (default `pending`), `reviewed_by uuid null`.
  **Check the real column types first** with a read-only query on `information_schema.columns`,
  written into the migration header as a comment for Carles to run. Don't assume.
- Related tables: `public.comments` (`id`, `content`, `user_id`, `image_id`),
  `public.images_resize` (`id`, `filename`, `author`), `public.user_profiles` (`id`, `name`).
- Email goes through **Resend's HTTP API** (`POST https://api.resend.com/emails`, header
  `Authorization: Bearer <key>`, JSON body `from`, `to`, `subject`, `text`). The account has no
  verified domain, so `from` must be `Mosaic reports <onboarding@resend.dev>` and `to` must be the
  Resend account address, `mosaic@rio-frances.com`. Resend rejects any other recipient (403).

## Requirements

1. **New file `migrations/015_report_email_alerts.sql`**, idempotent where reasonable
   (`create or replace`, `drop trigger if exists`):
   - `create extension if not exists pg_net;` (Supabase's async HTTP extension; it sends after
     the transaction commits, so a failed email can never block or roll back a report insert.
     That's the reason to use it.)
   - A function `public.notify_new_report()` (trigger function), `security definer`,
     `set search_path = ''`, fully qualified names. Security definer is deliberate: it has to read
     the Vault secret and the related rows regardless of the reporter's RLS.
     - Reads the API key from Supabase Vault:
       `select decrypted_secret from vault.decrypted_secrets where name = 'resend_api_key'`.
       If the key is missing, `raise warning` and `return new` (never fail the insert).
     - Builds a **plain-text** body (no HTML, so no escaping/injection issues) with: report id,
       created_at (UTC), reason, status; if `comment_id` is set, the comment's content (truncate to
       500 chars), its author's `user_profiles.name` or user id, and the image filename it sits on;
       if `image_id` is set, `images_resize.filename` and `author`; reporter id. End with the
       dashboard link
       `https://supabase.com/dashboard/project/gdzqgrfitiixbhlhppef/editor` and the line
       "Set status to reviewed or rejected when handled."
     - Subject: `Mosaic: new report on a comment` or `… on an image`, plus the first 40 chars of
       the reason.
     - Sends with `net.http_post(url := 'https://api.resend.com/emails', headers := …,
       body := jsonb_build_object(...))`. Build JSON with `jsonb_build_object`, never string
       concatenation.
     - `return new;`
   - `revoke all on function public.notify_new_report() from public, anon, authenticated;`
     (the trigger still fires, since triggers don't need EXECUTE for the inserting role. Verify
     this claim against Postgres docs in a comment; if wrong, keep the default grant).
   - `create trigger reports_notify_insert after insert on public.reports for each row execute
     function public.notify_new_report();`
   - At the end, commented out: a **test block** (insert one test report as the SQL-editor role
     with a real `reporter_id` placeholder `<CARLES_USER_ID>` and reason `TEST – delete me`, then
     `select * from net._http_response order by created desc limit 3;` to see Resend's status,
     then delete the test row) and a **rollback block** (drop trigger, drop function; leave pg_net
     installed).
2. **`docs/RUNBOOKS.md`**: append a short section "Report email alerts" (where the key lives:
   Supabase Vault secret `resend_api_key`; how to rotate it; how to check failures with
   `net._http_response`; that the recipient must stay the Resend account address until a domain is
   verified). Append only; don't rewrite other sections.
3. **`docs/TASKS.md`**: under "Task 6 — Moderation alerts", append dated findings. Don't
   touch other tasks.

## Out of scope

- Edge Functions, Supabase CLI setup, a `supabase/` folder.
- Emails for new comments (a weekly digest may come later, separate prompt).
- A report button on the web, any UI change, any change in the mobile repo.
- Verifying a domain in Resend, DNS changes.
- Changing RLS on `reports` or any other table.
- Storing the key anywhere except Vault. Never write a key into a file, a comment or a log.

## Deliver

- The migration file + the two doc edits. Run `yarn lint` only if you touched `src/` (you
  shouldn't).
- Tell Carles, in order: (1) the read-only column check to run first, (2) how to create the Vault
  secret in the dashboard (Project → Integrations → Vault → Add new secret, name
  `resend_api_key`), (3) run 015, (4) run the test block with his user id, (5) what a good
  `net._http_response` row looks like (status 200, body with an `id`), (6) delete the test row.
- End with what you skipped or left unchecked.

Run /ponytail-review before committing.
