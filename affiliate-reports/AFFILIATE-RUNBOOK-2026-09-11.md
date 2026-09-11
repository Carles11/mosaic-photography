# Affiliate partners — step-by-step runbook (11 Sep 2026)

Everything you have to do, in order, in the repo, in Supabase, on S3 and in the
Awin dashboard. Companion to `AFFILIATE-PARTNERS-PLAN-2026-09-11.md`, which
holds the decisions; this file holds the actions.

Rule for the whole runbook: **do steps 1 → 6 in one sitting.** Step 3 hides
Amazon, which is where all 24 per-photographer books live. Between step 3 and
step 5 every photographer page has books missing, so don't stop in the middle.

---

## What changed in the repo since the handover

Written and uncommitted, on top of the six files the handover already listed:

| File | Change |
|---|---|
| `src/app/api/go/taschen/route.ts` | **Rewritten.** Country now maps to `{ programme, taschen.com language }` as two separate decisions; the route rewrites the language segment of the destination URL; added `force-dynamic`; https-only guard. |
| `migrations/008_taschen_products.sql` | **New.** The 11 TASCHEN product rows, idempotent. |
| `src/utils/fetchAffiliateDataSSR.ts` | Homepage slider now filters `photographer_author is null` (the commented-out line). `getAffiliateProductsByAuthor` now **tops up** a thin shelf with general products and orders by likelihood of a click. |
| `src/app/photographers/client/PhotographerLinks.tsx` | Card title no longer says *"Eugene Durieu's 1000 Nudes"* — the possessive is used for prints only. |
| `src/components/toolkit/ToolkitHero.tsx` | A null `header_url` no longer emits `url(undefined)`; hero CTA gets `noopener noreferrer`. |
| `migrations/009_taschen_creative.sql` | **New.** Hero/banner creative, and — the important part — a **tracked** link on the hero CTA. |
| `migrations/010_whitewall_product_types.sql` | **New.** Four WhiteWall rows were prints and one a book, all tagged `framing`. |
| `src/components/sliders/ResourcesSlider.tsx` | Empty type tabs are no longer rendered. |
| `src/app/toolkit/[slug]/page.tsx` | `dynamicParams = false` so a hidden partner is a real 404, not a streamed soft 404. |
| `src/components/toolkit/templates/TemplateDefault.tsx` | Covers `3/4` + `object-fit: contain` instead of `16/9` + `cover` (book covers are portrait); `rel="sponsored noopener noreferrer"`; photographer name is no longer a second `<h2>`. |

### Why no photographer page can be empty any more

Hiding Amazon removes all 24 per-photographer books at once, and TASCHEN cannot
replace them one for one — there is **no current TASCHEN edition for Edward
Weston, Anne Brigman, Robert Demachy or Julia Margaret Cameron**. Straight
swap, two photographers would have ended up with nothing at all: Jane de La
Vaudère and Mario von Bucovich have no FAA prints either.

Rather than padding those pages with books that aren't about them — which is
precisely the thin-affiliate signal we can't afford — `getAffiliateProductsByAuthor`
now guarantees a floor. If a photographer has fewer than **3** products of
their own, the shelf is topped up from the general pool. The top-up:

- **excludes `tool`** — Retouch4me is a fine homepage resource but AI retouching
  software has no business being the entire shelf on the page of someone who
  died in 1910;
- **prefers general books** (the TASCHEN history titles) over print services,
  because a history of photography is the most on-topic thing we can offer
  someone reading about a historic photographer;
- **round-robins across partners**, so a shelf never fills with three
  near-identical WhiteWall framing products;
- varies by photographer but is **stable per page**, so the HTML is identical
  on every build.

The section heading is already generic ("Where to find prints & books") and the
card component never attributes a general product to the photographer, so
nothing on the page claims more than it should.

