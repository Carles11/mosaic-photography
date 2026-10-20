# TASKS — Mosaic Photography (web)

> Working task list for the Next.js web app. Read `CLAUDE.md` first, then the
> feature doc named in each task.
>
> **Scope:** these tasks are written against the **web** project. Once a task is
> done here, the same change is ported to the mobile app project — see
> "Porting to mobile" at the bottom.
>
> Status legend: `[ ]` todo · `[~]` in progress · `[x]` done
> Last reviewed: 2026-10-20

---

## Task 1 — Add more photographers to the collection

`[ ]` **Goal:** grow the public-domain collection beyond the current **14 photographers / ~1010 indexed images**.

**Current roster** (from `public/sitemap-0.xml`): brady, brigman, cameron,
de-la-vaudère, demachy, durieu, holland-day, hudson-white, moulin, stieglitz,
von-bucovich, von-gloeden, von-plueschow, weston.
All 14 also have timeline data in `src/lib/timeline/photographersTimelines.ts`.

### Where the data lives

| Piece | Location |
|---|---|
| Photographer rows | Supabase `photographers` (`id, name, surname, author, biography(_md), intro(_md), birthdate, deceasedate, origin, slug, website, instagram`) |
| Image rows | Supabase `images_resize` (`base_url, filename, author, title, description, orientation, width, height, color, nudity, gender, year, print_quality`) |
| Files | S3/CDN `.../public-domain-collection/{author}/{originals,originalsWEBP,w400,w600,w800,w1200,w1600}/` |
| Page | `src/app/photographers/[surname]/page.tsx` |
| Fetchers | `src/utils/fetchPhotographerByIdSSR.ts`, `fetchPhotographersBasic.ts`, `fetchPhotographersWithFeaturedSSR.ts` |
| Timeline | `src/lib/timeline/photographersTimelines.ts` |

### Steps per photographer

1. Pick a public-domain photographer (CC PDM 1.0 / clearly PD source) and gather originals.
2. Insert the row in `photographers`. `author` **must** match the S3 folder name and the image filename prefix.
3. Upload originals to `{author}/originals/` on S3.
4. Run, in order:
   - `scripts/adding-new-photographers/1-convert-originals-to-webp.mjs`
   - `scripts/adding-new-photographers/2-generate-responsive-sizes.mjs`
   - `scripts/adding-new-photographers/3-generate-supabase-csv.py`
5. Import the generated CSV into `images_resize`.
6. Add a portrait as `000_aaa_{author}.webp` (filtered out of the gallery, used on cards).
7. Optionally add timeline entries to `photographersTimelines.ts`.
8. `yarn build` → `postbuild` regenerates `sitemap-0`, `image-sitemap`, the `sitemap.xml` index and pings IndexNow.

### Naming rules (do not improvise)

```
{author}_{title}_{year}-xxx_{orientation}_{color}[_{nudity}].jpg → .webp
```

- Filenames must be **ASCII, lowercase, no spaces**. Two existing files break this
  (`..._not- nude.webp` with a space, `...die-tochter-des-gärtners...` with `ä`) and
  are currently broken in the image sitemap — see Task 3.
- Never build CDN URLs by hand; use `src/utils/imageResizingS3.ts`.

### Acceptance criteria

- [ ] Photographer page renders at `/photographers/{surname}` with intro, biography, timeline, gallery
- [ ] `Person` JSON-LD present; `generateMetadata` returns title/description/canonical/OG
- [ ] `/photographers/{surname}.md` returns the Markdown biography (rewrite in `next.config.ts`)
- [ ] All renditions w400→w1600 exist on the CDN (no gaps — run `scripts/restore-missing-large-renditions.mjs` to check)
- [ ] New URLs appear in `sitemap-0.xml` and images in `image-sitemap.xml` after build
- [ ] Homepage carousel and photographers grid show the new entry

### Open decisions

- [ ] Target number for this round (e.g. +5 photographers)?
- [x] Slug policy for non-ASCII surnames — `de-la-vaudère` is currently a raw
      non-ASCII URL. Decide: transliterate to `de-la-vaudere` + 301, or keep and
      percent-encode everywhere. **Blocks Task 3.**
      **Decided 2026-10-01: ASCII only** (Carles). Finding: the DB `slug` is
      already `de-la-vaudere` and the site links to it; only
      `scripts/generate-sitemap-0.ts` built the URL from `surname` instead of
      `slug`. Fix + 301 for the accented URL:
      `docs/prompts/2026-10-01/photographer-slug-ascii.md`. Follow-up (not
      scheduled): `PhotographersViewCard.tsx` links via `slugify(surname)`
      instead of the DB `slug`; works for the current 14, fragile for new names.

---

## Task 2 — Add more affiliate partners to the list

`[x]` **Goal:** expand the affiliate/toolkit catalogue and make the toolkit pages actually indexable.

**Shipped 2026-09-11** and verified in production. Write-up:
`affiliate-reports/AFFILIATE-PARTNERS-REPORT-2026-09-11.md` (decisions in
`AFFILIATE-PARTNERS-PLAN-...`, the run itself in `AFFILIATE-RUNBOOK-...`).

TASCHEN added across six Awin programmes behind `/api/go/taschen`; Amazon,
Poster Master and Big Wall Décor hidden via `is_active`; migrations 007-010.
Also fixed while in here: ~24 undisclosed links to the terminated Amazon
account on the homepage photographer cards (from the legacy
`photographers.store` column, never counted in the June cut from 88 to 12),
affiliate URLs leaking into Person `sameAs` structured data, an untracked
toolkit hero CTA, and `AWIN_PUBLISHER_ID` not reaching the SSR runtime on
Amplify.

**Remaining follow-ups are listed at the end of the report** — the big one is
Fine Art America on Awin 88153, where 18 existing links earn nothing because
that programme is still Pending Approval (applied; see Carried forward).

### Where the data lives

