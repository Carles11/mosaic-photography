# Affiliate partners — what shipped, 11 Sep 2026

Closes the work planned in `AFFILIATE-PARTNERS-PLAN-2026-09-11.md` and run via
`AFFILIATE-RUNBOOK-2026-09-11.md`. Companion to the SEO reports in
`seo-reports/11-09-2026/`.

Shipped in two commits on `main`, deployed to Amplify and verified in
production.

## The partner set now

Three purposes, four visible partners.

| Partner          | Purpose         | Tracking                                   | Notes                              |
| ---------------- | --------------- | ------------------------------------------ | ---------------------------------- |
| **TASCHEN**      | books           | Awin, six programmes via `/api/go/taschen` | new; 11 product rows               |
| WhiteWall        | prints, framing | Awin (`tidd.ly`)                           | unchanged; product types corrected |
| Retouch4me       | software        | Awin (`tidd.ly`)                           | unchanged                          |
| Fine Art America | prints          | **none**                                   | never accepted; see follow-ups     |

Hidden via `is_active = false`, rows retained: **Amazon** (account terminated
Sep 2026), **Poster Master**, **Big Wall Décor**. Their Awin programmes stay
joined but idle. Enjox Toys is never linked — an adult-products link would
reclassify the site. Nexbie and the 30 Awin invitations declined.

## TASCHEN

TASCHEN runs one Awin programme per region over a single storefront whose
language is a path prefix (`/en/`, `/de/`, `/fr/`, `/es/`, `/it/`; no
`/en-gb/`). Products therefore store **one** canonical English URL and
`/api/go/taschen` decides two things separately at request time:

- which Awin programme to credit (`awinmid`), and
- which taschen.com language page to land on.

They match for the six home markets and deliberately diverge where a country
has no programme of its own: the Netherlands is credited to the German
programme but sent to the English page, and Portugal to the Spanish programme
on the English page, because a nearby currency is not the same thing as a
readable language. Australia, New Zealand, Canada and Mexico take the US
programme. Everything else falls back to US/English.

**Mosaic itself remains English-only.** Titles, descriptions and UI are English
in the database and stay that way; the language segment only ever changes on
the outbound hop, on TASCHEN's own store.

Each product carries its own `clickref` (`stieglitz-camera-work`,
`1000-nudes-durieu`, …), so Awin's click report attributes revenue to a
specific book on a specific photographer's page.

### Titles

Verified live and in stock on taschen.com on 11 Sep 2026: _Alfred Stieglitz.
Camera Work_ (45409), _1000 Nudes_ (05423), _The Male Nude_ (45504), _A History
of Photography_ (45405), _20th Century Photography_ (45406).

**There is no current TASCHEN Edward Weston** — the 2001 TASCHEN Icons edition
is out of print — and none for Anne Brigman, Robert Demachy or Julia Margaret
Cameron. Those photographers get prints and general resources only. The plan's
assumption that TASCHEN could replace Amazon one-for-one was wrong.

## Five things found along the way

Each of these was a live defect, not part of the original plan.

1. **~24 undisclosed Amazon links on the homepage.** The photographer cards
   rendered a "Prints & books" dropdown from the legacy `photographers.store`
   jsonb — links to the terminated Amazon account, as real anchors, with
   `rel="noopener noreferrer"` and no `sponsored`. They were never part of the
   June cut from 88 to 12 because they came from a different code path, so the
   homepage had been carrying roughly 36 paid links, not 12. Now 30, all
   disclosed and tracked.

2. **`DropdownItem.affiliate` was never wired to `rel`.** The field existed and
   nothing read it, which is the mechanism by which those links went out
   undisclosed. Fixed at the component, so it cannot recur there.

3. **Affiliate links in Person structured data.** `sameAs` on the photographer
   page concatenated `photographer.store`, which would have asserted that an
   `amzn.to` URL authoritatively identifies Edward Weston. Inert only because
   the detail-page fetcher never selected `store` — one added column from
   going live. Removed.

4. **The toolkit hero CTA was untracked.** Migration 007 set TASCHEN's
   `website_url` to a plain `https://www.taschen.com/`, and `ToolkitHero`
   renders that column as the page's main button, while every other Awin
   partner stores a tracked link there. Fixed in 009.

5. **Four WhiteWall prints and one book were tagged `framing`.** With Poster
   Master and Big Wall Décor hidden, the homepage Prints tab had nothing in it.
   Fixed in 010.

## Structural changes

- **No photographer page can be empty.** `getAffiliateProductsByAuthor` tops a
  thin shelf up from the general pool — books preferred, software excluded,
  round-robin across partners, stable per page. Jane de La Vaudère and Mario
  von Bucovich went from zero products to three. Partner churn can no longer
  empty a page.
