# openCode prompt — SEO hygiene batch 1 (Task 2/3 leftovers)

> Written 2026-10-01. Run from the web repo root. Self-contained: do exactly
> these four items, nothing else. Do NOT run any git write command (no add,
> commit, push, stash, checkout). Carles commits.

## Context (read first)

Repo: `mosaic-photography` (Next.js 15 App Router, React 19, TypeScript,
Supabase, hosted on AWS Amplify). Read `CLAUDE.md` (the 10 rules) before
editing. The site was demoted by Google's June 2026 spam update, so small
technical-SEO defects matter. Do not refactor, rename or reformat anything
outside the lines named below.

## Item 1 — Soft 404 on retired toolkit pages

Problem: `/toolkit/amazon`, `/toolkit/poster-master`, `/toolkit/big-wall-decor`
answer HTTP **200** with not-found content. Those advertisers have
`is_active = false`. `src/app/toolkit/[slug]/page.tsx` sets
`dynamicParams = false`, but the folder also has `loading.tsx`, which makes
the route stream: the 200 header is sent before `notFound()` runs.

Do:
1. Delete `src/app/toolkit/[slug]/loading.tsx` (the 4 active toolkit pages are
   prerendered, so no loading UI is needed).
2. In the big comment above `export const dynamicParams = false;` in
   `page.tsx`, add one sentence: "loading.tsx was removed on 2026-10-01 for the
   same reason: it made the route stream and send 200 before notFound()."
3. Verify (step "Verification" below). If `/toolkit/amazon` still returns 200
   after the build, STOP and report the exact output; do not try other fixes.

## Item 2 — 301 for the old contributor slug

`/community/photography/elcarles` was renamed to
`/community/photography/elcarles78` without a redirect. In `next.config.ts`,
inside `async redirects()`, add after the existing `/contributors/:slug` entry:

```ts
{
  source: "/community/photography/elcarles",
  destination: "/community/photography/elcarles78",
  permanent: true,
},
```

## Item 3 — `noopener noreferrer` on sponsored links

Change `rel="sponsored"` to `rel="sponsored noopener noreferrer"` at exactly
these 7 places (all are `target="_blank"` affiliate links):

- `src/components/toolkit/templates/TemplateMarketplace.tsx` line ~154
- `src/components/toolkit/templates/TemplatePrint.tsx` line ~205
- `src/components/toolkit/templates/TemplateSoftware.tsx` lines ~43, ~181, ~260, ~310, ~369

Check: `grep -rn 'rel="sponsored"' src` must return only the comment line in
`src/app/photographers/[surname]/page.tsx`.

## Item 4 — Delete an unused duplicate file

Delete `src/components/toolkit/ToolkitAffiliateBadge (1).tsx` (with the space
and "(1)"). It is imported nowhere — confirm with
`grep -rn "ToolkitAffiliateBadge (1)" src` (must return nothing) before deleting.
Do not touch `ToolkitAffiliateBadge.tsx`.

## Verification

Run, in order, and paste the output of each in your final report:

```bash
yarn lint
yarn test
yarn build
```

Then start the production server (`yarn start`, port 3000) and in a second
terminal:

```bash
for u in toolkit/amazon toolkit/poster-master toolkit/big-wall-decor toolkit/does-not-exist toolkit/taschen community/photography/elcarles; do
  printf "%s -> " "$u"; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "http://localhost:3000/$u"
done
```

Expected:
- the three retired slugs and `does-not-exist` → `404`
- `toolkit/taschen` → `200`
- `community/photography/elcarles` → `308 http://localhost:3000/community/photography/elcarles78`

Note: `yarn build` regenerates `public/sitemap*.xml` and its last step
(`scripts/indexnow.ts`) may ping IndexNow. That is fine. Do NOT revert the
regenerated sitemap files; just list them in the report.

## Final report (keep it short)

1. Files changed / deleted.
2. Lint, test, build: pass or fail (paste errors only).
3. The curl table with actual status codes.
4. Anything you could not do and why.