| Piece | Location |
|---|---|
| Advertisers | Supabase `affiliate_advertisers` (`name, slug, platform, logo_url, description, website_url, header_url, banner_image_url, promo_url, banner_link_url, promo_code, promo_code_url, editorial_note jsonb, template`) |
| Products | Supabase `affiliate_products` (`advertiser_id, type, title jsonb, description jsonb, affiliate_url, image_url, photographer_author, featured, sort_order`) |
| Types | `src/types/supabase.ts` |
| Fetchers | `src/utils/fetchAffiliateDataSSR.ts` — `getGeneralAffiliateResources`, `getAffiliateProductsByAuthor`, `getToolkitDataBySlug` |
| Page | `src/app/toolkit/[slug]/page.tsx` (+ `loading.tsx`, `not-found.tsx`) |
| Templates | `src/components/toolkit/templates/Template{Default,Software,Print,Marketplace}.tsx`, chosen by `advertiser.template` via `TEMPLATE_MAP` |
| Surfaces | Homepage `ResourcesSlider` (via `src/app/page.tsx` → `HomeClientWrapper`), photographer pages (via `getAffiliateProductsByAuthor`) |
| Legacy migration | `scripts/migrations/migrate-affiliate-links.ts` (moved `photographers.store` → affiliate tables) |

### Steps per partner

1. Insert the `affiliate_advertisers` row. `slug` becomes `/toolkit/{slug}`.
2. Set `template` to one of `software` / `print` / `marketplace`, or leave null for `TemplateDefault`.
3. Fill `editorial_note` as `{ "en": "..." }` — it is jsonb for future localization, not a plain string.
4. Insert `affiliate_products` rows; set `photographer_author` when a product belongs to one photographer (that is what puts it on the photographer page), leave null for general resources.
5. Use `featured` + `sort_order` to control placement in the templates.
6. Verify the disclosure badge renders (`ToolkitAffiliateBadge.tsx`) and that
   `src/app/legal/terms-of-service/page.tsx` still describes the programs accurately.

### Known gaps to fix as part of this task

- [x] **`/toolkit/[slug]` pages are not in any sitemap.** Fixed 2026-09-11:
      `scripts/generate-sitemap-0.ts` now queries `affiliate_advertisers` and emits a
      URL per *active* advertiser.
- [ ] Toolkit pages emit `CollectionPage` JSON-LD with **hardcoded `width: 800, height: 600`**
      for every product image (`src/app/toolkit/[slug]/page.tsx`). Use real dimensions, or
      consider `ItemList`/`Product` instead — the current markup asserts sizes that are wrong.
      2026-10-03 finding: not a live defect. The `CollectionPage` branch of
      `JsonLdSchema.tsx` only emits each item's `name`; width/height/encodingFormat
      are passed but never rendered. Dead props only, low priority.
- [x] Outbound affiliate links use `rel="sponsored"` alone in 12 places (toolkit card,
      `ShopLink`, all four templates, `ToolkitHero`). Add `noopener noreferrer` — only
      `PhotographerLinks.tsx` does it correctly today.
      Done 2026-09-11 in `ShopLink.tsx`, `TemplateDefault.tsx`, `ToolkitHero.tsx`
      and `inputs/dropDown` (which had never read `DropdownItem.affiliate` at all,
      the reason the homepage Amazon links were undisclosed).
      `TemplateSoftware/Print/Marketplace` done 2026-10-01 (openCode,
      `docs/prompts/2026-10-01/seo-hygiene-batch-1.md`).
- [x] Duplicate file to delete: `src/components/toolkit/ToolkitAffiliateBadge (1).tsx`. Deleted 2026-10-01.
- [x] `getGeneralAffiliateResources` has the `.is("photographer_author", null)` filter
      commented out, so photographer-specific products also appear in the homepage
      slider. **Decided 2026-09-11: filter back on.** The slider is a general
      resources shelf; per-photographer products belong on the photographer page.
      It also stops one partner with many per-photographer rows from crowding the
      12 slots, which matters after the June spam update.

### Acceptance criteria

- [ ] `/toolkit/{slug}` renders with the right template and 404s cleanly for unknown slugs
- [ ] New partner appears in the homepage `ResourcesSlider`
- [ ] Photographer-linked products appear on the matching `/photographers/{surname}` page
- [ ] Toolkit URLs present in `sitemap-0.xml` after build
- [ ] Affiliate disclosure visible on every surface that shows a paid link

### Open decisions

- [x] Which partners/networks to add (Awin? Amazon? print-on-demand? software)?
      **Answered 2026-09-11.** Three purposes, three partners: books **TASCHEN**
      (Awin, six regional programmes behind `/api/go/taschen`), prints **WhiteWall**
      (Awin) and **Fine Art America**, software **Retouch4me** (Awin). Amazon
      (terminated), Poster Master and Big Wall Décor hidden via `is_active = false`.
      Enjox Toys never linked — an adult-products link would reclassify the site.
      Nexbie and the 30 Awin invitations declined.
      Follow-up: Fine Art America turns out to be on Awin (advertiser **88153**,
      30-day cookie) and our 18 FAA links are untracked — apply, then rewrite them.
      No TASCHEN edition exists for Edward Weston, Anne Brigman, Robert Demachy or
      Julia Margaret Cameron; those pages stay prints-only.
- [ ] Do we want a `/toolkit` index page? Today there are only `[slug]` pages, so
      the section has no hub and no internal linking entry point.

### Carried forward from the 2026-09-11 ship

- [x] **Fine Art America on Awin 88153.** Applied, still Pending Approval
      (not rejected). The 18 FAA links earn nothing and FAA is hardcoded out
      of the homepage shelf. Approval turns into revenue with one SQL update.
      Largest item outstanding.
      2026-10-03: chased by email 11 Sep and via the Awin contact form 3 Oct.
      Decision (Carles): if there's no answer by **2026-10-17**, retire FAA from
      the live affiliate products (`is_active = false` on the advertiser and its
      18 products, never delete; RUNBOOKS routine 3 "Retire a partner").
      Mobile reads the same tables, so the retirement covers it too.
      **Retired 2026-10-19** (Carles). Awin dashboard still "Pending", no
      reply by email (only an FAA support auto-reply from Dec 2025). Supabase:
      advertiser `fine-art-america` (`b8998170-…`) + its 18 products set
      `is_active = false`, no rows deleted; verified `adv_active=false`,
      `products_active=0`. Mobile: effective immediately (same tables).
      Web: `/toolkit/fine-art-america` and its `sitemap-0` entry drop out on
      the next Amplify build (prerender + sitemap are build-time). After that
      deploy: check `/toolkit/fine-art-america` → 404 and absent from
      `sitemap-0.xml`. **Verified live 2026-10-19:** 404, 0 matches in
      sitemap-0. To revert if Awin approves later: same two updates with
      `true`, then rewrite the 18 links to Awin tracking links.
      Follow-up (not scheduled): the hardcoded "fine art america" exclusion in
      `src/components/sliders/ResourcesSlider.tsx` is now dead code.
