# Copilot Instructions

## Build, test, and lint commands

- `yarn lint` - Runs ESLint against `src/` only.
- `yarn lint:fix` - Applies auto-fixable ESLint changes in `src/`.
- `yarn test` - Runs the Jest suite with `jsdom` and `jest.setup.ts`.
- `yarn test --runTestsByPath src/context/modalContext/__tests__/ModalProvider.test.tsx --runInBand` - Pattern for running a single test file.
- `yarn build` - Runs `next build`, then `postbuild`, which generates `public/image-sitemap.xml` and `public/collection-sitemap.xml`.
- `yarn pages:build` - Cloudflare Pages build (`next build` plus `@cloudflare/next-on-pages`).
- `yarn analyze` - Next bundle analysis build.
- `yarn generate-image-sitemap` - Runs `scripts/generate-image-sitemap.ts` directly.

`yarn build` and the sitemap scripts depend on Supabase environment variables. `scripts/generate-image-sitemap.ts` and `scripts/generate-collection-sitemap.ts` use `NEXT_PUBLIC_SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY`.

## High-level architecture

- The app uses the Next.js App Router under `src/app`. Server route files usually fetch data first, then hand plain props to client entry components. Example: `src/app/page.tsx` loads photographers and images with SSR helpers, then renders `HomeClient`.
- Most gallery data comes from Supabase. The browser client lives in `src/lib/supabaseClient.ts`, while server-side fetch helpers in `src/utils/*SSR.ts` query `photographers`, `images_resize`, and related tables, then normalize the results for the UI.
- The homepage/gallery pipeline is spread across several layers:
  - `fetchGalleryImagesSSR.ts` reads `images_resize`, filters out filenames starting with `000_aaa`, shuffles the result, and assigns `mosaicType`.
  - `components/wrappers/HomeClientWrapper.tsx` composes the landing page, age gate, structured data, photographer slider, and gallery.
  - `components/gallery/Gallery.tsx` applies persisted filters and attaches `photographer_slug` values by matching image authors to photographers.
  - `components/gallery/GalleryVirtualizer.tsx` renders the masonry grid and lightbox, and coordinates downloads, comments, favorites, and author navigation.
  - `components/wrappers/ImageWrapper.tsx` chooses the best CDN/S3 rendition and emits image JSON-LD.
- Cross-cutting client state is wired in `src/context/main/ClientProviders.tsx`. The provider stack wraps theme, service worker, auth session, age consent, favorites, comments, filters, lazy-loaded modals, and cookie consent around the whole app.
- Global page chrome lives in `src/components/layouts/ClientLayout.tsx`. It owns the authenticated header, footer, and bottom navigation; pages should not render their own bottom nav.
- SEO/performance behavior is centralized in the root layout and config:
  - `src/app/layout.tsx` inlines base CSS, critical CSS, early font declarations, and site-level JSON-LD.
  - `next.config.ts` defines remote image hosts, CSP/security headers, bundle analysis, and PWA behavior.
  - Postbuild scripts generate sitemap files from Supabase data.
- Auth is hybrid:
  - `src/context/AuthSessionContext.tsx` is the source of truth for client auth state via Supabase.
  - `src/lib/auth/auth-guards.ts` centralizes protected/auth/public route definitions.
  - `src/middleware.ts` sets the theme header, applies the crawler age-gate bypass cookie, and only does lightweight auth redirects; protected page enforcement still happens in client guards like `ProtectedRoute`.

## SEO and AI-search implementation

