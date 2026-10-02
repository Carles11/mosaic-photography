# openCode task: make /llms.txt actually live

Date: 2026-10-02 · Repo: mosaic-photography (Next.js 15) · Branch: main
Context: docs/TASKS.md Task 3, Findings 2026-10-02.

## Why

`llms.txt` lives in the repo root. Next.js only serves static files from
`public/`, so https://www.mosaic.photography/llms.txt returns 404 (checked
by Carles 2026-10-02). CLAUDE.md requires llms.txt for GEO. `robots.txt`
in `public/` is served fine through the same middleware, so moving the file
is enough.

## Do exactly this (nothing else)

1. `git mv llms.txt public/llms.txt` (keeps history).
2. Content check of `public/llms.txt`, edit only what is wrong:
   - Every `https://www.mosaic.photography/...` URL in it must be either
     `/sitemap.xml`, `/sitemap-0.xml`, `/image-sitemap.xml`, `/robots.txt`,
     or a `<loc>` that exists in `public/sitemap-0.xml`. Remove or fix any
     that is not (e.g. old `/photographers/<surname>` with accents, removed
     routes, `/profile/collections/*`, `/collection-sitemap.xml`).
   - Photographer pages that are in `public/sitemap-0.xml` but missing from
     llms.txt: add them to the existing photographer list in the same format.
   - Do not rewrite the prose, do not add marketing text, do not add
     affiliate links. Keep it plain Markdown.
3. Update the location in docs:
   - `docs/architecture.md` ~line 149: move the `llms.txt` tree entry under
     `public/`.
   - `docs/features/seo.md` ~line 136: "`llms.txt` at root" →
     "`public/llms.txt` (served at /llms.txt)".
4. `src/middleware.ts`: do NOT change it. Only report whether any branch
   could redirect or gate `/llms.txt` (age gate, auth). If yes, stop and
   report instead of changing code.

## Rules

- Touch only: llms.txt → public/llms.txt, docs/architecture.md,
  docs/features/seo.md.
- No git add beyond the git mv, no commit, no push. Carles commits.
- Do not run `npm run build` (postbuild pings IndexNow).

## Verify and report

- `npm run dev`, then `curl -sI http://localhost:3000/llms.txt` → `200`
  and `content-type: text/plain`. Paste the status line and content-type.
  Stop the dev server afterwards.
- List every URL you removed, fixed or added in llms.txt (one per line).
- `git status --short`.
