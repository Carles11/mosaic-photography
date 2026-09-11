# Handover — Mosaic Photography affiliate partners update

---

I'm Carles, solo developer of **Mosaic Photography** (https://www.mosaic.photography, repo `mosaic-photography`, Next.js 15 App Router · React 19 · TypeScript · Supabase · AWS Amplify · CDN on `cdn.mosaic.photography`). Read `CLAUDE.md` first, then `docs/TASKS.md` (Task 2 is the affiliate task). Zero marketing budget; SEO is the whole distribution, so nothing we do here may look like thin-affiliate content to Google.

You are continuing work that a previous conversation left mid-way. Everything below is the state as of 11 Sep 2026. Do not redo the analysis; pick up at "Where to start".

## Context you must know

**Why we're careful.** The site lost ~80% of Google impressions on 26 Jun 2026 (June 2026 spam update). We fixed the causes that day: the site is now server-rendered (was CSR-only), one H1, hero as a real `<img>`, no UA-based crawler branches (the middleware bot regex is gone), homepage affiliate links cut from 88 to 12. Full reports: `seo-reports/11-09-2026/MOSAIC-SEO-DROP-ANALYSIS-2026-09-11.md` and `MOSAIC-SEO-FIXES-2026-09-11_report.md`. Rule that follows from it: every affiliate link on the site must be something a reader of a photographer page plausibly wants — books, prints, photo software. Nothing off-topic, nothing adult-adjacent.

