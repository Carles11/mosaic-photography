# Architecture — Mosaic Photography

> Complete system map for AI agents. Read CLAUDE.md first.

---

## Directory Map

```
mosaic-photography/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout: fonts, critical CSS, JSON-LD, providers
│   │   ├── page.tsx                # Homepage: SSR fetch → HomeClient
│   │   ├── HomeClient.tsx          # Homepage client entry
│   │   ├── about/                  # About page
│   │   ├── app/                    # Mobile app landing page
│   │   ├── auth/                   # Auth pages (NOT indexed)
│   │   │   └── layout.tsx          # Sets robots: false for all auth routes
│   │   ├── faq/                    # FAQ page (FAQPage JSON-LD)
│   │   ├── legal/                  # Privacy, ToS, Credits
│   │   ├── photo-curations/        # Protected: user photo curations
│   │   ├── photographers/
│   │   │   └── [surname]/page.tsx  # Dynamic photographer page
│   │   ├── profile/                # Protected: user profile + collections
│   │   ├── toolkit/[slug]/         # Affiliate toolkit pages
│   │   ├── constants/faqSections.ts
│   │   └── api/indexnow/           # IndexNow search engine ping endpoint
│   │
│   ├── components/                 # UI components (grouped by feature)
│   │   ├── analytics/              # Toolkit page view tracking
│   │   ├── appBanner/              # App download banners
│   │   ├── appLanding/             # Mobile app landing sections
│   │   ├── auth/                   # Auth forms + guards
│   │   ├── buttons/                # Reusable buttons (Heart, Download, Share, etc.)
│   │   ├── cards/                  # Gallery skeleton, photographer card, toolkit card
│   │   ├── comments/               # Comment form and item
│   │   ├── contents/               # Profile tabs (Favorites, Collections, Comments)
│   │   ├── cookieConsent/          # GDPR cookie banner + analytics loader
│   │   ├── footer/                 # Footer
│   │   ├── gallery/                # Gallery, GalleryVirtualizer, PhotographerGalleryZoom
│   │   ├── header/                 # Header, HomeTabs, HomeTitles
│   │   ├── hero/                   # HeroSection
│   │   ├── inputs/                 # Dropdown input
│   │   ├── layouts/                # ClientLayout (global chrome wrapper)
│   │   ├── loaders/                # ClimbBoxLoader spinner
│   │   ├── logo/                   # ThemedLogo
│   │   ├── modals/                 # Modal shells + all modal bodies (lazy-loaded)
│   │   ├── navigation/             # BottomNav, DesktopNav
│   │   ├── pickers/                # DatePicker
│   │   ├── profile/                # Avatar, FavoritesList, CollectionsList, ProfileForm
│   │   ├── seo/                    # JsonLdSchema component
│   │   ├── sliders/                # Embla carousel (photographers)
│   │   ├── theme/                  # ThemeToggle
│   │   ├── timeline/               # Timeline component
│   │   ├── toolkit/                # Toolkit templates and components
│   │   ├── wrappers/               # HomeClientWrapper, FaqClientWrapper, ImageWrapper
│   │   └── NonCriticalCSSLoader.tsx
│   │
│   ├── context/
│   │   ├── main/ClientProviders.tsx  # Root provider stack (ORDER MATTERS — see below)
│   │   ├── AuthSessionContext.tsx    # Source of truth for client auth state
│   │   ├── AgeConsentContext.tsx     # Age gate state
│   │   ├── FavoritesContext.tsx      # User favorites
│   │   ├── CommentsContext.tsx       # Comments
│   │   ├── ServiceWorkerContext.tsx  # PWA service worker
│   │   ├── settingsContext/
│   │   │   └── filters.tsx          # Gallery filters (persisted to Supabase)
│   │   └── modalContext/
│   │       ├── ModalProvider.tsx     # Modal state machine
│   │       ├── modalRegistry.ts     # Lazy-loaded modal body registry
│   │       ├── useModal.ts          # Hook for opening modals
│   │       └── __tests__/
│   │
│   ├── lib/
│   │   ├── supabaseClient.ts        # Browser Supabase client (singleton)
│   │   ├── supabaseServerClient.ts  # Server Supabase client
│   │   ├── auth/
│   │   │   ├── auth-guards.ts       # Route lists + guard helpers (SINGLE SOURCE OF TRUTH)
│   │   │   └── auth-helpers.ts
│   │   ├── images/quality/
│   │   │   └── qualityConfig.ts
│   │   └── timeline/
│   │       └── photographersTimelines.ts
│   │
│   ├── utils/
│   │   ├── fetchGalleryImagesSSR.ts         # Fetches all gallery images from Supabase
│   │   ├── fetchPhotographersBasic.ts       # Fetches photographer list (lightweight)
│   │   ├── fetchPhotographersWithFeaturedSSR.ts # Fetches photographers + featured images
│   │   ├── fetchPhotographerByIdSSR.ts      # Single photographer + their images
│   │   ├── fetchAffiliateDataSSR.ts         # Toolkit affiliate data
│   │   ├── imageResizingS3.ts               # CDN URL construction (USE THIS)
│   │   ├── mosaicLayout.ts                  # Masonry layout logic
│   │   ├── structuredData.ts                # JSON-LD data builders
│   │   ├── faqStructuredData.ts             # FAQPage schema builder
│   │   ├── getAvailableDownloadOptionsForImage.ts
│   │   ├── handleDownloadOptionClick.ts
│   │   ├── slugify.ts
│   │   ├── clean-content.ts
│   │   ├── criticalCSS.ts
│   │   ├── performanceMonitor.ts
│   │   └── sessionDebug.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth state (wraps AuthSessionContext)
│   │   ├── useAuthGuard.ts          # Client-side route protection
│   │   ├── useIsMobile.tsx
│   │   ├── useLoginAndCloseModal.ts
│   │   └── useNonCriticalCssLoaded.ts
│   │
│   ├── helpers/
│   │   ├── colors.ts
│   │   ├── dates.ts
│   │   ├── parseHashParams.ts
│   │   └── shuffle.ts
│   │
│   ├── hocs/
│   │   └── withClientLogic.tsx
│   │
│   ├── types/
│   │   ├── index.ts                 # Re-exports (import from here)
│   │   ├── gallery.ts               # ImageData, Photographer, GalleryFilter, Collection, Comment...
│   │   ├── auth.ts
│   │   ├── components.ts
│   │   ├── dropdown.ts
│   │   ├── app.ts
│   │   ├── ui.ts
│   │   └── user.ts
│   │
│   ├── middleware.ts                # Theme header, bot cookie, auth redirects
│   ├── critical-above-the-fold.css
│   └── globals.css (inlined via ?raw in layout)
│
├── scripts/                        # Build-time scripts
│   ├── generate-sitemap-0.ts
│   ├── generate-image-sitemap.ts   # Builds public/image-sitemap.xml from Supabase
│   ├── generate-collection-sitemap.ts
│   ├── indexnow.ts
│   ├── adding-new-photographers/   # Image processing pipeline
│   │   ├── 1-convert-originals-to-webp.mjs
│   │   ├── 2-generate-responsive-sizes.mjs
│   │   └── 3-generate-supabase-csv.py
│   └── migrations/
│
├── migrations/                     # Supabase SQL migrations (numbered)
├── public/                         # Static assets, sitemaps, favicons, screenshots
├── CLAUDE.md                       # AI agent guide (read first)
├── .cursorrules                    # Cursor-specific rules
├── llms.txt                        # AI search engine discovery file
├── next.config.ts                  # Next.js config (images, CSP headers, PWA)
├── pwa.config.js                   # PWA configuration
├── tsconfig.json                   # Path aliases: @/* @components/* @utils/*
└── package.json
```