Shelf ordering is now by likelihood of a click: **that photographer's prints
first** (nearest thing to the pictures they're already looking at), then their
books, then general resources; capped at 8.

Resulting coverage — no page below 3, none empty:

| Photographer | Own | Topped up |
|---|---|---|
| Baron Wilhelm Von Gloeden | 4 | — |
| Alfred Stieglitz, Eugene Durieu, Felix Jacques Moulin, Fred Holland Day | 3 | — |
| Anne Brigman, Clarence Hudson White, Edward Weston, Robert Demachy, Wilhelm Von Plueschow | 2 | +1 |
| **Jane de La Vaudère**, **Mario von Bucovich** | 0 | +3 |

This also means the next terminated partner cannot empty a page.

### Why the homepage shelf is balanced by type

The shelf is capped at 12 — your own decision after the June spam update, when
homepage affiliate links went from 88 to 12 — and it has per-type tabs. Those
two facts fight each other if the 12 are chosen by relevance alone: whichever
type sorts last is cut entirely and its tab renders blank. Hiding Amazon made
that visible, with the shelf coming out as 5 tools, 5 framing, 2 books and no
prints.

The 12 slots are now allocated round-robin across types, which keeps the cap,
keeps every tab populated, and stops a partner with a deep catalogue taking
the whole shelf. Result: 4 books, 3 prints, 2 framing, 3 tools.

Two supporting fixes. `010` corrects the WhiteWall types — four of those rows
("Canvas Print", "Acrylic Masterprint", "WhiteWall Fine Art Prints", "Fine Art
Print") are prints and one ("Photo Book") is a book, but all seven were tagged
`framing`, so they were invisible under the tab a visitor would look in. And
`ResourcesSlider` now hides a tab with nothing behind it, so this can't present
as a broken page again.

**Note the hardcoded Fine Art America exclusion.** `ResourcesSlider.tsx` has
two blocks marked *"TEMPORARY EXCLUSION: Remove 'fine art america' until
partnership is confirmed"*, so FAA's 18 prints have never appeared on the
homepage. That is the payoff for the FAA follow-up: once Awin 88153 approves
you and the links are wrapped, delete those two blocks and 18 prints of actual
photographs from the collection flow into the Prints tab.

### Why the router changed

taschen.com is **one domain with a language path prefix** — `/en/`, `/de/`,
`/fr/`, `/es/`, `/it/`, same numeric product id and same English slug in every
one. There is no `/en-gb/`; UK uses `/en/`. The old route swapped the Awin
programme but always delivered the visitor to whatever `u` said, so a German
click booked to the German programme landed on the English page.

The new route treats the two as separate columns:

| Visitor | Programme credited | Lands on |
|---|---|---|
| US, CA, MX, AU, NZ | US `28585` | `/en/` |
| GB, IE | UK `28575` | `/en/` |
| DE, AT, CH, LI | DE `28577` | `/de/` |
| FR, BE, LU, MC | FR `28579` | `/fr/` |
| ES, AD | ES `28581` | `/es/` |
| IT, SM, VA | IT `28583` | `/it/` |
| **NL** | DE `28577` | `/en/` |
| **PT** | ES `28581` | `/en/` |
| anything else | US `28585` | `/en/` |

Netherlands and Portugal are the interesting rows and they answer your open
question. They get the nearest **euro / EU-shipping** programme so the
commission has somewhere to land, but they stay on the **English** page,
because Dutch is not German and Portuguese is not Spanish. Australia and NZ
stay on the US programme: at 7 clicks a quarter it isn't worth guessing.

**This does not localise Mosaic.** Mosaic stays English-only — every title,
description and button in the database and the UI is English and stays English,
and there is still exactly **one** stored URL per book (the canonical `/en/`
one). The language segment only ever changes on the outbound hop, on TASCHEN's
own store. If you'd rather everyone landed on the English page regardless, it's
a data change, not a logic change: set every `locale` in `COUNTRY_MAP` to
`"en"`.

---

## Step 1 — Awin: get your publisher ID

Fastest route, no dashboard hunting — expand one of your existing WhiteWall
shortlinks and read the `awinaffid`:

```bash
curl -sIL "https://tidd.ly/4dFuDWd" | grep -io "awinaffid=[0-9]*"
```

Otherwise: Awin → top-right account menu → the number next to your account
name, or **Account → Profile → Publisher ID**.

Keep it. It's the `AWIN_PUBLISHER_ID` for step 2 and it never changes.

## Step 2 — Awin: confirm the six TASCHEN programmes and ask two questions

Check you are **Joined** (not "pending") on all six. Programme pages:

```
https://ui.awin.com/merchant-profile/28585   TASCHEN US
https://ui.awin.com/merchant-profile/28575   TASCHEN UK
https://ui.awin.com/merchant-profile/28577   TASCHEN DE
https://ui.awin.com/merchant-profile/28579   TASCHEN FR
https://ui.awin.com/merchant-profile/28581   TASCHEN ES
https://ui.awin.com/merchant-profile/28583   TASCHEN IT
```

All six list the same primary domain, `https://www.taschen.com/`, and a 30-day
cookie. Neither the US nor the DE profile publishes a commission rate, so
message the programme manager (advertiser profile → **Contact**) and ask:

1. What is the commission rate on books for this programme?
2. **Which programme is credited for an order shipping to a country with no
   programme of its own — the Netherlands, Portugal, Australia?** This is the
   one thing I could not establish from documentation. If they answer "the
   order's region decides, and NL orders belong to DE", the table above is
   right. If they say something else, change `COUNTRY_MAP` accordingly — it is
   the only place that knowledge lives.
3. While you're there: may I use your product cover images on my site? (Step 4.
   Awin advertisers almost always say yes, and some supply a product feed,
   which would be a better source than scraping covers by hand.)

Don't block on the replies. Ship first, adjust the map when they answer.

## Step 3 — Environment variable

`.env.local`:

```
AWIN_PUBLISHER_ID=<the number from step 1>
```

Amplify → your app → **Hosting → Environment variables** → add the same
key/value → Save. It applies on the next build, so do this **before** step 6.

Without it the router still sends people to the right book, untracked — so a
missing variable degrades revenue, it doesn't break the site.

## Step 4 — Database migrations

Supabase → SQL editor. Run **in this order**, one at a time:

1. `migrations/007_affiliate_is_active.sql` — adds `is_active`, hides Amazon /
   Poster Master / Big Wall Décor, inserts the TASCHEN advertiser row.
2. `migrations/008_taschen_products.sql` — the 11 TASCHEN product rows.
3. `migrations/009_taschen_creative.sql` — creative + the tracked hero CTA
   (see step 5b; upload the logo first).
4. `migrations/010_whitewall_product_types.sql` — corrects the WhiteWall types.

**Before running 008, read the comment at the top of it.** Seven of the eleven
rows place *1000 Nudes* and *The Male Nude* on specific photographer pages
(Durieu, Moulin, von Plüschow, von Gloeden, Holland Day). That comes from your
own note in the handover, and I could not verify the plate lists. If one of
those photographers is not actually in the book, delete that row from the
`values` list before running — a book on a photographer's page that doesn't
contain their work is exactly the thin-affiliate signal we can't afford right
now.

Check queries are at the bottom of each file. After both:

```sql
select a.name, a.is_active, count(p.*) filter (where p.is_active) as live_products
  from affiliate_advertisers a
  left join affiliate_products p on p.advertiser_id = a.id
 group by a.name, a.is_active
 order by a.is_active desc, a.name;
```

Expected: TASCHEN 11, Fine Art America 18, White Wall 7, Retouch4me 6 active;
Amazon 25, Poster Master 3, Big Wall Décor 3 inactive.

## Step 5 — Cover images to the CDN

Five files, one per book (rows share covers). Download them from TASCHEN's
image host and upload to
`s3://…/advertisers/product_images/taschen/`, exactly these names:

| File to create | Source |
|---|---|
| `camera-work.webp` | `https://taschen.makaira.media/taschen/image/upload/f_webp,w_800/v1764683608/products-live/ebae7d98a2d217e4395d4c2ce073fa93.png` |
| `1000-nudes.webp` | `https://taschen.makaira.media/taschen/image/upload/f_webp,w_800/v1775662909/products-live/6087f9459b5a46463ba4426ca40c0d64.png` |
| `the-male-nude.webp` | `https://taschen.makaira.media/taschen/image/upload/f_webp,w_800/v1757685973/products-live/8bcb9550604ce4992d557c2b9dd19ffe.png` |
| `history-of-photography.webp` | `https://taschen.makaira.media/taschen/image/upload/f_webp,w_800/v1772458846/products-live/50359a15f39f0a92b200d368effca482.png` |
| `20th-century-photography.webp` | `https://taschen.makaira.media/taschen/image/upload/f_webp,w_800/v1761062153/products-live/567442f7f577353c6e5a4094ac4e53ca.png` |

The `f_webp,w_800` in the path is a Cloudinary transform — the host returns
WebP at 800px wide, so no conversion needed:

```bash
mkdir -p /tmp/taschen && cd /tmp/taschen
curl -L -o camera-work.webp              "https://taschen.makaira.media/taschen/image/upload/f_webp,w_800/v1764683608/products-live/ebae7d98a2d217e4395d4c2ce073fa93.png"
curl -L -o 1000-nudes.webp               "https://taschen.makaira.media/taschen/image/upload/f_webp,w_800/v1775662909/products-live/6087f9459b5a46463ba4426ca40c0d64.png"
curl -L -o the-male-nude.webp            "https://taschen.makaira.media/taschen/image/upload/f_webp,w_800/v1757685973/products-live/8bcb9550604ce4992d557c2b9dd19ffe.png"
curl -L -o history-of-photography.webp   "https://taschen.makaira.media/taschen/image/upload/f_webp,w_800/v1772458846/products-live/50359a15f39f0a92b200d368effca482.png"
curl -L -o 20th-century-photography.webp "https://taschen.makaira.media/taschen/image/upload/f_webp,w_800/v1761062153/products-live/567442f7f577353c6e5a4094ac4e53ca.png"
file *.webp   # all five must say "RIFF (little-endian) data, Web/P image"
```

Then upload the folder to S3 under `advertisers/product_images/taschen/` the
same way you did retouch4me, and spot-check one in a browser:
`https://cdn.mosaic.photography/advertisers/product_images/taschen/camera-work.webp`

### Step 5b — Hero and banner creative

The generic TASCHEN banners from the Awin creative library, converted to WebP
and uploaded under exactly these names (the paths `009` writes):

| Upload to | What it is |
|---|---|
| `advertisers/logos/taschen-logo.webp` | the wordmark, shown top-right of the hero at 168×44 |
| `advertisers/banners/taschen/taschen-header.webp` | wide image behind the hero, under a 70% black scrim — pick something that survives being darkened |
| `advertisers/banners/taschen/taschen-banner.webp` | in-page banner |

Then run `migrations/009_taschen_creative.sql`.

**Read the comment at the top of 009 before running it.** Migration 007 set
TASCHEN's `website_url` to a plain `https://www.taschen.com/`, and
`ToolkitHero` renders that as the page's main "Visit TASCHEN" button — so as it
stands the biggest button on `/toolkit/taschen` sends people to TASCHEN with no
Awin hop and earns nothing. Every other Awin partner of yours stores a tracked
link in that column (the `tidd.ly/…` shortlinks). 009 points it at the router
with its own `clickref`, which is what makes the CTA earn.

**Self-host, don't hotlink.** Two reasons, both concrete: `taschen.makaira.media`
is not in `images.remotePatterns` in `next.config.ts`, so `next/image` throws on
an unconfigured host; and those URLs carry a version segment (`v1764683608`)
that TASCHEN rotates whenever they re-upload, which would silently break every
cover later.

## Step 6 — Local verification

```bash
yarn dev
```

```bash
# hidden partner 404s, new one resolves
curl -s -o /dev/null -w "amazon  %{http_code}\n"  http://localhost:3000/toolkit/amazon
curl -s -o /dev/null -w "taschen %{http_code}\n"  http://localhost:3000/toolkit/taschen

# router: German visitor -> DE programme 28577 AND the /de/ page
curl -s -o /dev/null -w "%{redirect_url}\n" -H "Accept-Language: de-DE,de;q=0.9" \
  "http://localhost:3000/api/go/taschen?u=https://www.taschen.com/en/books/photography/45409/alfred-stieglitz-camera-work/&ref=stieglitz-camera-work"

# Dutch visitor -> DE programme 28577 but the /en/ page
curl -s -o /dev/null -w "%{redirect_url}\n" -H "Accept-Language: nl-NL,nl;q=0.9" \
  "http://localhost:3000/api/go/taschen?u=https://www.taschen.com/en/books/photography/45409/alfred-stieglitz-camera-work/&ref=stieglitz-camera-work"

# open-redirect guard: must land on taschen.com, not evil.example
curl -s -o /dev/null -w "%{redirect_url}\n" \
  "http://localhost:3000/api/go/taschen?u=https://evil.example/"

# homepage carries no Amazon links any more
curl -s http://localhost:3000/ | grep -c "amzn.to"
```

Expected, in order: `404`, `200`, an `awin1.com` URL with `awinmid=28577` and
`ued=…%2Fde%2F…`, an `awin1.com` URL with `awinmid=28577` and `ued=…%2Fen%2F…`,
`https://www.taschen.com/en/`, and `0`.

Then in a browser:

- `/toolkit/taschen` — 11 books, covers not cropped
- `/photographers/stieglitz` — two prints, then *Camera Work*, in that order
- `/photographers/durieu` — two prints, then *1000 Nudes*, and the card must
  read "1000 Nudes…", **not** "Eugene Durieu's 1000 Nudes…"
- `/photographers/de-la-vaudère` and `/photographers/von-bucovich` — the two
  that had nothing. Each must show **3** general products, mixed across
  partners, **with no Retouch4me tool among them**
- `/photographers/weston` — two prints plus one general top-up; no book,
  because TASCHEN doesn't publish him
- homepage resources shelf — general items only, no photographer-specific
  prints

## Step 7 — Ship

```bash
yarn tsc --noEmit && yarn lint && yarn build
```

Use `yarn tsc`, not `npx tsc` — `npx tsc` resolves to an unrelated
twenty-year-old package called `tsc` on npm and installs that instead of the
TypeScript compiler. (If `yarn tsc` isn't wired up in this project, use
`./node_modules/.bin/tsc --noEmit`.)

3 lint warnings are the known baseline; 0 errors. Then commit and push, and
watch the Amplify build to green.

Commit message draft:

```
feat(affiliate): add TASCHEN, hide terminated partners, fix outbound links

Adds TASCHEN as the books partner across its six Awin programmes, behind a
country router that picks both the programme to credit and the taschen.com
language segment to land on. Hides Amazon (account terminated), Poster Master
and Big Wall Decor behind a new is_active flag rather than deleting their rows,
so curated titles and photographer links survive a readmission.

Because TASCHEN has no edition for several of these photographers, a like-for-
like swap would have left two pages empty, so the photographer shelf now tops
itself up from the general pool (books preferred, no software, round-robin
across partners) and orders by likelihood of a click. Partner churn can no
longer empty a page.

- migrations/007: is_active on both affiliate tables, hide three partners,
  insert the TASCHEN advertiser
- migrations/008: 11 TASCHEN product rows
- api/go/taschen: country -> {awin programme, taschen.com locale}, https-only
  destination guard, force-dynamic
- fetchers, toolkit page and sitemap generator filter on is_active
- getAffiliateProductsByAuthor: minimum shelf size, relevance ordering
- homepage resources shelf is general-only again
- photographer cards stop calling a book the photographer's own
- outbound paid links get noopener noreferrer alongside sponsored
- toolkit cards no longer crop portrait book covers

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0152MnjeEN4C5oTjbKVYckT3
```

## Step 8 — Verify tracking on production

Click a TASCHEN book from a live photographer page. Then Awin → **Reports →
Clicks** (or Performance → Clicks), filtered to today. The click should appear
under the programme for your country with the `clickref` you gave that product
(`stieglitz-camera-work`, `1000-nudes-durieu`, …). Those clickrefs are per-row,
so once traffic builds, the clicks report tells you which photographer page and
which book actually earns.

If nothing appears: check `AWIN_PUBLISHER_ID` really made it into the Amplify
build (a missing variable sends visitors straight to taschen.com with no Awin
hop, which looks identical from the outside).

---

## After this is done

- [ ] `docs/TASKS.md` Task 2 — I've ticked the sitemap gap, the `rel` gap and
      the homepage-filter decision, and recorded the partner answer.
- [ ] **Edward Weston has no book.** There is no current TASCHEN edition — the
      2001 TASCHEN Icons one is out of print. He keeps his two FAA prints. If
      you want a book on his page, it needs a different publisher.
- [x] **No photographer page is empty.** Solved structurally by the top-up
      described above rather than by padding pages with irrelevant books.
      If you later find genuine per-photographer items for Jane de La Vaudère
      and Mario von Bucovich — FAA very likely has prints for both — add them
      and the top-up recedes on its own.
- [ ] **Fine Art America is on Awin — advertiser 88153, 30-day cookie.** Your
      18 FAA links are plain untracked URLs today, so they earn nothing. Apply
      to 88153 from your existing publisher account; once approved, one SQL
      update wraps all 18 in `cread.php?awinmid=88153&awinaffid=…&ued=…`. This
      is probably worth more than TASCHEN in the short term, because the rows
      and the photographer mappings already exist. Agreed follow-up, not part
      of this round.
- [ ] Remaining known gaps in Task 2, untouched here: the hardcoded
      `width: 800, height: 600` in the toolkit `CollectionPage` JSON-LD, the
      duplicate `ToolkitAffiliateBadge (1).tsx`, and the missing `/toolkit`
      index page.
