# CLAUDE.md — Mosaic Photography

> AI agent guide for Claude, Cursor, Copilot, and other coding assistants.
> Read this file first. Then read `docs/architecture.md` for deep context.
> For feature-specific work, read only the relevant `docs/features/*.md`.

---

## Project at a Glance

**Mosaic Photography** — Next.js 15 App Router · React 19 · TypeScript · Supabase · AWS S3/CDN · PWA

A public-domain photography gallery. All images CC PDM 1.0.

**Live site:** https://www.mosaic.photography

---

## Quick Commands

```bash
yarn dev          # Start dev server (port 3000)
yarn build        # Production build + sitemap generation (postbuild)
yarn test         # Jest (jsdom, jest.setup.ts)
yarn lint         # ESLint against src/ only
yarn lint:fix     # Auto-fix ESLint issues
yarn analyze      # Bundle analysis build
```

Run a single test file:
```bash
yarn test --runTestsByPath src/context/modalContext/__tests__/ModalProvider.test.tsx --runInBand
```

**Build dependencies:** `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` required for sitemap scripts.

---

## Path Aliases (tsconfig.json)

```
@/*           →  src/*
@components/* →  src/components/*
@utils/*      →  src/utils/*
```

Always use these aliases. Never use relative `../../` imports across feature boundaries.

---

## Architecture in 60 Seconds

```
src/app/               # Next.js App Router pages (server components by default)
src/components/        # UI components, grouped by feature
src/context/           # React context providers
src/utils/*SSR.ts      # Server-side Supabase data fetchers
src/lib/               # Supabase clients, auth guards, image helpers
src/types/             # Shared TypeScript types (start here for data shapes)
src/hooks/             # Custom React hooks
src/helpers/           # Pure utility functions
scripts/               # Build-time scripts (sitemap generation, image processing)
migrations/            # Supabase SQL migrations
```

**Data flow:** `page.tsx (server)` → `fetchXxxSSR.ts` → Supabase → props → `XxxClient.tsx (client)`

**CDN base:** `https://cdn.mosaic.photography/mosaic-collections/public-domain-collection/{photographer-slug}/{size}/{filename}.webp`

---

## The 10 Rules Every AI Agent Must Follow

1. **Use `src/utils/imageResizingS3.ts` for all image URLs.** Never construct CDN URLs ad hoc. Use `getBestS3FolderForWidth`, `getAllS3Urls`, `getProgressiveZoomSrc`.

2. **Never add manual image preloading.** It was intentionally removed. Next.js `<Image>` with lazy loading is the strategy.

3. **Gallery defaults to `nudity: "nude"`.** Don't change this default without understanding filters in `src/context/settingsContext/filters.tsx`.

4. **Modal work = `src/context/modalContext/`.** Use `useModal` hook. Add new modals to `modalRegistry.ts`. Bodies are lazy-loaded. `#modal-root` div must exist before `ModalProviderLoader` mounts.

5. **Route guards live in `src/lib/auth/auth-guards.ts`.** When making a route protected or public, update only that file.

6. **Auth routes are NOT indexed.** `src/app/auth/layout.tsx` sets `robots.index = false`. Keep it.

7. **SSR data helpers are in `src/utils/*SSR.ts`.** Server components call these. Do not call Supabase directly from client components for initial data.

8. **Structured data is a first-class concern.** Every public page needs metadata export + JSON-LD. See `src/components/seo/JsonLdSchema.tsx`.

9. **Global chrome is in `ClientLayout`.** Don't add bottom nav or header to individual pages.

10. **Filters are persisted.** `FiltersProvider` in `src/context/settingsContext/filters.tsx` saves to `user_profiles.filters` for logged-in users. Don't break persistence.

---

## Key Files by Task

| Task | Read first |
|---|---|
| Add/change a page | `src/app/layout.tsx`, relevant `page.tsx` |
| Gallery changes | `docs/features/gallery.md` |
| Auth changes | `docs/features/auth.md`, `src/lib/auth/auth-guards.ts` |
| Modal changes | `docs/features/modals.md`, `src/context/modalContext/modalRegistry.ts` |
| SEO / structured data | `docs/features/seo.md` |
| Image delivery | `src/utils/imageResizingS3.ts` |
| Photographer pages | `docs/features/photographers.md` |
| New DB table or data | `docs/data-model.md` |
| Coding style | `docs/conventions.md` |

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL (browser + server)
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon key (browser)
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key (server/scripts ONLY)
NEXT_PUBLIC_SITE_URL=              # https://www.mosaic.photography
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

---

## What NOT to Do

- ❌ Don't construct CDN image URLs manually
- ❌ Don't add image preloading (browser/Next.js handles it)
- ❌ Don't add route guards inline in pages (use `auth-guards.ts`)
- ❌ Don't open modals by rendering them directly (use the modal registry + `useModal`)
- ❌ Don't change `nudity` gallery default without understanding filter persistence
- ❌ Don't put auth pages behind indexable routes
- ❌ Don't call Supabase directly from client components for SSR data
- ❌ Don't skip JSON-LD when adding a new public page

---

## Deep Docs

- `docs/architecture.md` — complete system map
- `docs/features/gallery.md` — gallery, masonry, virtualizer, lightbox
- `docs/features/auth.md` — auth flow, guards, providers
- `docs/features/modals.md` — modal system, registry, lazy loading
- `docs/features/seo.md` — SEO, structured data, sitemaps
- `docs/features/photographers.md` — photographer pages, data, timeline
- `docs/data-model.md` — Supabase tables, data shapes
- `docs/conventions.md` — coding conventions
