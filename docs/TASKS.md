# TASKS — Mosaic Photography (web)

> Working task list for the Next.js web app. Read `CLAUDE.md` first, then the
> feature doc named in each task.
>
> **Scope:** these tasks are written against the **web** project. Once a task is
> done here, the same change is ported to the mobile app project — see
> "Porting to mobile" at the bottom.
>
> Status legend: `[ ]` todo · `[~]` in progress · `[x]` done
> Last reviewed: 2026-09-07

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
- [ ] Slug policy for non-ASCII surnames — `de-la-vaudère` is currently a raw
      non-ASCII URL. Decide: transliterate to `de-la-vaudere` + 301, or keep and
      percent-encode everywhere. **Blocks Task 3.**

---

## Task 2 — Add more affiliate partners to the list

`[ ]` **Goal:** expand the affiliate/toolkit catalogue and make the toolkit pages actually indexable.

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

- [ ] **`/toolkit/[slug]` pages are not in any sitemap.** `scripts/generate-sitemap-0.ts`
      queries `photographers` and `contributors` only. Add an `affiliate_advertisers`
      query so every toolkit page is submitted. Without this, new partners are invisible to search.
- [ ] Toolkit pages emit `CollectionPage` JSON-LD with **hardcoded `width: 800, height: 600`**
      for every product image (`src/app/toolkit/[slug]/page.tsx`). Use real dimensions, or
      consider `ItemList`/`Product` instead — the current markup asserts sizes that are wrong.
- [ ] Outbound affiliate links use `rel="sponsored"` alone in 12 places (toolkit card,
      `ShopLink`, all four templates, `ToolkitHero`). Add `noopener noreferrer` — only
      `PhotographerLinks.tsx` does it correctly today.
- [ ] Duplicate file to delete: `src/components/toolkit/ToolkitAffiliateBadge (1).tsx`.
- [ ] `getGeneralAffiliateResources` has the `.is("photographer_author", null)` filter
      commented out, so photographer-specific products also appear in the homepage
      slider. Decide whether that is intentional.

### Acceptance criteria

- [ ] `/toolkit/{slug}` renders with the right template and 404s cleanly for unknown slugs
- [ ] New partner appears in the homepage `ResourcesSlider`
- [ ] Photographer-linked products appear on the matching `/photographers/{surname}` page
- [ ] Toolkit URLs present in `sitemap-0.xml` after build
- [ ] Affiliate disclosure visible on every surface that shows a paid link

### Open decisions

- [ ] Which partners/networks to add (Awin? Amazon? print-on-demand? software)?
- [ ] Do we want a `/toolkit` index page? Today there are only `[slug]` pages, so
      the section has no hub and no internal linking entry point.

---

## Task 3 — Investigate the visits drop (~mid/late August 2026)

`[ ]` **Goal:** explain and reverse the traffic drop that started roughly two weeks before 2026-09-05.

### Prime suspect: the 12–13 August sitemap rewrite

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

- [ ] **Sitemap lists images that do not exist.** `restore-missing-large-renditions.mjs`
      failed on 8 renditions ("no originalsWEBP source"), and two of them are still
      listed in `public/image-sitemap.xml`:
      - `holland-day/w1600/holland-day_woman-drapery-halo-staircase-seated_year-1890_vertical_female_bw_not-%20nude.webp` (filename contains a space)
      - `julia-margaret-cameron/w1200/julia-margaret-cameron_die-tochter-des-g%C3%A4rtners-...webp` (non-ASCII filename)
      → verify they 404 on the CDN, then either restore the renditions or drop them from the sitemap.
      Also check the matthew-brady failures (`ruins-of-strasburg`, `napoleon-sarony`) are genuinely absent from the sitemap.
- [ ] **Raw non-ASCII page URL in the sitemap:** `https://www.mosaic.photography/photographers/de-la-vaudère`.
      Sitemap `<loc>` values must be URL-escaped. Ties to the slug decision in Task 1.
- [ ] **Contributor slug changed without a redirect:** `/community/photography/elcarles`
      → `/community/photography/elcarles78` in `bb65846`. `next.config.ts` only redirects
      `/contributors` → `/community/photography`. Add a 301 for the old slug.
- [ ] **Stale sitemap index:** `public/sitemap.xml` `lastmod` is `2026-08-12T22:56:52Z`,
      but `image-sitemap.xml` was changed again on 08-13 (`e6ffe07`). The index does not
      signal the newer sitemap. Make `postbuild` regenerate the index too.
- [ ] **`next-sitemap.config.js` is orphaned.** It sets `generateRobotsTxt: true` and its
      own policies, but `postbuild` runs the three custom `tsx` generators and never
      `next-sitemap`. `public/robots.txt` is hand-maintained. Either wire it back in or
      delete the config so nobody edits the wrong file.
- [ ] Sitemaps are **committed to `public/`** and also **regenerated at build**. Confirm
      a deploy cannot ship a stale committed copy.

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

### Acceptance criteria

- [ ] The drop is attributed to a named cause with GSC/GA4 evidence, written up in this file
- [ ] Every URL in `image-sitemap.xml` returns 200
- [ ] No raw non-ASCII or unescaped characters in any sitemap `<loc>`
- [ ] Old contributor slug 301s to the new one
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