- Site-level metadata is defined in `src/app/layout.tsx`: `metadataBase`, canonical URL, title template, description, authors, icons, manifest, Open Graph, Twitter cards, and viewport settings.
- Route-level SEO is important in this codebase. The FAQ page, app landing page, photographer detail pages, and legal pages all define their own metadata, and photographer pages use `generateMetadata` to build canonical URLs, OG/Twitter data, and keyword sets from Supabase content.
- Non-indexable routes are explicitly marked. `src/app/auth/layout.tsx` and `src/app/not-found.tsx` set `robots.index = false` and `robots.follow = false`.
- Structured data is a first-class concern:
  - `src/components/seo/JsonLdSchema.tsx` supports `WebSite`, `WebPage`, `Organization`, `ImageGallery`, and `ImageObject`.
  - `src/app/layout.tsx` emits site-level `WebSite` schema.
  - `src/components/wrappers/HomeClientWrapper.tsx` emits homepage `WebPage` + gallery data from `src/utils/structuredData.ts`.
  - `src/components/wrappers/ImageWrapper.tsx` emits image/gallery JSON-LD with title, description, credit, dimensions, encoding format, public-domain license URL, and `acquireLicensePage`.
  - `src/app/photographers/[surname]/page.tsx` emits `Person` schema for the photographer profile.
  - `src/app/app/page.tsx` emits `WebPage` plus an `ImageGallery` of app screenshots.
  - `src/app/faq/page.tsx` + `src/components/wrappers/FaqClientWrapper.tsx` emit `FAQPage` structured data from `src/utils/faqStructuredData.ts`.
- Image SEO is deliberate and should be preserved:
  - Image URLs are derived from CDN/S3 renditions through `src/utils/imageResizingS3.ts`.
  - The project uses WebP variants, explicit width/height metadata, alt text, and image license metadata.
  - `next.config.ts` constrains remote image hosts, WebP output, cache TTL, and image/device size buckets.
  - Manual image preloading was intentionally removed; the current SEO/performance strategy is lazy loading plus responsive CDN sizing.
- Search discovery is split between standard and custom sitemap generation:
  - `next-sitemap.config.js` enables `robots.txt` generation and includes the main sitemap plus image and collection sitemaps.
  - `scripts/generate-image-sitemap.ts` builds `public/image-sitemap.xml` from Supabase image + photographer data.
  - `scripts/generate-collection-sitemap.ts` builds `public/collection-sitemap.xml` from public collections.
  - `yarn build` runs both sitemap generators via `postbuild`.
- FAQ content is part of the SEO/AI-search strategy, not just support content. `src/app/constants/faqSections.ts` and `src/utils/faqStructuredData.ts` target long-tail queries about public-domain usage, licensing, image SEO, and how AI search engines evaluate photography websites, then expose the same content as crawlable page copy plus `FAQPage` schema.
- Performance work is tied to ranking goals. The root layout inlines critical CSS and base CSS, preloads Trade Gothic fonts from the CDN, and adds `preconnect`/`dns-prefetch` hints for the CDN and Supabase host.

## Key conventions

- Use the `src/context/modalContext/*` implementation for modal work. The app lazily loads modal bodies from a registry, and `ClientProviders` must render `#modal-root` before `ModalProviderLoader` mounts. Tests rely on the same portal root via `jest.setup.ts`.
- Keep route classification in `src/lib/auth/auth-guards.ts`. If a route becomes protected or auth-only, update the shared lists instead of hard-coding checks in pages or middleware.
- Preserve the existing image delivery path. Gallery and detail views are expected to use `src/utils/imageResizingS3.ts` helpers to choose WebP renditions from the CDN/S3 structure (`w400`/`w600`/.../`originalsWEBP`) instead of constructing URLs ad hoc.
- Do not reintroduce manual image preloading. The project intentionally removed custom preloading utilities and relies on Next image loading plus responsive CDN sizing.
- The gallery defaults to `nudity: "nude"` when no nudity filter is set. Changes to gallery filtering should keep that default behavior in mind.
- Filters are both local UI state and persisted user state. `src/context/settingsContext/filters.tsx` loads and saves filters through the `user_profiles.filters` column when a user is logged in.
- Public pages usually add structured data close to the rendered content (`JsonLdSchema` or inline JSON-LD) alongside page metadata. SEO changes usually require touching both the route metadata and the rendered schema.
- Prefer the existing path aliases from `tsconfig.json`: `@/*` for `src/*`, plus `@components/*` and `@utils/*`.