---

## Provider Stack Order (ClientProviders.tsx)

Order matters. Inner providers can depend on outer ones.

```
Toaster (react-hot-toast)
└── ThemeProvider (next-themes, defaultTheme: "dark")
    └── ServiceWorkerContext (PWA)
        └── AuthSessionProvider (Supabase auth — source of truth)
            └── AgeConsentProvider (age gate cookie)
                └── FavoritesProvider (user favorites)
                    └── CommentsProvider (image comments)
                        └── FiltersProvider (gallery filters, persisted)
                            ├── <div id="modal-root" />  ← must exist before ModalProviderLoader
                            └── ModalProviderLoader (lazy modal system)
                                └── {children}
                                    └── CookieConsentBanner
```

---

## SSR Data Pipeline

```
src/app/page.tsx (server component)
  → fetchPhotographersWithFeaturedSSR()  (Supabase: photographers + images_resize)
  → fetchGalleryImagesSSR()              (Supabase: images_resize, filtered + shuffled)
  → <HomeClient photographers={...} images={...} />

src/app/photographers/[surname]/page.tsx (server)
  → fetchPhotographerByIdSSR(surname)    (Supabase: photographers + their images)
  → renders photographer page with Person JSON-LD
```

---

## Image Delivery Pipeline

```
Supabase: images_resize.base_url + images_resize.filename
  → imageResizingS3.ts:
      getBestS3FolderForWidth(image, renderedWidth)  → single best URL
      getAllS3Urls(image)                             → all size URLs for progressive loading
      getProgressiveZoomSrc(s3Progressive, zoom, width) → zoom-aware URL
  → ImageWrapper.tsx (chooses rendition, emits JSON-LD)
  → next/image (lazy loading, WebP, responsive srcset)
  → CDN: cdn.mosaic.photography
```

