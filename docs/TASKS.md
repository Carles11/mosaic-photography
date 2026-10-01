# TASKS — Mosaic Photography (web)

> Working task list for the Next.js web app. Read `CLAUDE.md` first, then the
> feature doc named in each task.
>
> **Scope:** these tasks are written against the **web** project. Once a task is
> done here, the same change is ported to the mobile app project — see
> "Porting to mobile" at the bottom.
>
> Status legend: `[ ]` todo · `[~]` in progress · `[x]` done
> Last reviewed: 2026-10-01

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
8. `yarn build` → `postbuild` regenerates `sitemap-0`, `image-sitemap`, `collection-sitemap` and pings IndexNow.

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
that programme was never joined.

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

- [ ] **Fine Art America on Awin 88153.** Never joined; the 18 FAA links earn
      nothing and FAA is hardcoded out of the homepage shelf. Approval turns
      into revenue with one SQL update. Largest item outstanding.
- [x] **Soft 404 on `/toolkit/amazon`, `/toolkit/poster-master`,
      `/toolkit/big-wall-decor`.** `dynamicParams = false` is set and only the
      four active slugs are prerendered, but the middleware matcher makes the
      route dynamic, so `notFound()` fires after the 200 header is sent. Three
      previously-indexed URLs answer 200 with not-found content.
      2026-10-01: real cause was `toolkit/[slug]/loading.tsx` (streaming sends
      the 200 first); deleted. Local `yarn start`: all three + unknown slug → 404,
      `/toolkit/taschen` → 200. Verified on production 2026-10-01 (`56ddd34`):
      amazon / poster-master / big-wall-decor / unknown slug → 404, taschen → 200.
- [ ] **Duplicate anchors in `toolkitCard.tsx`** — image and "Shop now" both
      link to the same URL, so the homepage shows 30 sponsored anchors for 18
      products.
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
- [ ] **Stale sitemap index:** `public/sitemap.xml` `lastmod` is `2026-08-12T22:56:52Z`,
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
`docs/prompts/2026-10-01/image-sitemap-slug-dedupe.md`. Correction (same day): the 10 "duplicates" are the
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

### Acceptance criteria

- [x] The drop is attributed to a named cause with GSC/GA4 evidence, written up in this file (2026-10-01: 26 Jun spam update, GSC only; GA4 not checked)
- [ ] Web impressions/day back above the pre-cliff 1 Apr – 11 Jun baseline (~93/day)
- [x] Every URL in `image-sitemap.xml` returns 200 (2026-10-01: all 1000 unique URLs checked live, all 200)
- [ ] No raw non-ASCII or unescaped characters in any sitemap `<loc>`
- [x] Old contributor slug 301s to the new one (308, 2026-10-01)
- [ ] Sitemap index `lastmod` regenerates with its children

### Data we still need (not in the repo)

- Search Console access for `mosaic.photography` (Image vs Web split)
- GA4 property data for the same window
- Exact drop start date and magnitude

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