- [x] **Soft 404 on `/toolkit/amazon`, `/toolkit/poster-master`,
      `/toolkit/big-wall-decor`.** `dynamicParams = false` is set and only the
      four active slugs are prerendered, but the middleware matcher makes the
      route dynamic, so `notFound()` fires after the 200 header is sent. Three
      previously-indexed URLs answer 200 with not-found content.
      2026-10-01: real cause was `toolkit/[slug]/loading.tsx` (streaming sends
      the 200 first); deleted. Local `yarn start`: all three + unknown slug → 404,
      `/toolkit/taschen` → 200. Verified on production 2026-10-01 (`56ddd34`):
      amazon / poster-master / big-wall-decor / unknown slug → 404, taschen → 200.
- [x] **Duplicate anchors in `toolkitCard.tsx`** — image and "Shop now" both
      link to the same URL, so the homepage shows 30 sponsored anchors for 18
      products.
      2026-10-03 (openCode, `docs/prompts/2026-10-03/toolkit-card-single-link.md`):
      image no longer a link, one sponsored anchor per card; GTM event
      `toolkitCardClicked` removed (clicks now only `toolkitShopNowClicked`);
      `"<name> affiliate"` dropped from toolkit `keywords`. lint + tsc clean.
      Shipped `c505bf7`, verified live 2026-10-03: server HTML of `/` has
      18 sponsored anchors (12 "Shop Now" + 6 photographer-card dropdown links),
      down from 30; no image inside a sponsored link; `/toolkit/taschen`
      keywords no longer contain "affiliate".
      New finding (not scheduled): after hydration the live DOM holds **two**
      `.home_container` blocks (each with `home_pageContent`, `aria-hidden`),
      so the browser shows 24 cards / 36 sponsored anchors. SSR has one.
      Find out why `HomeClientWrapper` content mounts twice on the client.
- [ ] **Drop `photographers.store`.** Dead in code, still populated.
- [ ] Ask the TASCHEN programme manager which programme is credited for NL, PT
      and AU orders, and what the commission rate is (not published).

---

## Task 3 — Recover from the 26 June 2026 traffic drop

`[~]` **Goal:** reverse the Google Web-search drop of 2026-06-26 (−83% impressions,
June 2026 spam update) and track recovery after the 2026-09-11 fixes.

> **Reframed 2026-10-01.** This task was opened as a "mid/late August" drop with
> the 12–13 Aug sitemap rewrite as prime suspect. GSC data (see **Findings**
> below) shows no August step change in Web, and Image search was never a real
> channel, so that hypothesis is ruled out. The section below is kept as the
> record of it; its defect list still stands, as hygiene, not as the cause.
> Cause write-up: `seo-reports/11-09-2026/MOSAIC-SEO-DROP-ANALYSIS-2026-09-11.md`.

### Former prime suspect: the 12–13 August sitemap rewrite (ruled out 2026-10-01)

Three commits landed on 12–13 August, immediately before the drop window:

| Commit | Date | What it did |
|---|---|---|
| `bb65846` | 2026-08-12 | sitemap generator rewrite, 301 redirects, page sitemap fix, restore script |
| `40f8ed3` | 2026-08-12 | w1600 restore for indexing; percent-encoding of image `<loc>` |
| `e6ffe07` | 2026-08-13 | further sitemap / image-sitemap fixes |

**`bb65846` replaced 990 of the 1010 `<image:loc>` entries.** Before that commit
`generate-image-sitemap.ts` advertised **every** image at `w1600`:

```diff
- const loc = `${image.base_url}/w1600/${filenameWebp}`;
+ const loc = `${image.base_url}/${bestSizeFolder(image.width)}/${filenameWebp}`;
```

The new `bestSizeFolder(image.width)` spreads them across buckets — the sitemap now
lists 573 w1600, 154 w800, 144 w1200, 85 w600, 46 w400 and 8 originalsWEBP. So **437
images changed URL**, i.e. Google is told the previously indexed w1600 URL is no longer
the canonical image for those. `40f8ed3` then wrapped every loc in `encodeURI(...)` with
`+` → `%2B`, changing a further set a second time the same day.

Note this also means those images are now offered to Google Images at **lower resolution**,
which hurts ranking independently of the URL churn.

Google indexes image results by URL. Changing ~all of them in one day, twice,
would drop image-search impressions and clicks with roughly this timing. That is the
leading hypothesis and it is testable in Search Console.

### Concrete defects found in the repo (fix regardless of cause)

- [x] **Sitemap lists images that do not exist.** (2026-10-01: all live image URLs return 200, see Findings.) `restore-missing-large-renditions.mjs`
      failed on 8 renditions ("no originalsWEBP source"), and two of them are still
      listed in `public/image-sitemap.xml`:
      - `holland-day/w1600/holland-day_woman-drapery-halo-staircase-seated_year-1890_vertical_female_bw_not-%20nude.webp` (filename contains a space)
      - `julia-margaret-cameron/w1200/julia-margaret-cameron_die-tochter-des-g%C3%A4rtners-...webp` (non-ASCII filename)
      → verify they 404 on the CDN, then either restore the renditions or drop them from the sitemap.
      Also check the matthew-brady failures (`ruins-of-strasburg`, `napoleon-sarony`) are genuinely absent from the sitemap.
- [x] **Raw non-ASCII page URL in the sitemap:** `https://www.mosaic.photography/photographers/de-la-vaudère`.
      Sitemap `<loc>` values must be URL-escaped. Ties to the slug decision in Task 1.
      Fixed 2026-10-01: `generate-sitemap-0.ts` uses `photographers.slug`; 308 from
      `/photographers/de-la-vaud%C3%A8re` (encoded `source` in `next.config.ts`; the raw
      form does not match). Verified live: sitemap-0 lists `de-la-vaudere`, redirect 308.