---

## Auth Architecture

```
Middleware (Edge):
  - Sets x-theme header from cookie
  - Sets skip_age_modal cookie for bots (AI crawlers included)
  - Lightweight auth cookie check only
  - Does NOT block pages (client guards handle that)

Client:
  - AuthSessionContext: Supabase onAuthStateChange listener
  - useAuth(): exposes { user, session, loading }
  - ProtectedRoute: client guard wrapping protected pages
  - auth-guards.ts: PROTECTED_ROUTES, AUTH_ROUTES, PUBLIC_ROUTES

Server:
  - supabaseServerClient.ts for server components that need auth
```

---

## Modal System

```
modalRegistry.ts: { key: () => import(modalBody) }  ← lazy loaded
ModalProvider.tsx: manages open/close state, renders ModalShell
useModal.ts: { open(key, props), close(), openAsync(key, props) }

Usage:
  const { open } = useModal();
  open('comments', { imageId, onClose, onLoginRequired });

Adding a modal:
  1. Create src/components/modals/{name}/{Name}ModalBody.tsx
  2. Add ModalKey to modalRegistry.ts
  3. Add props type to ModalPropsMap in modalRegistry.ts
  4. Register loader in modalRegistry object
```

---

## SEO Architecture

Every public page should have:
1. `export const metadata: Metadata` (or `generateMetadata` for dynamic)
2. JSON-LD schema via `<JsonLdSchema>` or inline `<script type="application/ld+json">`

Schemas in use: `WebSite` · `Organization` · `Person` · `ImageGallery` · `ImageObject` · `BreadcrumbList` · `FAQPage`

Sitemaps generated at build time via `postbuild` scripts from Supabase data.

---

## Middleware Bot Detection

The following bot user-agents receive a `skip_age_modal=1` cookie, bypassing the age gate:
`bot|crawl|slurp|spider|google|bing|yandex|duckduck|perplexitybot|anthropic|claude|gptbot|oai-searchbot|chatgpt|cohere|amazonbot|applebot|...`

This enables AI search engines to index all content without the age modal blocking page content.
