# Affiliate partners — decisions and step-by-step plan (11 Sep 2026)

Inputs: Awin *joined* programmes export (`joined_advertiser-directory.csv`),
Awin invitations export (`advertiser-directory.csv`), Supabase exports of
`affiliate_advertisers` (6 rows) and `affiliate_products` (62 rows).

## 1. Decisions

| Partner | Today | Decision |
|---|---|---|
| **TASCHEN** (Awin US/UK/DE/FR/ES/IT) | joined, not on site | **Add.** Core partner. Books per photographer via `photographer_author`. One product row per book; `/api/go/taschen` routes to the visitor's country programme. |
| **Retouch4me** (Awin) | live, 6 products | **Keep** as is. |
| **WhiteWall** (Awin DE) | live, 7 products | **Keep** as is. |
| **Fine Art America** | live, 18 products, plain links (no tracking) | Keep for now — the prints are on-topic and per photographer. Confirm whether you are in an FAA/Pixels referral programme; if not these earn nothing and can stay as plain, relevant links. |
| **Amazon** | live, 25 products (all the per-photographer books) | **Hide** (`is_active = false`). Terminated; links no longer pay. Rows stay for readmission. |
| Big Wall Décor (Awin) | live, 3 generic products | **Hide.** Off-topic wall art. Programme stays joined, idle. |
| Poster Master (Awin) | live, 3 generic products | **Hide.** Same. |
| Nexbie (Awin) | joined, not on site | Ignore. |
| Enjox Toys (Awin, sector "Erotic") | joined, not on site | **Leave the programme.** Never link. Adult-product links would move the site from "art" to "adult" classification. |
| The 30 invitations | — | Decline/ignore all. Only Leica is on-topic and its terms (1-day cookie, EPC 0) are not worth a row. |

Result: three visible partners — books (TASCHEN), prints (WhiteWall, FAA),
software (Retouch4me). Everything else hidden or idle.

## 2. What was changed in the repo (done)

- `migrations/007_affiliate_is_active.sql` — adds `is_active` to both
  tables, hides amazon / poster-master / big-wall-decor, inserts the TASCHEN
  advertiser row.
- `src/types/supabase.ts` — `is_active` on both types.
- `src/utils/fetchAffiliateDataSSR.ts` — all three fetchers filter
  `is_active` on advertiser and product (`!inner` join).
- `src/app/toolkit/[slug]/page.tsx` — static params only for active
  advertisers; hidden slugs 404.
- `scripts/generate-sitemap-0.ts` — toolkit pages of active advertisers are
  now in `sitemap-0.xml` (closes the gap noted in `docs/TASKS.md` Task 2).
- `src/app/api/go/taschen/route.ts` — country router for the six TASCHEN
  programmes. Needs env `AWIN_PUBLISHER_ID`.
- `src/components/toolkit/components/ShopLink.tsx` — `rel` hardened.

## 3. Steps to run

### Step 1 — Database (Supabase → SQL editor)
Paste and run `migrations/007_affiliate_is_active.sql`. Then run the check
query at the bottom of the file; expected: TASCHEN, Retouch4me, White Wall,
Fine Art America active; Amazon, Poster Master, Big Wall Décor inactive.

### Step 2 — Awin publisher id → environment
Awin → top-right account menu → your **Publisher ID** (a number, also shown
in any tracking link as `awinaffid=`). Add to `.env.local` and to Amplify →
App settings → Environment variables:

```
AWIN_PUBLISHER_ID=123456
```

### Step 3 — Local check
```bash
yarn dev
# hidden partner must 404:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/toolkit/amazon        # 404
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/toolkit/taschen       # 200
# router: must 302 to awin1.com with awinmid=28577 for a German visitor
curl -s -o /dev/null -w "%{redirect_url}\n" -H "Accept-Language: de-DE" \
  "http://localhost:3000/api/go/taschen?u=https://www.taschen.com/"
# homepage must not mention amazon any more:
curl -s http://localhost:3000/ | grep -c "amzn.to"                                    # 0
```

### Step 4 — Ship
`npx tsc --noEmit && yarn lint && yarn build`, commit, push, wait for Amplify.

### Step 5 — TASCHEN products (Supabase → Table editor → affiliate_products)
For each book, one row. `affiliate_url` is the router link, not an Awin link:

| column | value |
|---|---|
| advertiser_id | the TASCHEN row's uuid |
| type | `book` |
| title | `{"en": "Edward Weston"}` |
| description | `{"en": "one sentence"}` |
| affiliate_url | `/api/go/taschen?u=https://www.taschen.com/en/books/photography/…&ref=weston` |
| image_url | the cover image (upload to your CDN under `advertisers/product_images/taschen/`) |
| photographer_author | exact value from `photographers.author` (e.g. `Edward Weston`) or empty for general titles |
| featured / sort_order | as needed |

Titles to look for on taschen.com (verify each exists and is in stock before
adding — catalogue changes):

- Edward Weston monograph → `Edward Weston`
- Alfred Stieglitz — *Camera Work* → `Alfred Stieglitz`
- *1000 Nudes* (Uwe Scheid collection, 1839–1939) → general, and it covers
  Durieu, Moulin, von Plüschow, von Gloeden; set no author, feature it
- *The Male Nude* → von Gloeden, von Plüschow, Holland Day
- *20th Century Photography* (Museum Ludwig) / *A History of Photography* →
  general
- Search "von Gloeden" and "Brigman" — add only if a TASCHEN edition exists

Three to five titles is enough to start. Every book must be a real TASCHEN
page; the router refuses any host other than taschen.com.

### Step 6 — Verify tracking
Open a TASCHEN product from the site, then Awin → Reports → Clicks: the click
should appear under the programme for your country with `clickref=…`.

### Step 7 — Housekeeping
- `docs/TASKS.md` Task 2: tick "toolkit pages not in any sitemap".
- Terms of service affiliate paragraph is generic; no change needed.
- When Amazon readmits you: `update affiliate_advertisers set is_active = true where slug = 'amazon';` — nothing else.