- [x] **Contributor slug changed without a redirect:** `/community/photography/elcarles`
      → `/community/photography/elcarles78` in `bb65846`. `next.config.ts` only redirects
      `/contributors` → `/community/photography`. Add a 301 for the old slug.
      2026-10-01: added in `next.config.ts` (permanent → 308); verified on
      production 2026-10-01: 308 → `/community/photography/elcarles78`.
- [x] **Stale sitemap index:** (2026-10-02: live index lastmod = deploy time 2026-10-02T15:44Z; `generate-sitemap-0.ts` regenerates it.) `public/sitemap.xml` `lastmod` is `2026-08-12T22:56:52Z`,
      but `image-sitemap.xml` was changed again on 08-13 (`e6ffe07`). The index does not
      signal the newer sitemap. Make `postbuild` regenerate the index too.
- [ ] **`next-sitemap.config.js` is orphaned.** It sets `generateRobotsTxt: true` and its
      own policies, but `postbuild` runs the three custom `tsx` generators and never
      `next-sitemap`. `public/robots.txt` is hand-maintained. Either wire it back in or
      delete the config so nobody edits the wrong file.
- [x] Sitemaps are **committed to `public/`** and also **regenerated at build**. Confirm
      a deploy cannot ship a stale committed copy.
      Confirmed 2026-10-01: committed `sitemap-0.xml` still had the accented URL, the
      live one after the Amplify build did not, so postbuild output wins.
      Note: postbuild fails locally on Node 20 (Supabase realtime needs native
      WebSocket); Amplify runs Node 22. Ties to the `.nvmrc` drift.

### Other things to rule out

- [ ] Analytics rather than traffic: `AnalyticsLoader.tsx` injects GTM
      (`GTM-N74Q9JC5`) on every page and Clarity (`ttu5c2if1l`) only on consent.
      Confirm the cookie banner / consent behaviour did not change around the drop —
      a consent change looks exactly like a traffic drop in GA4.
- [ ] CSP in `next.config.ts` — confirm no GA/GTM/Clarity host was dropped from
      `script-src` / `connect-src` / `img-src`.
- [ ] Seasonality (mid-August), a Google core update, or a Bing/Discover swing.
- [ ] Check `scripts/indexnow.ts` actually ran on the last deploys (IndexNow key + admin secret present).

### Investigation plan (in order)

1. **GSC — Performance:** compare 4 weeks before vs after 2026-08-12, split by
   **Search type = Image vs Web**. If the loss is concentrated in Image, the sitemap
   rewrite is confirmed as the cause.
2. **GSC — Pages / Indexing:** look for a spike in "Crawled – currently not indexed"
   or "Not found (404)" after 08-12, and check the image sitemap's submitted-vs-indexed count.
3. **GSC — Sitemaps:** confirm all four sitemaps parse, and check the reported
   discovered-URL counts against the repo (25 pages, 1010 images).
4. **GA4:** compare sessions by channel and landing page over the same window; confirm
   the drop shows in Search Console too (if only GA4 dropped → consent/tagging issue).
5. Spot-check 10 image URLs from `image-sitemap.xml` for HTTP 200, including the two suspect ones above.
6. Fix whatever the above proves, resubmit sitemaps, ping IndexNow, and re-check in 2–3 weeks.

### Findings

**2026-10-01 — first re-check after the 2026-09-11 fixes** (source:
`docs/seo-reports/mosaic.photography-Performance-on-Search-2026-09-28/`,
GSC Performance, Search type = **Web only**, data 2026-06-26 → 2026-09-25).

| Window | Days | Clicks/day | Impressions/day |
|---|---|---|---|
| 26 Jun – 23 Jul (right after the cliff) | 28 | 1.6 | 22.6 |
| 14 Aug – 10 Sep (after the 12–13 Aug sitemap rewrite, before the fixes) | 28 | 1.7 | 25.6 |
| 12 – 25 Sep (after the fixes) | 14 | 2.4 | 17.8 |

- **No mid-August step change in Web search.** Impressions/day are flat from
  late June through 10 Sep. The drop is the **26 Jun cliff** (~−83% impressions,
  149 → 25/day, position 5.6 → 23), attributed to the June 2026 spam update in
  `seo-reports/11-09-2026/MOSAIC-SEO-DROP-ANALYSIS-2026-09-11.md`. The
  "mid/late August" framing and the sitemap-rewrite hypothesis above still
  need checking for **Image** search only — this export doesn't contain it.
  Not rewriting the section until the Image split is in.
- **After the fixes:** clicks/day up (~+40%), impressions/day down (~−30%).
  Only 14 days, single-digit daily numbers — not a trend yet, no recovery yet.
- Homepage takes 156 of the clicks; top query "vintage nude photography"
  (43 clicks, 385 impr, pos 6.0). Four `/#section` fragment URLs show
  126 impressions each at pos 8.4 (sitelinks), 0 clicks.
- **Still missing for attribution:** same export with Search type = Image;
  Pages → Indexing export after 09-11; Sitemaps report (submitted vs
  indexed). Next re-check: scheduled task on 2026-10-02.

**2026-10-01 — image sitemap checked live, URL by URL.** All 1000 unique
`<image:loc>` URLs return 200, including the four suspects (space, `ä`, two
Brady files), so the "sitemap lists images that do not exist" defect is
resolved as far as Google sees it. Two new issues: 1010 entries but only 1000
unique (10 images listed twice: 7 von Plueschow, 1 Stieglitz, 1 Brady, the
Holland Day portrait), and `generate-image-sitemap.ts` has the same
surname-instead-of-slug bug as sitemap-0, so the live file still has
`/photographers/de-la-vaudère` with 38 images. Fix prompt:
`docs/prompts/2026-10-01/image-sitemap-slug-dedupe.md`. **Shipped and verified
live 2026-10-01:** image-sitemap lists `/photographers/de-la-vaudere`, 1010 images. Correction (same day): the 10 "duplicates" are the
homepage's 10 featured images, listed once under `/` and once under their
photographer page. That is valid (Google allows one image on several pages),
not a defect. The fix keeps both listings and only dedupes within the
photographer blocks, as a guard. Also noticed: `collection-sitemap.xml` lists
`/profile/collections/<uuid>` URLs; confirm those pages are public and meant
to be indexed.

