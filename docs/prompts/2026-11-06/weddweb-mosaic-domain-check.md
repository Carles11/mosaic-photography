# Prompt for the weddweb project: did any link point to mosaic.photography?

> Written 2026-11-06 in the Mosaic project. Run it in the **weddweb** repo (openCode or Claude
> Code). It's read-only: an investigation, not a fix.

---

## Task

Find out whether weddweb could have sent visitors to **`www.mosaic.photography/<couple-slug>`**
instead of its own domain. **Read-only: don't change any file, setting or data.** Report what you
find with file paths, line numbers and commit hashes.

## Why (facts from Mosaic's GA4, read 2026-11-06)

Mosaic (www.mosaic.photography, a separate project by the same developer) recorded visits to
paths it doesn't have. GA4 hostname = `www.mosaic.photography`, so the browsers really opened
Mosaic's domain:

| Path | Sessions |
|---|---|
| /natalie-and-alexander | 141 |
| /danielle-and-david | 139 |
| /frank-and-kate | 77 |
| /rebecca-and-chris | 65 |
| /mark-and-nikisha | 39 |
| /maddy-and-ben | 18 |

- All between **28 Dec 2025 and 20 Jan 2026**, in two bursts around **2 Jan** and **14 Jan 2026**.
  Nothing before or after.
- Every session: new user, 0 s engagement, channel "Direct" (no referrer). Mosaic answered 404.
- It is **not known** that these are weddweb couples. They only look like weddweb tenant URLs.
  Treat that as the hypothesis to confirm or reject.

## What to check, in order

1. **Do these six slugs exist** as weddweb tenants/couples (DB seed files, fixtures, tenant config,
   or ask the developer to run a read-only query; write the query, don't run anything that
   writes)? If none of them exist, say so and stop: the hypothesis is rejected.
2. **Where weddweb builds absolute URLs to a couple page**: invitation emails, share links,
   QR codes, Open Graph / canonical URLs, sitemaps, RSVP confirmations. For each, which env var or
   constant supplies the base URL (`NEXT_PUBLIC_SITE_URL`, `SITE_URL`, `BASE_URL`, hardcoded…)?
3. **Any trace of `mosaic.photography`** anywhere in the repo **and its git history**:
   `git log -S "mosaic.photography" --all --oneline` and `git grep -n "mosaic" $(git rev-list --all) -- . | head`
   (adapt if slow). Also `.env*.example`, deployment config, README.
4. **Was weddweb started from the Mosaic codebase?** Look at the first commits, `package.json`
   name/history, leftover Mosaic files or names.
5. **What changed around 28 Dec 2025 – 20 Jan 2026:** `git log --since=2025-12-20 --until=2026-01-25`
   on files from step 2, plus deploy/env changes if they're documented.
6. If the developer can check it (don't do it yourself): the hosting provider's env vars history,
   and whether invitations were sent to these couples' guests around 2 and 14 Jan 2026.

## Report

- Verdict: **confirmed / likely / rejected / unclear**, with the evidence for each step.
- If confirmed: which link type, which file and which commit, and whether the bug is still
  present today. Propose the fix in one sentence, but **don't apply it**.
- What you couldn't check and why.

## Out of scope

Any code or config change, sending emails, contacting couples, touching the Mosaic project.
