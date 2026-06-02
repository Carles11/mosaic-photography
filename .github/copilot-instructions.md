# Copilot Instructions — Mosaic Photography

Next.js 15 App Router · React 19 · TypeScript · Supabase · AWS S3 CDN · PWA  
Live: https://www.mosaic.photography

---

## Commands

```bash
yarn dev          # dev server :3000
yarn build        # build + postbuild (generates sitemaps — needs Supabase env vars)
yarn test         # Jest / jsdom
yarn lint         # ESLint on src/ only
yarn lint:fix     # auto-fix
yarn analyze      # bundle analysis
# single test:
yarn test --runTestsByPath src/context/modalContext/__tests__/ModalProvider.test.tsx --runInBand
```

---

## Path Aliases

```
@/*           →  src/*
@components/* →  src/components/*
@utils/*      →  src/utils/*
```

Always use aliases. Never use `../../` across feature boundaries.

---

## Architecture in One Diagram

```
src/app/           → Next.js pages (server by default)
src/components/    → UI, grouped by feature
src/context/       → React providers
src/utils/*SSR.ts  → server-side Supabase fetchers
src/lib/           → Supabase clients, auth guards, image helpers
src/types/         → shared TypeScript types (start here)
src/hooks/         → custom hooks
scripts/           → build-time scripts (sitemaps, image processing)
migrations/        → Supabase SQL
docs/              → deep context for each feature (read when needed)
```

**Data flow:**  
`page.tsx (server)` → `src/utils/*SSR.ts` → Supabase → props → `XxxClient.tsx (client)`

---

## Deep Context — Read the Relevant Doc

> Don't read all docs on every task. Read only what's needed.

| Working on…                        | Read first                       |
| ---------------------------------- | -------------------------------- |
| Gallery, filters, images, lightbox | `docs/features/gallery.md`       |
| Auth, route guards, login/signup   | `docs/features/auth.md`          |
| Any modal                          | `docs/features/modals.md`        |
| SEO, metadata, JSON-LD, sitemaps   | `docs/features/seo.md`           |
| Photographer pages, bios, timeline | `docs/features/photographers.md` |
| Supabase tables, data shapes       | `docs/data-model.md`             |
| Naming, imports, component rules   | `docs/conventions.md`            |
| Full system map                    | `docs/architecture.md`           |

---

## Hard Rules — Never Break These

**Images**

- Use only `src/utils/imageResizingS3.ts` helpers for CDN URLs. Never construct them manually.
- No manual image preloading. Next.js `<Image>` with lazy loading handles it.
- `000_aaa_*` filenames = photographer portraits → always filtered from gallery.

**Gallery**

- Default filter is `nudity: "nude"`. Don't change without reading `docs/features/gallery.md`.
- Filters are persisted to Supabase (`user_profiles.filters`). Don't break persistence.

**Modals**

- Open via `useModal()` from `src/context/modalContext/useModal.ts`. Never render bodies directly.
- Add new modals by registering in `src/context/modalContext/modalRegistry.ts`.
- `#modal-root` div must exist before `ModalProviderLoader` mounts (it's in `ClientProviders.tsx`).

**Auth**

- Route classification lives only in `src/lib/auth/auth-guards.ts`. Update that file, nothing else.
- Auth pages inherit `robots: { index: false }` from `src/app/auth/layout.tsx`. Don't remove.
- Read auth state via `useAuth()`. Never from cookies in components.

**SEO**

- Every new public page needs: `export const metadata` + at least one JSON-LD schema.
- Use `src/components/seo/JsonLdSchema.tsx` or inline `<script type="application/ld+json">`.

**Global chrome**

- Header, footer, bottom nav live in `src/components/layouts/ClientLayout.tsx`. Don't add them to individual pages.

**SSR data**

- Only `src/utils/*SSR.ts` fetches from Supabase for server-rendered data.
- Don't call Supabase directly from client components for initial data.

---

## Key File Map

| Task                   | File                                                          |
| ---------------------- | ------------------------------------------------------------- |
| Image CDN URLs         | `src/utils/imageResizingS3.ts`                                |
| Image rendering        | `src/components/wrappers/ImageWrapper.tsx`                    |
| Gallery data fetch     | `src/utils/fetchGalleryImagesSSR.ts`                          |
| Gallery component      | `src/components/gallery/GalleryVirtualizer.tsx`               |
| Modal registry + types | `src/context/modalContext/modalRegistry.ts`                   |
| Modal hook             | `src/context/modalContext/useModal.ts`                        |
| Auth route lists       | `src/lib/auth/auth-guards.ts`                                 |
| Auth state             | `src/context/AuthSessionContext.tsx` + `src/hooks/useAuth.ts` |
| Provider stack         | `src/context/main/ClientProviders.tsx`                        |
| All types              | `src/types/index.ts` (re-exports everything)                  |
| JSON-LD component      | `src/components/seo/JsonLdSchema.tsx`                         |
| Root layout + metadata | `src/app/layout.tsx`                                          |
| Supabase (browser)     | `src/lib/supabaseClient.ts`                                   |
| Supabase (server)      | `src/lib/supabaseServerClient.ts`                             |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL        # browser + server
NEXT_PUBLIC_SUPABASE_ANON_KEY   # browser
SUPABASE_SERVICE_ROLE_KEY       # server/scripts only — never expose to browser
NEXT_PUBLIC_SITE_URL            # https://www.mosaic.photography
```

---

## Adding New Things — Quick Reference

**New page:**

1. Create `src/app/your-path/page.tsx`
2. Export `metadata` with title, description, canonical, OG, Twitter
3. Add JSON-LD schema

**New modal:**

1. Create `src/components/modals/{name}/{Name}ModalBody.tsx` (default export)
2. Add `ModalKey`, `ModalPropsMap` entry, and loader to `src/context/modalContext/modalRegistry.ts`

**New protected route:**

1. Add path to `PROTECTED_ROUTES` in `src/lib/auth/auth-guards.ts`
2. Wrap page with `<ProtectedRoute>`

**New photographer:**  
See `docs/features/photographers.md` — involves S3, Supabase, and build scripts.