**2026-10-01 — Image vs Web split, 6 months** (sources:
`docs/seo-reports/…-2026-10-01-IMAGE/`, `…-2026-10-01-WEB-6M/`,
`…Coverage-2026-10-01/`). GSC's Web filter now has sub-options
Text-based / Multimodal; picking Web exports Text-based, and its daily
numbers match the 09-28 Web export exactly (92 overlapping days, 0 diffs).

| Window | Web clicks/day | Web impr/day | Image impr/day |
|---|---|---|---|
| 1 Apr – 11 Jun | 5.6 | 92.9 | 6.2 |
| 12 – 25 Jun (peak) | 11.9 | 136.0 | 3.1 |
| 26 Jun – 23 Jul | 1.6 | 22.6 | 1.8 |
| 15 Jul – 11 Aug | 1.5 | 17.9 | 2.3 |
| 12 Aug – 10 Sep | 1.6 | 25.1 | 1.3 |
| 12 – 30 Sep | 2.4 | 17.9 | 0.8 |

- **The sitemap-rewrite hypothesis is ruled out as a cause of lost traffic.**
  Image search was never a real channel: ~6 impressions/day at best,
  0–2 clicks per week in 6 months. Image impressions did fall further
  after 12 Aug (2.3 → 1.3/day), but from a base too small to matter.
  The defects listed above (missing renditions, unescaped `<loc>`,
  stale index lastmod) are still worth fixing, as hygiene, not recovery.
- **Attribution:** the loss is the Web cliff on 2026-06-26 (136 → 23
  impressions/day, −83%), matching the June 2026 spam update analysis.
  Clicks/day since the 09-11 fixes are 2.4 vs 1.6 before; impressions
  have not recovered.
- **Indexing, 09-03 → 09-20:** indexed 14 → 16, not indexed 33 → 33.
  Crawled–currently not indexed 13 → 10 (validation **Failed**),
  Discovered–currently not indexed 13 → 15 (validation Started),
  noindex 2 → 3, redirect 3, 403 2. Which URLs failed validation is not
  in the export (needs the drilldown table per reason).
- **Sitemaps report (read 21–28 Sep):** all four "Success". Discovered:
  `sitemap.xml` index 54 = `sitemap-0` 29 + `collection-sitemap` 10 +
  `image-sitemap` 15, identical to the `<loc>` counts in `public/`. Index
  last read 09-28, so Google has the post-09-11 sitemaps.

**2026-10-02 — scheduled re-check** (source: `docs/seo-reports/2026-10-02/`,
GSC compare exports Web + Image, Coverage, two drilldown tables; Sitemaps
screenshot). Per day:

| Comparison (Web) | Clicks/day | Impr/day |
|---|---|---|
| 29 May–25 Jun → 26 Jun–23 Jul | 12.5 → 1.6 | 136 → 22.6 |
| 15 Jul–11 Aug → 12 Aug–8 Sep | 1.5 → 1.6 | 17.9 → 26.0 |
| 24 Aug–11 Sep → 12–30 Sep (post-fix, 19 d each) | 1.9 → 2.2 | 24.2 → 16.7 |

- Image impressions 214 → 50 → 37 → 15 across the same windows, 2 clicks total. Confirms 2026-10-01 conclusion.
- Post-fix impression dip is mostly the 4 `/#section` sitelinks disappearing
  (96 → 0); without them 363 → 318 (−12%). Homepage position 32.0 → 21.6,
  CTR 8.2% → 12.9%. "vintage nude photography" 5 → 12 clicks, pos 5.9. Not a recovery yet.
- Coverage data still ends 09-20: indexed 16, not indexed 33 (unchanged).
- Crawled–not indexed (validation Failed, 10): photographers **cameron,
  weston, von-gloeden, hudson-white**, 3 legal pages, 2 CDN fonts,
  `site.webmanifest`. Last crawled May–5 Aug, i.e. never seen post-fix.
- Discovered–not indexed (validation Started, 15, never crawled):
  **demachy**, `toolkit/taschen`, 3 community pages, old `de-la-vaudère`
  URL (now 308), 9 `/profile/collections/<uuid>`.
- Sitemaps: unchanged, all 4 Success, 54 = 29 + 15 + 10; sitemap-0 read 10-01.
- [x] Indexing requested via URL Inspection for cameron, weston,
  von-gloeden, hudson-white, demachy (Carles, 2026-10-02).
- **Decision (Carles, 2026-10-02):** user collections don't need indexing.
  They were already `noindex` (`profile/collections/[id]/layout.tsx`) but
  listed in `collection-sitemap.xml`, a mixed signal. → keep `noindex`
  (switch to `follow`), drop `collection-sitemap` everywhere.
  Prompt: `docs/prompts/2026-10-02/drop-collection-sitemap.md`.
  After deploy: remove `collection-sitemap.xml` in GSC → Sitemaps.
  Porting to mobile: n/a (web sitemap only).
- Note on the "Stale sitemap index" defect: `generate-sitemap-0.ts` (l. 176–180)
  already regenerates `sitemap.xml` at postbuild; only the committed
  `public/` copy is stale. Verify live `lastmod` after the next deploy, then tick it.
- [x] `docs/features/seo.md` sitemap table updated by the prompt above (openCode, 2026-10-02; tsc + lint clean).
- **llms.txt is not live** (Carles, 2026-10-02: /llms.txt → 404). The file sits
  in the repo root, not `public/`, since at least 2026-06-04. Breaks the GEO
  rule in CLAUDE.md. Prompt: `docs/prompts/2026-10-02/serve-llms-txt.md`.
  Done locally 2026-10-02 (openCode): `git mv` to `public/llms.txt`, dev
  server returns 200 text/plain; middleware can't gate it (`.` early return).
  Content fixed: `/community` → `/community/photography` (+ `[slug]` path),
  Käsebier removed (no page), 7 missing photographers added (list = the 14
  in sitemap-0). Deployed 2026-10-02 (`fe998d7` failed build: commit missed
  package.json; fixed by `9c34433`, green). Live: /llms.txt 200 but shown as
  mojibake (no charset from Amplify). Fix prompt:
  `docs/prompts/2026-10-02/llms-txt-charset.md` (openCode 2026-10-02: header
  added in `next.config.ts`, dev returns `charset=utf-8`). [x] Live "—" renders
  (2026-10-02). The `next.config.ts` header has **no effect on Amplify**: files in
  `public/` are served by CloudFront and never reach Next, so live was still
  `text/plain`. Fixed in Amplify console → Hosting → Custom headers and cache
  (pattern `/llms.txt`, `Content-Type: text/plain; charset=utf-8`, kept the two
  `.well-known` JSON entries) + redeploy. Verified: llms.txt `charset=utf-8`,
  assetlinks.json still `application/json`. Rule: headers for `public/` files go
  in the Amplify console (no `customHttp.yml` in the repo), not `next.config.ts`.
  Live sitemap.xml lists only sitemap-0 + image-sitemap. GSC:
  `collection-sitemap.xml` removed (Carles, 2026-10-02).
  Open (low): prose names "Jean-Louis-Marie-Eugène Durieu" / "Clarence
  White" vs slugs `eugene-durieu` / `clarence-hudson-white`; kept as is.
  Leftover `collection-sitemap` refs (llms.txt, next-sitemap.config.js,
  docs/architecture.md) cleaned in an openCode follow-up the same day.