**Affiliate data model** (`src/types/supabase.ts`, `docs/data-model.md`):
`affiliate_advertisers` (name, slug → `/toolkit/[slug]`, platform, template `default|software|print|marketplace`, editorial_note jsonb, logo/banner/promo fields, **is_active** – new) and `affiliate_products` (advertiser_id, type `book|print|tool|framing`, title/description jsonb `{en}`, affiliate_url, image_url, **photographer_author** → `photographers.author` puts the product on that photographer's page, featured, sort_order, **is_active** – new). Fetchers: `src/utils/fetchAffiliateDataSSR.ts` (`getGeneralAffiliateResources` → homepage `ResourcesSlider` limit 12, `getAffiliateProductsByAuthor` → `/photographers/[surname]`, `getToolkitDataBySlug` → `/toolkit/[slug]`). Templates in `src/components/toolkit/templates/`. Cards use `rel="sponsored noopener noreferrer"`.

**Current partners (Supabase export in `affiliate-reports/supabase/`):** Amazon (25 products — all the per-photographer books; account TERMINATED, links no longer pay), Fine Art America (18 prints, plain links, no tracking), White Wall (7, Awin), Retouch4me (6, Awin), Big Wall Décor (3, Awin), Poster Master (3, Awin).

**Awin programmes joined** (`affiliate-reports/joined_advertiser-directory.csv`): TASCHEN US 28585 / UK 28575 / DE 28577 / FR 28579 / ES 28581 / IT 28583, retouch4me, WhiteWall DE, Big Wall Decor US, Poster Master US, Nexbie, Enjox Toys. `affiliate-reports/advertiser-directory.csv` is 30 _invitations_, not joined — all declined/ignored.

**Decisions taken (final, don't reopen):**

- Add **TASCHEN** as the core partner: books per photographer.
- Keep Retouch4me, WhiteWall, Fine Art America as they are.
- Hide (not delete) Amazon, Big Wall Décor, Poster Master via `is_active = false`.
- Never link Enjox (Awin sector "Erotic"); ignore Nexbie and the 30 invitations (only Leica was on-topic; 1-day cookie, EPC 0, not worth it).
- End state: three purposes — books (TASCHEN), prints (WhiteWall, FAA), software (Retouch4me).

**GSC countries, last 3 months** (`affiliate-reports/countries_mosaic.photography-Performance-on-Search-2026-09-11/Countries.csv`): US 167 clicks, UK 25, Canada 20, France 17, Germany 13, Netherlands 11, Australia 7, Italy 4, Spain 4. So the TASCHEN router's default of US is right; NL and AU/NZ currently fall to US (open question below).

## Code already written and committed to the working tree (NOT yet run, NOT yet git-committed)

- `migrations/007_affiliate_is_active.sql` — adds `is_active` to both tables, hides amazon / poster-master / big-wall-decor, inserts the TASCHEN advertiser row (slug `taschen`, platform Awin, template `default`).
- `src/types/supabase.ts` — `is_active?: boolean` on both types.
- `src/utils/fetchAffiliateDataSSR.ts` — all three fetchers filter `is_active` on product and advertiser (`affiliate_advertisers!inner`).
- `src/app/toolkit/[slug]/page.tsx` — `generateStaticParams` only for active advertisers; hidden slugs 404 because the fetcher returns null.
- `scripts/generate-sitemap-0.ts` — toolkit pages of active advertisers added to `sitemap-0.xml`.
- `src/app/api/go/taschen/route.ts` — country router: `/api/go/taschen?u=<taschen.com URL>&ref=<tag>` → 302 to `https://www.awin1.com/cread.php?awinmid=<programme>&awinaffid=$AWIN_PUBLISHER_ID&clickref=<ref>&ued=<url>`. Country from `cloudfront-viewer-country` / `x-vercel-ip-country`, else Accept-Language, else US. Refuses non-taschen.com hosts. Needs env **`AWIN_PUBLISHER_ID`** (not set yet).
- `src/components/toolkit/components/ShopLink.tsx` — rel hardened.
- Plan with the full step list and the product-row template: `affiliate-reports/AFFILIATE-PARTNERS-PLAN-2026-09-11.md`.

## Where to start (none of these are done yet)

1. **Run the migration** in Supabase → SQL editor (`migrations/007_affiliate_is_active.sql`), then its check query. Expected: Amazon, Poster Master, Big Wall Décor `false`; TASCHEN row present.
2. **`AWIN_PUBLISHER_ID`** in `.env.local` and Amplify environment variables (Awin account menu → Publisher ID; it's the `awinaffid=` number in any existing tidd.ly/awin link).
3. **Local check** (`yarn dev`): `/toolkit/amazon` → 404, `/toolkit/taschen` → 200, `curl -H "Accept-Language: de-DE" "http://localhost:3000/api/go/taschen?u=https://www.taschen.com/"` → 302 to awin1.com with `awinmid=28577`, homepage HTML contains no `amzn.to`.
4. **Ship**: `npx tsc --noEmit && yarn lint && yarn build` (3 lint warnings are the known baseline, 0 errors; jest passes with 1 todo), commit, push, Amplify.
5. **TASCHEN products**: rows in `affiliate_products`, `affiliate_url` = router link, `photographer_author` exact. Candidate titles to verify on taschen.com (existence + stock): Edward Weston monograph; Stieglitz _Camera Work_; _1000 Nudes_ (Uwe Scheid collection — covers Durieu, Moulin, von Plüschow, von Gloeden; general, featured); _The Male Nude_ (von Gloeden, von Plüschow, Holland Day); one history-of-photography title. Photographers in the DB: Von Gloeden, Demachy, Von Plueschow, de La Vaudère, Clarence Hudson White, Anne Brigman, Eugene Durieu, Alfred Stieglitz, Fred Holland Day, Edward Weston, Felix Jacques Moulin, Mario von Bucovich (use the exact `photographers.author` strings from the products export).
6. **Verify tracking** in Awin → Reports → Clicks after clicking a book on production.
7. Tick the sitemap item in `docs/TASKS.md` Task 2; add the TASCHEN row to the "Open decisions" answer.

## Open questions to settle with me early

- Fine Art America: am I in an FAA/Pixels referral programme, or are those plain links? (If plain, they stay as relevant links; nothing to track.)
- Router mapping for Netherlands and Australia/NZ (currently → US). Options: NL → DE, AU/NZ → GB.
- Which template for TASCHEN (`default` now; `marketplace` or `print` may present books better — look at the four templates before choosing).
- Cover images: upload to the CDN under `advertisers/product_images/taschen/` like the retouch4me ones, or use TASCHEN's own image URLs (check Awin/TASCHEN terms).

## How we work

- You may edit files directly in the repo (Claude desktop bridge; `device_bash` is broken on this machine, use stage/commit file tools). Plan first, implement after I say go; state every decision you take on your own.
- I run the commands and paste output; you draft commit messages. End commit messages with:
  `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and
  `Claude-Session: <the current session URL>`.
- Write a short report of what changed into `affiliate-reports/` when the work is done, like the SEO reports in `seo-reports/11-09-2026/`.
- Path aliases `@/*`; never construct CDN URLs by hand (`src/utils/imageResizingS3.ts`); don't add image preloading; modals via the registry; SSR data via `src/utils/*SSR.ts`.