- **The homepage shelf is balanced by type.** Twelve slots allocated
  round-robin so no filter tab renders empty; `ResourcesSlider` also hides a
  tab with nothing behind it.
- **Homepage photographer cards** show one tracked TASCHEN book each, on the
  six photographers TASCHEN publishes. The other eight show no dropdown rather
  than filler.
- **Hidden partners no longer serve a page**: `dynamicParams = false` on
  `/toolkit/[slug]`. Still answers 200 behind middleware — see follow-ups.
- `getToolkitDataBySlug` wrapped in `React.cache`; it was fetching twice per
  request.
- **`AWIN_PUBLISHER_ID` reaches the SSR runtime.** Amplify Console variables
  populate the build shell but not the compute serving SSR routes. Written into
  `.env.production` during the build in `amplify.yml`; the route now logs
  loudly when it is missing, because the failure is invisible from outside —
  the visitor still reaches the book, the money just never arrives.

## Verified in production

```
/toolkit/taschen                      200
homepage occurrences of amzn.to         0
/api/go/taschen (Stieglitz, ref set)  302 -> https://www.awin1.com/cread.php
                                            ?awinmid=28585
                                            &awinaffid=2902359
                                            &clickref=stieglitz-camera-work
                                            &ued=<encoded taschen.com URL>
```

Locally: hidden partners return not-found content, the German visitor test
routes to programme 28577 on the `/de/` page, the Dutch test to 28577 on
`/en/`, and the open-redirect guard sends a foreign host to taschen.com.
`yarn tsc --noEmit && yarn lint && yarn build` clean, 3 warnings (known
baseline), 0 errors.

**Still unproven:** a real click appearing in Awin → Reports → Clicks. The
redirect is correct, so this is a formality, but it is the only end-to-end
proof of attribution and it has not been observed yet.

## What the numbers say

GSC, three months to 11 Sep 2026: the homepage takes **330 of 334 clicks**
(4,027 impressions, position 15.6). Every photographer page combined took 4,
all on `/photographers/moulin`; toolkit pages took none. That is why the
photographer cards keep a paid link at all — books living only on photographer
pages would effectively never be seen.

Awin, same account, all time: **559 clicks across Big Wall Décor (115), Poster
Master (181) and Retouch4me (263), and zero sales.** All three convert
normally for other publishers — Big Wall's network EPC is £1.60, Retouch4me's
7.93 — so this is an audience mismatch, not a bad programme. It is the evidence
behind hiding the décor partners, and it puts Retouch4me on notice: same
position, and it survives this round only because it is the sole software
partner. If it is still zero in three months the same reasoning applies.

A second reading is worth holding open: 559 clicks against 2–3 banner
impressions with no conversions at all is also consistent with a large share
being crawlers following `rel="sponsored"` links. The per-product `clickref`
values introduced here will distinguish the two — real clicks arrive
identified by book and photographer, a bot sweep does not.

TASCHEN commission rates are not published on any of the six programme
profiles. All six carry a 30-day cookie. Average payment time is 103–122 days,
so revenue from this work lands around January 2027.

## Follow-ups

1. **Fine Art America on Awin (advertiser 88153, 30-day cookie, US region).**
   Applied months ago, still Pending Approval — not rejected, just never
   actioned. Chased by email 11 Sep 2026. No direct alternative exists:
   fineartamerica.com/affiliates.html is a 404, so Awin 88153 is the only
   route to tracking. The 18 FAA
2. **Soft 404 on retired toolkit URLs.** `dynamicParams = false` is correct and
   `generateStaticParams` prerenders only the four active slugs, but the
   middleware matcher (`/((?!_next/static|_next/image|favicon.ico|…).*)`)
   matches every page request, so Next serves the route dynamically and
   `notFound()` fires after the 200 header is already on the wire. Three
   previously-indexed URLs therefore answer 200 with not-found content. Fix
   needs care — that matcher carries the security headers.
3. **Duplicate anchors in `toolkitCard.tsx`.** Each card links to the same
   destination twice (image and "Shop now"), which is why the homepage shows 30
   sponsored anchors for 18 products. Harmless — Google counts the first link
   to a URL — but collapsing them takes the homepage to 18.
4. **`photographers.store` is dead in code but still populated.** No fetcher
   selects it and nothing renders it. Drop the column once you are confident
   nothing else reads it.
5. **Ask the TASCHEN programme manager** which programme is credited for an
   order shipping to a country with no programme of its own (NL, PT, AU). The
   `COUNTRY_MAP` in the router is the single place that knowledge lives. Ask
   for the commission rate at the same time; it is not published.
6. **Verify a real click** in Awin → Reports → Clicks, region filter cleared.