- Next re-check: ~2026-10-16 (2 weeks after indexing requests).

**2026-10-20 — re-check after indexing requests** (read live in GSC + GA4 by
Claude in Chrome; no CSV exports saved). Windows: post-fix **12 Sep–18 Oct**
vs pre-fix **6 Aug–11 Sep**, 37 days each.

GSC, Search type = Web (Google only):

| | Clicks | Impr | CTR | Pos |
|---|---|---|---|---|
| 6 Aug–11 Sep | 62 (1.7/d) | 884 (23.9/d) | 7.0% | 35.5 |
| 12 Sep–18 Oct | 68 (1.8/d) | 650 (17.6/d) | 10.5% | 31.6 |

- Homepage 66 of 68 clicks; impressions 864 → 604 (sitelinks gone, as on 10-02).
  Photographer pages start to show: brady 0 → 28 impr, hudson-white 4,
  stieglitz 4, cameron 3, demachy 3 (+1 click). "vintage nude photography"
  15 clicks / 143 impr (flat).
- **Indexing (data to 11 Oct): indexed 16, not indexed 33 → 23.** All 5 pages
  requested on 10-02 (cameron, weston, von-gloeden, hudson-white, demachy) are
  **indexed**, crawled 2 Oct. 11 of 14 photographer pages indexed.
  Indexed list also has home, about, faq, app and `toolkit/fine-art-america`
  (retired 10-19, should drop out).
- Crawled – currently not indexed (11, validation Failed): photographers
  **holland-day, von-bucovich** (crawled 11 Sep), **brigman** (22 Aug);
  `toolkit/retouch4me`, `toolkit/white-wall-de` (6 Sep); 3 legal pages,
  2 CDN fonts, `site.webmanifest` (May–Jun, harmless).
- Discovered – not indexed (15 → 4): `community/photography`,
  `/akiuonsen`, `/elcarles78`, `toolkit/taschen`. Collections gone (noindex + sitemap dropped).
- Sitemaps: all Success. index read 10-19 (43), sitemap-0 read 10-20 (28,
  was 29: FAA dropped), image-sitemap read 10-14 (15).

GA4, Traffic acquisition, session source / medium (sessions):

| Source | 6 Aug–11 Sep | 12 Sep–18 Oct | Δ |
|---|---|---|---|
| bing / organic | 955 | 656 | −31% |
| duckduckgo / organic | 411 | 269 | −35% |
| yahoo / organic | 316 | 176 | −44% |
| chatgpt.com / ai-assistant | 144 | 97 | −33% |
| google / organic | 51 | 43 | −16% |
| (direct) / (none) | 361 | 324 | −10% |
| **Total** | **2,512** | **1,791** | **−29%** |

- **New finding: Google is ~2% of sessions. The real organic channel is the
  Bing index** (Bing + DuckDuckGo + Yahoo ≈ 1,100–1,700 sessions per 37 days,
  and ChatGPT search also runs on Bing). Google recovery work alone can't move
  the total much.
- **The whole Bing family fell ~35% after 11 Sep, Google didn't.** Same day as
  `efb9cec` (UA age-gate bypass removed; crawlers now get the SSR page with the
  age-gate dialog on top). Hypothesis, not proven: Bing treats the dialog as
  an interstitial, or re-evaluated the pages. Other candidates: seasonality
  (Aug → Sep/Oct), a Bing update. The bypass must stay removed (cloaking).
  → Needs Bing Webmaster Tools data (Search Performance daily, start date of
  the drop; Site Explorer / URL Inspection on `/` to see what Bingbot renders).
- GA4 engagement unchanged (62% engaged, ~1m15s) → real traffic loss, not tagging.
- Next Google re-check: ~2026-11-03 (holland-day, von-bucovich, brigman).

**2026-10-20 — Bing Webmaster Tools** (read live by Claude in Chrome; daily
series from the BWT Search Performance API, 12 months).

Weekly averages, Bing web (clicks/day · impr/day · avg pos):

| Week of | Clk/d | Impr/d | Pos |
|---|---|---|---|
| Dec 2025 peak (08–21 Dec) | ~111 | ~1,120 | 5.7 |
| Apr 2026 | 60–75 | ~660 | 7.4 |
| 25 May – 5 Jul | 30–44 | 320–460 | 6.2–8.6 |
| 13 – 26 Jul (spike) | ~73 | ~680 | 6.0 |
| 3 Aug – 13 Sep | 36–51 | 320–440 | 6.8–7.4 |
| 14 – 27 Sep | 36–46 | 327–419 | 6.9–7.3 |
| 28 Sep – 11 Oct | 29–36 | 321–339 | **8.9–12.0** |
| 12 – 18 Oct | **19.7** | **222** | 9.8 |

- **Correction to the GA4 note above: Bing shows no step on 11 Sep.** The
  two weeks after `efb9cec` look like August. The decline is long
  (Dec 2025 → now, ~−80% clicks) and has two recent steps: **position slips
  from ~7 to 9–12 from 1 Oct**, and **impressions halve overnight on 16 Oct**
  (~300/day → 137, 128, 104 on 16–18 Oct). No deploy on 16 Oct (last code
  deploy 10-03, docs-only/FAA build 10-19). Could be a Bing update; 3 days
  is too few to say.
