# Drop /photo-curations from sitemap and llms.txt

Repo: mosaic-photography (Next.js 15). Read `CLAUDE.md` first.

## Why
`/photo-curations` is a login-only page (redirects logged-out users to
`/auth/login`) and is correctly `noindex, nofollow` in
`src/app/photo-curations/page.tsx`. But it is listed in `sitemap-0.xml` and in
`public/llms.txt`. A sitemap must only list indexable URLs; Bing Webmaster Tools
reports it as "Discovered but not selected" (found 2026-11-03).

## Do exactly this
1. `scripts/generate-sitemap-0.ts`: remove the `staticPages` entry whose `loc` is
   `https://www.mosaic.photography/photo-curations`. Touch nothing else.
2. `public/llms.txt`: remove the line `- **Photo curations:** https://www.mosaic.photography/photo-curations`.
3. Search the repo (excluding `node_modules`, `.next`, `docs/`) for any other
   sitemap/llms reference to `photo-curations` and report it; do not change it.

## Out of scope
- Do NOT change `src/app/photo-curations/page.tsx` (keep `noindex`, keep canonical).
- Do NOT touch other sitemap entries, the legal pages, or `next-sitemap.config.js`.
- No refactors, no new files, no new config.

## Verify
- `yarn lint` passes.
- `npx tsx scripts/generate-sitemap-0.ts` (needs `NEXT_PUBLIC_SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`; if missing, skip and say so) →
  `grep -c photo-curations public/sitemap-0.xml` prints 0 and the file has 28 `<loc>`.
- Show the full diff. Do not commit.

## Follow-up (same day): IndexNow lists
Same reason: IndexNow should only ping indexable URLs.
1. `scripts/indexnow.ts`: remove `` `${SITE_URL}/photo-curations`, `` from `STATIC_URLS`.
2. `src/app/api/indexnow/route.ts`: remove the same line from `DEFAULT_URLS`.
Out of scope: everything else in both files (keys, endpoint, other URLs).
Verify: `yarn lint` passes; `grep -rn photo-curations scripts src/app/api` prints nothing. Show the diff. Do not commit.
