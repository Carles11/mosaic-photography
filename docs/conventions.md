# Coding Conventions — Mosaic Photography

> Rules for AI agents and contributors. Follow these to keep the codebase consistent.

---

## TypeScript

- **Strict mode** is on. No `any` unless absolutely unavoidable.
- Import types from `src/types/` (via `@/types` or `@/types/index.ts`).
- Path aliases: `@/*` for `src/*`, `@components/*`, `@utils/*`. Never use `../../..` across feature directories.
- Server components are the default in `src/app/`. Add `"use client"` only when needed.
- Use `interface` for object shapes used as props or data models. Use `type` for unions/intersections.

---

## Components

- One component per file.
- File name = component name (`GalleryVirtualizer.tsx` exports `GalleryVirtualizer`).
- CSS Modules: `ComponentName.module.css` co-located with the component.
- Shared button styles: `src/components/shared/ButtonStyles.module.css`.
- No inline styles except for dynamic values (e.g., computed widths from JS).
- Props types defined in the same file or imported from `@/types/`.

---

## Server vs Client Components

```typescript
// Server component (default in src/app/)
// - Can use async/await
// - Can import supabaseServerClient
// - Cannot use useState, useEffect, browser APIs

// Client component
"use client";
// - Can use hooks
// - Uses supabaseClient (browser singleton)
// - Receives plain serializable props from server components
```

Naming convention: server entry = `page.tsx`, client entry = `XxxClient.tsx`.

---

## Data Fetching

- SSR fetchers live in `src/utils/*SSR.ts`.
- Always handle errors: `const { data, error } = await supabase.from(...)`.
- Log errors with `console.error('[FunctionName] message', error)`.
- Return `null` on error, not throw (let pages handle graceful degradation).
- Client-side fetches (mutations, user actions): use `supabaseClient` directly in context/hooks.

---

## Image Rules

- Always use `next/image` (`<Image>`).
- Always provide `alt`, `width`, `height`.
- Never construct CDN URLs manually. Use `src/utils/imageResizingS3.ts`.
- Never add `loading="eager"` or manual `<link rel="preload">` for images.
- Photographer portraits (`000_aaa_*`) are filtered from gallery — do not change this.

---

## Auth

- Route classification is centralized in `src/lib/auth/auth-guards.ts`.
- Never hard-code route checks in middleware or pages.
- Always wrap protected pages with `<ProtectedRoute>`.
- Read auth state via `useAuth()`, never directly from cookies in components.

---

## Modal System

- Never render modal bodies directly. Always use `open()` from `useModal()`.
- All modal bodies must be default-exported React components.
- All modals registered in `src/context/modalContext/modalRegistry.ts`.
- `onClose` prop should always call the modal system's `close()`.

---

## SEO

- Every public page: `export const metadata` or `generateMetadata`.
- Every public page: at least one JSON-LD schema.
- Auth pages: `robots: { index: false, follow: false }` (inherited from auth layout).
- Don't remove canonical URLs from pages.

---

## Naming

- Components: PascalCase (`GalleryVirtualizer`)
- Files: match component name (`GalleryVirtualizer.tsx`)
- CSS modules: `componentName.module.css` or `ComponentName.module.css`
- Hooks: `useXxx.ts`
- Contexts: `XxxContext.tsx`
- SSR utils: `fetchXxxSSR.ts`
- Types: camelCase for properties, PascalCase for interfaces/types

---

## Testing

- Jest + Testing Library + jsdom.
- Test files: `__tests__/XxxName.test.tsx` co-located with source.
- `jest.setup.ts` adds `#modal-root` to `document.body` (required for modal tests).
- Run single file: `yarn test --runTestsByPath path/to/file.test.tsx --runInBand`

---

## Imports Order (ESLint enforced)

1. React
2. Next.js
3. Third-party libraries
4. Internal aliases (`@/*`, `@components/*`, `@utils/*`)
5. Relative imports

Run `yarn lint:fix` to auto-fix import ordering.

---

## Git / Commits

- Keep commits focused on one concern.
- Build must pass: `yarn build` before pushing.
- Sitemap generation runs on `postbuild` — requires Supabase env vars.

---

## Files NOT to Modify Without Understanding

| File | Reason |
|---|---|
| `src/app/layout.tsx` | Critical CSS, font loading, root JSON-LD |
| `src/utils/imageResizingS3.ts` | All CDN URL logic |
| `src/context/main/ClientProviders.tsx` | Provider order matters |
| `src/lib/auth/auth-guards.ts` | Single source of truth for routes |
| `src/context/modalContext/modalRegistry.ts` | Types must stay in sync |
| `src/context/settingsContext/filters.tsx` | Persisted to Supabase |
| `next.config.ts` | CSP headers, image domains, PWA |
| `src/middleware.ts` | Bot detection, theme, Edge Runtime constraints |