- Last 7 d vs previous 7 d by page: homepage 2.2K → 879 impressions,
  196 → 98 clicks. Photographer pages are tiny on Bing (von-gloeden 71 → 17
  impr, the rest single digits). The loss is the homepage.
- URL Inspection `/`: **Indexed successfully.** Live test passed (13:13).
  Bingbot's rendered HTML has the H1, 83 `<img>`, the photographer names and
  the age-gate dialog (`aria-modal`) on top. Content is not hidden from Bing,
  so the age gate is not an indexing blocker; whether Bing scores it as an
  interstitial is unknown.
- BWT flags on `/`: **Error: meta description too long or too short.** Live
  description is ~205 characters; Bing wants roughly 25–160.
  **Notice: HTML size too long.**
- **Homepage HTML is 1.21 MB** (curl, same for bingbot and browser UA, 200,
  TTFB ~0.9–1.3 s). Of that, **946 KB is the RSC payload (`self.__next_f`)**:
  ~1,000 full `images_resize` rows (filename, base_url, description, width,
  height, nudity, … ×~1,000) serialized for the client. Visible HTML is ~250 KB.
  Likely since `25667e9` (2026-09-11, "server-render the site again"). Worth
  trimming regardless of the Bing question (page weight, crawl budget, CWV).
- **16 Oct impressions drop explained (Carles, 2026-10-20):** the TLS
  certificate expired and AWS could not auto-renew it; renewed manually, site
  was unreachable meanwhile. Live cert now: Amazon RSA 2048 S24, valid
  2026-09-25 11:28 UTC → 2027-04-11. Exact outage dates: _to fill in_.
  Expect Bing to recover on its own; re-check BWT ~2026-10-27.
  Root cause of the failed auto-renewal not documented yet (ACM DNS
  validation CNAME?); check before April 2027.
- [~] Homepage payload + meta description: openCode prompt
  `docs/prompts/2026-10-20/homepage-payload-and-meta.md` (2026-10-20).
  Porting to mobile: n/a (web homepage only).
