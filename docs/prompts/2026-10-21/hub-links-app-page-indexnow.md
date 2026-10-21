# Prompt for openCode: links to /photographers, platforms on /app, IndexNow URL list

Repo: Mosaic Photography (Next.js 15 App Router, React 19, TypeScript). Read `CLAUDE.md` first
and follow its 10 rules. Do NOT run any git write commands. Carles commits. Do only the three
changes below. Do NOT run `yarn build` (postbuild regenerates sitemaps and pings IndexNow).

Context (2026-10-21): a new hub page `/photographers` shipped today, but visitors can only
reach it from the bottom of each photographer page. Perplexity told users the app is "designed for
iPad, so iPhone availability may be limited" (wrong: it runs on iPhone and iPad), and the web
`/app` page never says "iPhone", "iPad" or "Android". `scripts/indexnow.ts` (runs in postbuild on
Amplify) sends wrong URLs.

## Change 1: links to the hub

1. `src/components/footer/Footer.tsx`: in the `<p>` with Privacy Policy / Terms of Service /
   Thank you / FAQs / About, add `Photographers` → `/photographers` as the FIRST link, followed by
   the same `{" "}|{" "}` separator. Use the same `<a href=... className="fancy-link">`
   pattern as its neighbours. Reason: the footer is on every page (rendered by the global
   layout, rule 9).
2. `src/components/wrappers/HomeClientWrapper.tsx`: directly after `<PhotographersCardsSlide ... />`
   (~line 87–90, inside `<div className={styles.content} id="our-photographers">`), add
   `<p className={styles.sectionIntro}><Link href="/photographers">See all photographers →</Link></p>`
   with `import Link from "next/link";`. Reuse the existing `sectionIntro` class; no new CSS.

## Change 2: say the platforms on `/app`

1. `src/components/appLanding/AppHero.tsx`: directly after the existing `<p className={styles.lead}>`
   ("Explore world-class, rare, high-res public domain images…"), add
   `<p className={styles.lead}>Free for iPhone, iPad and Android.</p>`.
2. `src/app/app/page.tsx`:
   - In `metadata.description` and `metadata.openGraph.description`, change only the ending
     `Free on iOS & Android.` → `Free on iPhone, iPad & Android.` Do not touch the titles.
   - In the `WebPage` `JsonLdSchema`, change `description="Mosaic app landing page"` to
     `description="Free Mosaic app for iPhone, iPad and Android: public-domain vintage photography from the 1840s to the 1930s."`
   - Add ONE inline JSON-LD block (`<script type="application/ld+json">` with `serializeJsonLd`
     from `@/helpers/jsonLd`, same pattern as `src/app/photographers/[surname]/page.tsx`):
     ```json
     {
       "@context": "https://schema.org",
       "@type": "MobileApplication",
       "name": "Mosaic — Vintage Photography",
       "operatingSystem": "iOS, iPadOS, Android",
       "applicationCategory": "MultimediaApplication",
       "url": "https://www.mosaic.photography/app",
       "downloadUrl": [APP_STORE_URL, PLAY_STORE_URL],
       "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
     }
     ```
     Import `APP_STORE_URL` and `PLAY_STORE_URL` from `@/lib/appLinks` (do not hardcode the URLs).
     Do NOT add `aggregateRating` or `review`. We have no real values to put there.

## Change 3: `scripts/indexnow.ts` URL list

1. Photographers: select `slug` instead of `surname`, skip rows where `slug` is null/empty, and
   build `${SITE_URL}/photographers/${slug}`. Reason: `surname` produced the old accented
   `de-la-vaudère` URL (the site 301s it to `de-la-vaudere`); `scripts/generate-sitemap-0.ts`
   already uses `slug`.
2. Toolkit: add `.eq("is_active", true)` to the `affiliate_advertisers` query. Reason: inactive
   partners (amazon, poster-master, big-wall-decor, fine-art-america) return 404 and are not in
   the sitemap.
3. `STATIC_URLS`: add `${SITE_URL}/photographers` and `${SITE_URL}/app`.

## Out of scope (do not do)

- Titles and H1s of `/` and `/app`; anything else in `src/app/page.tsx`.
- Menu / bottom nav (`ClientLayout`, `BottomNav`), header.
- Any Supabase write, S3, `public/llms.txt`, new dependencies.
- The IndexNow key handling, the `NODE_ENV` guard, the endpoint.

## Check before you report back

1. `yarn lint` and `npx tsc --noEmit`: both clean.
2. `yarn dev` (restart it after edits: file watching does not work on the WSL /mnt/c mount), then curl:
   - `/` → server HTML contains `href="/photographers"` at least twice (footer + "See all photographers →").
   - `/app` → contains `Free for iPhone, iPad and Android.`; meta description ends with
     `Free on iPhone, iPad &amp; Android.`; one `MobileApplication` JSON-LD block that parses as JSON
     and whose `downloadUrl` has the 2 store URLs.
   - `/photographers/brady` → footer link present.
3. `scripts/indexnow.ts`: do not run it against the live API. Show the final `urls` array logic
   in your report, and confirm there is no `surname` left in it.
4. Report the files changed and anything you could not verify.
