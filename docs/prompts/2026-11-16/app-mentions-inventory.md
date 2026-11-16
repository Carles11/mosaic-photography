# Prompt for openCode: inventory of mobile-app mentions on the web (READ-ONLY)

Repo: mosaic-photography (Next.js 15 App Router). Read `CLAUDE.md` first.

**This task is read-only for all code.** Do not change, create or delete any file except
the one report file named under "Output". Do not commit. Do not run `git` write commands.

## Background (why)

The Apple Developer membership behind the iOS app "Iconic Photography by Mosaic" is not
being renewed (decision 2026-11-16). Apple removes the app from the App Store when the
membership lapses. The Android app stays on Google Play. Before anything is changed,
Carles needs a complete list of every place where the website mentions or links to the
mobile apps, so he can decide what to remove or reword. Public claims (HTML, metadata,
JSON-LD, llms.txt) must not say "iPhone / iPad / App Store" once the iOS app is gone.

## What to search

Search the whole repo except `node_modules/`, `.next/`, `.git/`, `docs/`, `seo-reports/`,
`affiliate-reports/`. Case-insensitive, for each of these terms:

`app store`, `apps.apple.com`, `itunes`, `iphone`, `ipad`, `ios`, `ipados`, `apple`,
`play.google.com`, `google play`, `android`, `MobileApplication`, `apple-itunes-app`,
`apple-app-site-association`, `assetlinks`, `appLinks`, `AppBanner`, `AppHero`,
`Iconic Photography`, `/app` (as an internal link or route), `ACN2RLHS2A`.

Ignore matches that are clearly unrelated (for example `ios` inside another word,
`apple-touch-icon`, CSS `-apple-system`, the word "application" alone).

Known starting points (not a complete list, verify each and find the rest):
`src/lib/appLinks.ts`, `src/app/app/page.tsx`, `src/app/layout.tsx`,
`src/app/legal/privacy-policy/page.tsx`, `src/components/appBanner/FooterAppBanner.tsx`,
`src/components/appBanner/HomeAppBanner.tsx`, `src/components/appLanding/AppHero.tsx`,
`public/llms.txt`, `public/.well-known/`, `public/site.webmanifest`, `next.config.ts`,
`scripts/generate-sitemap-0.ts`, `scripts/indexnow.ts`, `src/app/api/indexnow/route.ts`.

Also follow imports: for every component or constant found, list every file that imports it.

## Output

Write ONE file: `docs/research/2026-11-16-app-mentions-inventory.md` with:

1. A table, one row per mention:
   `| File:line | Platform (iOS / Android / both) | Kind | Exact text or URL | Rendered where |`
   - Kind is one of: visible text, link/button, metadata (title/description/OG/Twitter),
     JSON-LD, meta tag, config/redirect/header, static file (llms.txt, .well-known, manifest),
     sitemap/IndexNow list, test.
   - "Rendered where" = which routes show it (for example "every page (footer)", "`/app` only").
2. A short section "Single source of truth?": does every store URL come from
   `src/lib/appLinks.ts`, or are URLs hardcoded elsewhere? List the hardcoded ones.
3. A short section "Things that break if the iOS app is gone": for example Smart App Banner
   meta tag, universal links (`apple-app-site-association`), JSON-LD `operatingSystem` or
   `downloadUrl` values, text that says "iPhone, iPad and Android".
4. A count: total mentions, iOS-only, Android-only, both.

Do not propose code. Do not edit anything else. Facts only, with file and line.

## Out of scope

- Any change to source files, metadata, JSON-LD, llms.txt, sitemap or `.well-known`.
- The mobile repo (`C:\mosaicapp`).
- App Store Connect, Play Console, listings on other sites.
- Removing the `/app` page or its sitemap entry.

## When done

Reply with: the path of the report, the four counts, and anything you could not check.