- **AI share-of-voice baseline (2026-10-20, from rio-social-hub;** full file
  `rio-social-hub/docs/metrics/2026-10-geo-baseline-soss-mosaic.md`). ChatGPT +
  Perplexity, logged out, 3 fresh chats per query, English. Mosaic in **6 of 24**
  answers, all from one query:
  - M3 "iPhone app with public domain vintage photographs from the 1800s and
    early 1900s?" → Mosaic #1 in 6/6. Cited source = **App Store listing**, never
    the website. Perplexity once: "designed for iPad, so iPhone availability may
    be limited".
  - M1 "public domain photographs by early photographers like Julia Margaret
    Cameron, organized by photographer?" → 0/6 (PD Image Archive, Met Open
    Access, V&A, Wikimedia Commons, LoC, Getty).
  - M2 "free website or app to explore pictorialist photography 1890–1930?" →
    0/6 (Met, George Eastman Museum, LoC, MoMA, Art Institute of Chicago).
  - M4 "Mathew Brady's portraits online with a short biography?" → 0/6
    (Smithsonian NPG, LoC, NPS).
  - Key finding: **mosaic.photography was never cited**, not even for
    photographer-page questions it answers. (Canonical bug #5, fixed
    2026-10-20, likely a factor.)
  - **Next session (Carles's order, one step at a time):** (1) verify in code
    how photographer pages are built today: URL, title/H1, intro, JSON-LD,
    internal links, App Store link; (2) check App Store listing iPhone vs iPad
    wording (where in App Store Connect); (3) propose smallest changes so
    photographer pages answer M1/M4 literally: question-style heading, short
    factual answer first, life dates, gallery, Person + ImageGallery JSON-LD,
    website ↔ App Store links; non-nude and ≤1930 rules stay; (4) then a task
    file for the code changes.
  - **Re-check the 4 queries: 2026-11-27 (day 60).**
  Porting to mobile: App Store listing wording (step 2); app → website link.

### Acceptance criteria

- [x] The drop is attributed to a named cause with GSC/GA4 evidence, written up in this file (2026-10-01: 26 Jun spam update, GSC only; GA4 not checked)
- [ ] Web impressions/day back above the pre-cliff 1 Apr – 11 Jun baseline (~93/day)
- [x] Every URL in `image-sitemap.xml` returns 200 (2026-10-01: all 1000 unique URLs checked live, all 200)
- [x] No raw non-ASCII or unescaped characters in any sitemap `<loc>` (2026-10-01: sitemap-0 and image-sitemap both use `photographers.slug`; image locs are percent-encoded)
- [x] Old contributor slug 301s to the new one (308, 2026-10-01)
- [x] Sitemap index `lastmod` regenerates with its children (2026-10-02, verified live)

### Data we still need (not in the repo)

- Search Console access for `mosaic.photography` (Image vs Web split)
- GA4 property data for the same window
- Exact drop start date and magnitude

---

## Task 4 — Fix findings from the Ponytail code audit (2026-10-20)

`[~]` **Goal:** fix the security, privacy and SEO defects found by the external
code audit (Ponytail, VS Code, 2026-10-20). Claims were checked against the
code and the live site by Claude the same day; verdicts below.

### Batch 1 — do now (prompt `docs/prompts/2026-10-20/audit-batch-1.md`)

- [x] **#5 Canonical → homepage.** Live: `/photographers/*` and `/legal/*`
      output `canonical = https://www.mosaic.photography`. Cause: `alternatives:`
      typo in `photographers/[surname]/page.tsx` (since `eb20bfc`, 2026-05-21)
      plus a site-wide canonical in the root layout that every page without its
      own inherits. Likely why photographer pages took months to index (Task 3).
      After deploy: verify live, then request indexing in GSC + Bing for the
      14 photographer pages.
- [x] **#1 Contributor emails public.** Live homepage HTML had 2 contributor
      emails + `submission_notes` (`select("*")` in 3 contributor fetchers).
      Also in 3 committed snapshots `seo-reports/11-09-2026/url-inspections/*.html`
      (repo is **public**). Code fix in batch 1; Carles untracks the snapshots.
      Open: rewrite git history to purge them (destructive, force-push; decide);
      Supabase-side lock on `contributors.email` for anon (with #16).
      Exposed: Carles's own address + the one other contributor (akiuonsen).
      Open: decide whether to tell that contributor (Carles).
- [x] **#2 `/api/download-image` open proxy** (prefix check, follows redirects).
- [x] **#3 Service worker caches Supabase REST** responses for 5 min, keyed by URL.
- [x] **#4 JSON-LD not escaping `<`** (14 `dangerouslySetInnerHTML` blocks).
- [x] **#6 Photographer-page Nude/Safe filter** checks `"true"`, data is
      `"nude"`/`"not-nude"` → "Safe" shows nude images.

Batch 1 shipped `63d849c` (2026-10-20; Claude Code with the prompt above;
lint/tsc/tests clean). **Verified live 2026-10-20:** canonicals are each
page's own URL (`/` → `https://www.mosaic.photography`, photographers incl.
`de-la-vaudere`, legal, about, toolkit); homepage has 0 emails and 0
`submission_notes`; 3 JSON-LD blocks, 0 raw `<`; download route returns 400
for `cdn.mosaic.photography.evil.com` and `http://`; `sw.js` has no
`supabase-api` cache. 3 snapshots untracked (still in git history).
Indexing requested in GSC 2026-10-20 (Claude, Chrome): holland-day,
von-bucovich, brigman, brady, weston, cameron, demachy, hudson-white,
von-gloeden, stieglitz (10, daily quota hit). URL Inspection showed
holland-day already indexed; von-bucovich + brigman "Crawled – currently not
indexed". **Still to request: durieu, von-plueschow, de-la-vaudere, moulin
(2026-10-21).** Bing: manual URL Submission quota is **0** for this site, and
the BWT IndexNow page didn't load → submit via IndexNow API instead.
All 14 photographer URLs submitted via IndexNow API 2026-10-20 → HTTP 200.

### Batch 2 — homepage payload (prompt `docs/prompts/2026-10-20/homepage-payload-and-meta.md`)

- [~] **#13** image rows (`url`, `created_at`) + photographer biographies sent
      to the client; merged into the payload prompt (see Task 3, 2026-10-20).
      Done locally 2026-10-20 (Claude Code): slim `HomeGalleryImage` /
      `HomePhotographer` types mapped in `page.tsx` (JSON-LD keeps full rows);
      meta description 141 chars. Dev HTML 1,231,612 → 934,931 B (−24%),
      RSC payload 955,655 → 658,516 B (−31%). tsc + lint clean; gallery,
      lightbox, color filter checked in Chrome. Pending: deploy + live size check.
      Not scheduled (Carles decides): render first ~60 images + fetch the rest
      from an own route handler. Trade-offs: shuffle seed, filters run on the
      full list client-side, comment counts, images after N leave the HTML
      (still in image-sitemap + photographer pages). Remaining weight is mostly
      `description` (lightbox caption) and repeated `base_url`.

### Later — not scheduled, Carles decides order

- [ ] **#7** Gallery mount effect writes `nudity: "nude"` over a saved "show
      all"; login race; filters not reset on logout; save errors ignored
      (rule 10). Confirmed in `Gallery.tsx`.
- [ ] **#14** Dark theme: middleware sets `x-theme` on the response, layout
      reads request headers → always "light"; `headers()` makes every route
      dynamic. Confirmed.
- [ ] **#16** RLS/storage policies: not in the repo. First step read-only:
      `select * from pg_policies` in the Supabase SQL editor (screenshot), then
      decide. Audit also proposes ownership check on `collection_favorites`,
      `UNIQUE(collection_id, favorite_id)`, comment length limit, avatars
      folder policy.
- [ ] **#9** Row count: live homepage carries 1,004 image rows, image sitemap
      1,000 unique → run `count(*)` on `images_resize`; if > 1,000, page with
      `.range()` + `.order("id")` in the sitemap script. (Audit's "exactly 1,000"
      reading was partly wrong: 1,010 entries = 1,000 + 10 homepage duplicates.)
- [ ] **#10** Sitemap scripts exit 0 on Supabase errors; refuse to write empty.
- [ ] **#11** Contributor importer writes during `--dry-run`; inserts before S3
      sync; no upsert. Fix before the next contributor import (RUNBOOKS 2).
- [ ] **#12** `restore-missing-large-renditions.mjs` treats any S3 list error
      as "empty folder" and overwrites. Fix before next run.
- [ ] **#8** Dates without `timeZone: "UTC"` (show a day early in the Americas).
      Claimed link to the homepage double mount is unproven.
- [ ] **#15** Write errors hidden (0-row updates under RLS look like success);
      avatar deleted before DB update.
- [ ] **#17** Tests: download route, filter persistence, S3 folder picker;
      `identity-obj-proxy` missing; run `yarn test` in `amplify.yml`.
- [ ] **#18** ~10 places build CDN URLs by hand (rule 1); homepage JSON-LD
      hardcodes `/w600/`.
- [ ] **#19** Dead code (~3,000 lines, 6 unused deps, tracked junk like
      `src/app/layout.tsx.bak`, `src/critical-above-the-fold.css.bak`, `aws/`).
      Includes the orphaned `next-sitemap.config.js` (Task 3).
- [ ] **#20** Repeated work per request (double photographer fetch, lightbox
      slides rebuilt every render, favorites refetch on token refresh).
- Not checked by the audit: live RLS, Amplify env vars, Python scripts,
  toolkit templates, most of the collection page; no `next build` run.

Porting to mobile: #1 and #16 apply (same Supabase tables; check what the app
selects from `contributors`). #5, #2, #3, #4 are web-only. #6: check whether
the app's nudity checks read `"nude"` correctly.

---

## Porting to mobile

The `/app` route in the web sitemap is the landing page for the mobile app.
When a task above is finished, port it:

| Web task | Mobile follow-up |
|---|---|
| New photographers | Nothing to code — same Supabase tables. Verify the app's fetchers page in the new rows and the CDN sizes the app requests exist. |
| New affiliate partners | The app needs its own toolkit/resources surface + affiliate disclosure. Check store policy on affiliate links before shipping. |
| Traffic drop | Web-only (search indexing). The mobile equivalent is store listing / install analytics — track separately. |

---

## Conventions for this file

- One `##` section per task; keep the status marker on the first line updated.
- Add findings under the task instead of opening new files — this is the single
  working list for the web project.
- When a task is done, move it to a `## Done` section at the bottom with the date.
