# Mosaic: keep or close? (cost, audience, monetization)

> Task 5 in `docs/TASKS.md`. Started 2026-10-23 (Carles + Claude).
> Status: data partly collected; decision pending.
> Sections marked **TODO** are filled in the next sessions. Numbers are sourced
> and dated; anything estimated is labelled as an estimate.

## 0. Carles's goal and rules (2026-10-23)

- **Goal:** cover costs, stop losing money. Target: within **6–7 months**
  (i.e. by ~May 2027).
- **Time:** as many hours as needed *if* it moves toward profit. If it only
  covers costs, minimum time. **If it keeps losing money, close.**
- **If closing:** close everything (web, app, DB, domain). Nothing kept online.
- **Nothing ruled out** for monetization. Carles would like to make a large,
  high-end Mosaic photobook (he uses InDesign often) — a project in its own right.
- Constraints that stay (project rules): affiliate only on-topic and disclosed,
  nothing adult-adjacent, no AI on nude images, SEO/GEO rules in `CLAUDE.md`.

## 1. Costs

### 1.1 AWS (read live in Cost Explorer, 2026-10-23)

Account `423623842495` (root `c.delriofrances@gmail.com`, also the AWS
Organizations management/payer account). Only Amplify app: `mosaic-photography`
(eu-central-1). Member account `saasofsaass.com` (`678511327238`) costs $0.
→ **All AWS cost below is Mosaic.**

12 months Oct 2025 – Sep 2026: **$484.50** (avg $40.37/month), rising from
~$29/month (Oct 2025) to ~$45–48/month (Apr–Aug 2026). Sep 2026: **$40.64**.

| Item (Sep 2026) | $/month | Note |
|---|---|---|
| Amplify firewall (`EUC1-AmplifyWAF`) | 15.00 | flat, every month since at least Apr |
| WAF (service) | 8.41 | ~8.2–8.7 every month |
| Amplify data transfer out | 7.75 | 11.6–13.8 Apr–Aug; homepage HTML was 1.2 MB until 2026-10-20 (now 0.9 MB) |
| Amplify SSR compute (duration + requests) | 1.46 | |
| Amplify build minutes | 0.39 | |
| Route 53 | 1.00 | one hosted zone; DNS is on Namecheap since 2026-09-25 → check if still needed |
| S3 (images) | 0.13 | 1,165 images, all sizes |
| CloudFront | 0.00 | flat-rate/free tier |
| Tax (VAT 19 %) | 6.49 | |

**Finding:** the firewall (Amplify WAF + WAF) is **~$23.40/month + VAT ≈ $28**,
more than half the bill, for a site with ~50 visits/day. Without it, and with
the lighter homepage, AWS would be roughly **$12–15/month incl. VAT** (estimate).
Decision needed (see §7): keep the firewall or not.

**2026-10-24 — firewall removed.** Rules were only 3 AWS managed groups (IP
reputation, Common, KnownBadInputs); no rate limit, no bot control. Last 3 h:
16 of 3.76K requests blocked (0.4 %), all exploit probes (`/.env`-type paths,
React2Shell body; the site runs Next 15.5.19, patched since 15.5.7). Carles
disassociated it in Amplify and deleted the web ACL in WAF (Global: 0 ACLs;
JSON backup in `WEBs\Mosaic`). Budget alert `mosaic-monthly` = $30/month
(85 % / 100 % actual, 100 % forecast) replaces it as the cost guard. Re-add in
Amplify → Firewall if an attack ever shows up. Route 53: zones were deleted
2026-09-25 (Task 3); Sep $1 was the partial month → expect $0 from Oct.

**2026-11-06 — October bill checked** (Billing → Bills, read live by Claude in
Chrome; issued 2026-11-01). **Total $33.86** = $28.43 pre-tax + $5.41 VAT.

| Item (Oct 2026) | $ |
|---|---|
| Amplify firewall (`HOSTING_WAF`, 0.763 months) | 11.44 |
| WAF (service) | 6.32 |
| Amplify bandwidth out (47.75 GB) | 7.16 |
| Amplify SSR compute (duration + requests) | 2.03 |
| Amplify build minutes (135 min) | 1.35 |
| S3 | 0.13 |
| Route 53 | **not on the bill (0)** |
| CloudFront, CloudWatch, others | 0.00 |

- The firewall was still billed until it was removed on 10-24 (0.763 months ≈
  24 days): $17.76 of the $28.43.
- **Without the firewall, October would have cost $10.67 pre-tax ≈ $12.70 incl.
  VAT.** November so far (1–6 Nov, estimate): $2.06 pre-tax, no WAF line, which
  points to ~$11–12 pre-tax / ~$13–14 incl. VAT for a full month. Confirmed: the
  firewall and Route 53 are gone.
- Bandwidth is now the largest item (~$7/month). The homepage HTML (0.9 MB,
  Task 4 Batch 2) is the main lever if this needs to go lower.

### 1.2 Other fixed costs

| Item | Cost | Per month | Note |
|---|---|---|---|
| Supabase | Free plan | $0 | limits: check DB size/egress before growth |
| Domain `mosaic.photography` (Namecheap) | $51.68/year | $4.31 | renewal price quoted 2026-10-23 |
| Apple Developer Program | $99/year | $8.25 | **renews 2026-11-16**; also used now for Valhalio iOS smoke tests (the final Valhalio gets its own account) |
| Google Play developer | one-time, paid | $0 | |
| Tools (Claude, openCode, …) | TODO | TODO | shared with other projects; decide whether to count a share |

### 1.3 Total

| | $/month |
|---|---|
| Today (AWS Sep + domain + Apple) | **≈ $53** (≈ $640/year) |
| Without firewall (estimate) | **≈ $25–28** (≈ $300–340/year) |
| **From Nov 2026 (measured, 2026-11-06):** AWS ~$13 + domain $4.31 + Apple $8.25 | **≈ $25.50** (≈ $310/year) |

Plus Carles's hours (not costed; TODO: decide whether to put a value on them).

## 2. Revenue

- **$0, ever.** Awin (TASCHEN, WhiteWall, Retouch4me) has never paid.
  Amazon account terminated; Fine Art America never approved, retired 2026-10-19.
- Awin 2026 YTD (read 2026-10-24): TASCHEN **17 clicks**, WhiteWall **364
  clicks**, 0 sales. TASCHEN was barely seen; WhiteWall (print your own photos)
  doesn't fit the audience.
- Ko-fi badge (nav + /about) live for months: **$0**.
- **Awin re-check 2026-11-06** (Advertiser Performance, all publisher accounts,
  read live by Claude in Chrome). Year to date (1 Jan – 6 Nov 2026): **TASCHEN DE
  25 clicks, WhiteWall DE 386 clicks (5 impressions), 0 sales, €0 pending,
  approved, bonus or declined.** October alone: TASCHEN 13, WhiteWall 113 (126 of
  the year's 411 clicks, i.e. ~30 %, in one month). Most likely that comes from the
  Oct photographer-page and hub work, which put more people on the pages that carry
  the links. Other TASCHEN regions (FR, US, ES, UK): 0 clicks.
- **Retouch4me: not in the report** (joined, programme launched 2026-03-07; EPC
  $12.45 network-wide). The live `/toolkit/retouch4me` page does use Awin links
  (`tidd.ly` short links plus one `awin1.com … v=123978`), so it's tracked. Either
  nobody clicked, or the report's region list (FR/DE/IT/ES/UK/US) doesn't cover the
  programme's region. Unresolved; low value.
- Joined programmes (12; page 1 of 2 read): TASCHEN DE/ES/FR/UK/US, WhiteWall DE, retouch4me,
  Poster Master US + Big Wall Decor US (both hidden on the site) and **Enjox Toys,
  still joined though never linked** (adult-adjacent, rule says no). Carles decides
  whether to leave it.
- Reading: ~400 clicks in 10 months and 0 sales. Affiliate (§6 J) isn't going to
  cover ~$25/month without a different audience.

## 3. Audience

### 3.1 Web (from `docs/TASKS.md`, Task 3)

- GA4, 12 Sep–18 Oct 2026 (37 days, incl. 7 days TLS outage): **1,791 sessions**
  (~48/day). Bing 656, DuckDuckGo 269, Yahoo 176, ChatGPT 97, Google 43,
  direct 324. → The Bing index (Bing + DDG + Yahoo + ChatGPT search) is the
  real channel; Google is ~2 %.
- Bing peak Dec 2025: ~111 clicks/day. Oct 2026: ~20 clicks/day. Long decline,
  plus a halving of impressions on 16 Oct (unexplained; re-check 2026-10-27).
- Google: 26 Jun 2026 spam-update cliff (−83 % impressions); no recovery yet.
- Registered users: **134** (`user_profiles`, 2026-10-23).
- ~~TODO: GA4 monthly sessions for 12 months; engaged sessions; top pages.~~
  Done 2026-11-06, see "GA4, 12 months" below.

**GA4, 12 months, 1 Nov 2025 – 31 Oct 2026** (read live 2026-11-06 by Claude in
Chrome; Traffic acquisition × Month). Total **26,578 sessions**, 16,067 engaged
(60.4 %), avg engagement 1m 25s, revenue $0. Organic Search 21,338 (80.3 %),
Direct 4,395 (16.5 %), AI Assistant 389 (1.5 %, from Jun 2026), Referral 273,
Unassigned 175, Organic Social 65.

| Month | Sessions | Engaged | Organic Search | Direct | AI Assistant |
|---|---|---|---|---|---|
| Nov 2025 | 2,793 | 1,727 | 2,243 | 506 | – |
| Dec 2025 | **3,702** | 2,318 | 3,113 | 539 | – |
| Jan 2026 | 2,973 | 1,511 | 2,122 | 819 | – |
| Feb | 1,909 | 1,172 | 1,644 | 234 | – |
| Mar | 1,831 | 1,154 | 1,550 | 243 | – |
| Apr | 2,045 | 1,300 | 1,749 | 263 | – |
| May | 2,200 | 1,353 | 1,819 | 317 | – |
| Jun | 1,820 | 1,091 | 1,453 | 318 | 10 |
| Jul | 2,431 | 1,488 | 1,997 | 316 | 69 |
| Aug | 2,096 | 1,330 | 1,650 | 295 | 111 |
| Sep | 1,626 | 1,019 | 1,248 | 242 | 102 |
| Oct 2026 | **1,480** | 896 | 1,018 | 306 | 96 |

Monthly rows are summed per channel, so they add up to 26,906, ~1 % above the
deduplicated total. Treat them as ±1 %.

- Trend: peak Dec 2025, then 1,800–2,400/month through Aug, then down to
  **1,480 in Oct (−60 % vs Dec, −33 % vs the 12-month avg of ~2,215)**.
  Organic Search Oct = 1,018, the lowest month in the year. Sep includes the
  7-day TLS outage; Oct doesn't.
- Landing pages: `/` 24,638 (92.7 %), `(not set)` 331, von-plueschow 206 (avg
  5m 58s), von-gloeden 107, `/app` 103, weston 94, moulin 71. 91 landing pages
  in total.
- ⚠️ **Foreign hits in the Mosaic property:** `/natalie-and-alexander` 141,
  `/danielle-and-david` 140, `/frank-and-kate` 77 (sessions = users = new users,
  0 s engagement). These paths don't exist on Mosaic and look like wedding
  pages (weddweb?), so another site is probably sending to this GA4 property, or
  it's spam. ~360+ sessions, ~1.4 %. Not investigated yet.
  **Checked 2026-11-06:** hostname = `www.mosaic.photography`, so the visits
  really arrived at Mosaic. Mosaic's GA4 is not running on another site. All of
  them fall between 28 Dec 2025 and 20 Jan 2026, in two bursts (~2 Jan and
  ~14 Jan), and six weddweb couple paths are involved: natalie-and-alexander 141,
  danielle-and-david 139, frank-and-kate 77, rebecca-and-chris 65,
  mark-and-nikisha 39, maddy-and-ben 18 (**479 sessions**). Every one is a new
  user with 0 s engagement. Live, these paths return 404 on Mosaic. None after
  Jan 2026. Likely cause: weddweb links (invitation / share / QR) were built with
  the Mosaic domain at that time, so guests landed on a Mosaic 404. That's a
  weddweb bug, to be checked in the weddweb repo. Effect on Mosaic numbers:
  Dec 2025 / Jan 2026 are inflated by ~480 sessions (Jan real ≈ 2,500).

**Search queries (read 2026-10-24):** "nude" is the traffic.
- Bing 12 months: 21.3K clicks / 220.6K impressions; **21.0K clicks (98.6 %)
  land on the homepage** (title "Public Domain Vintage Nude Photography").
  Top 25 keywords are all nude/nudist ("nude magazines", "vintage nudes",
  "vintage nudity", "vintage nudist pics"…).
- Google 16 months (Web): 1.19K clicks; queries with "nude" 347 clicks vs
  21 without (mostly "nudist"/"nudity").
- Yandex: negligible volume, same pattern.
- **Decision 2026-10-24 (Carles): do not remove "nude" from the web**
  (homepage title/H1/meta). App Store listing stays without it (Apple rules).
- ⚠️ Bing and Yandex also show Mosaic for queries seeking nude images of
  minors. → image review task (Task 5 / §7).

### 3.2 App

App Store Connect, last 30 days to 2026-10-22 (Analyse → Übersicht):

| Metric | Value | vs previous period |
|---|---|---|
| First-time downloads | **58** | +41.5 % |
| Re-downloads | 6 | −25 % |
| Impressions | 10,700 | +162 % |
| Product page views | 213 | +48.9 % |
| Conversion rate | 0.7 % (daily avg) | −53.7 % |
| Updates | 5 | −93.5 % |
| Crashes | 1 (1.4.0 iOS) | |

- The App Store listing is the only Mosaic source AI assistants cite (GEO
  baseline 2026-10-20: #1 in 6/6 answers for the iPhone-app query).
- Impressions grew sharply after the 2026-10-21 promo-text change; conversion
  from impression to download is low.
- ~~TODO: App Store downloads for 12 months; Google Play installs + active users.~~
  Done 2026-11-06, below.

**App Store, lifetime 28 Nov 2025 – 4 Nov 2026** (Analyse → Kennzahlen, read live
2026-11-06 by Claude in Chrome). App "Mosaic — Vintage Photography" (id 6755329136),
release 28 Nov 2025. **247 first-time downloads**, 692 product page views.

| Month | First-time downloads |
|---|---|
| Nov 2025 (from 28 Nov, launch) | 44 |
| Dec 2025 | 46 |
| Jan 2026 | 4 |
| Feb | 19 |
| Mar | 21 |
| Apr | 6 |
| May | 22 |
| Jun | 12 |
| Jul | 9 |
| Aug | 22 |
| Sep | 20 |
| Oct 2026 | 18 |
| Nov 2026 (1–4) | 4 |

- After the launch burst (90 in 5 weeks), the app stays flat at **~5–22/month,
  avg ~15**. The +162 % impressions after the 2026-10-21 promo-text change didn't
  turn into more downloads (Oct 18 vs Sep 20).
- Last 90 days (7 Aug – 4 Nov): 62 first-time downloads (+67.6 %), 6 re-downloads,
  10.4K impressions (+104 %), 216 page views, conversion 0.8 %, 2 crashes (1.4.0 iOS).
  Retention: "not enough data" (opt-in only).
- Note: the 2026-10-22 figure "58 in 30 days" above was most likely the 90-day view
  (the overview defaults to 90 days).
- **Google Play, 1 Nov 2025 – 5 Nov 2026** (Statistiken, read live 2026-11-06 by
  Claude in Chrome; private developer account "Carles del Río Francés", second
  Google login in Chrome, *not* `c.delriofrances@gmail.com`, which only holds the
  new empty VALHALIO account). App `com.carlos_delrio.mosaicphotographyapp`, last
  updated 8 Jun 2026. **88 new users in 12 months** (Nov 10, Dec 12, Jan 4, Feb 1,
  Mar 8, Apr 9, May 4, Jun 6, Jul 6, Aug 15, Sep 8, Oct 4, Nov 1–5 1). Installed
  audience ~10–18 devices/day all year (≈13 now). Last 28 days: 6 device
  acquisitions, 3 monthly active devices.
- **Both stores together: ~335 first-time installs in 12 months, ~20/month after
  launch.** iOS is ~3/4 of it.

## 4. Why it doesn't grow (diagnosis)

Known:
1. **The strongest content is suppressed by every free channel.** SafeSearch
   (on by default in Google and Bing) filters nudity; Instagram and Pinterest
   remove it; ad networks and most affiliate programmes refuse it. The top
   query is "vintage nude photography".
2. **Authority gap.** "Public domain photographs" queries are owned by the Met,
   Library of Congress, Wikimedia, Getty, V&A: millions of images, decades of
   links. Mosaic: 14 photographers, 1,165 images, few backlinks.
3. **Algorithm hits:** Google June 2026 spam update (26 Jun); Bing long decline
   since Dec 2025 + position slip from 1 Oct.
4. **Technical debt that hurt for months:** canonical pointing to the homepage
   on all photographer pages (fixed 2026-10-20), 1.2 MB HTML, client-only
   rendering until 2026-09-11, 165 images missing from the image sitemap
   (fixed 2026-10-21), 7-day TLS outage (19–25 Sep).
5. **No owned audience:** no newsletter, no community channel; every visit
   depends on a search engine.

Unknown / TODO: whether the age-gate dialog is scored as an interstitial by
Bing; the 16 Oct Bing drop.

## 5. SEO/GEO expectations (6–12 months)

TODO (next session, with 12-month GA4 + Bing data). Working assumption to test:
the 2026-10 fixes may recover part of Google (photographer pages now indexed),
but from a very small base; Bing is the bigger lever. Search alone is unlikely
to bring enough traffic for affiliate income to cover costs.

## 6. Monetization options (to evaluate)

For each: effort, potential, risk vs the rules. To be scored in the next session.

| # | Option | Notes |
|---|---|---|
| A | **Cut costs first** (firewall, Route 53 zone) | Halves the bar to clear. Low effort. |
| B | **Mosaic photobook** (PARKED 2026-10-24: audience searches for free nudes, not books; Carles only does it if it brings results) (large, high-end; Carles in InDesign) | Carles's preferred project. Options: print-on-demand (Blurb, Lulu, etc.: no stock, printed and shipped by the provider) or pre-sales/crowdfunding to fund an offset run. Verify: nudity policy of each printer/platform; which platform works with Carles's German business; shipping costs. |
| C | **Prints on demand** | Carles doesn't ship anything: a print-on-demand provider prints near the buyer and ships; Mosaic only uploads files and sets a price. Verify art-nude policy per provider. |
| D | **Direct support** (OUT 2026-10-24: Ko-fi badge already live, $0 ever) (Patreon / Ko-fi / Buy Me a Coffee) | Membership/tip platforms: fans pay a small monthly amount or one-off tip. Patreon allows art nudity with an adult flag (verify). Needs an audience that cares — 134 users, ~50 visits/day. |
| E | **Paid high-res downloads / packs** | Free web size; paid restored large files or per-photographer packs. The work being sold is the restoration/curation (the images are public domain). |
| F | **App monetization** | Tip jar, one-time "supporter" unlock, or subscription for hi-res/offline. The app is the asset AI assistants recommend. |
| G | **Owned audience** (newsletter) | Not money directly; feeds B–F. Weekly photograph + story. |
| H | **Curator presence** ("put your name") | A real person behind Mosaic (signed newsletter, about-the-curator page, interviews). Builds trust (E-E-A-T) and is what supporters pay for. |
| I | **Positioning of the nudes** ("how the nude is presented") | Today the site leads with "vintage nude photography". Alternative: lead with photographers/pictorialism, nudes inside. Trade-off: SafeSearch, payment and print providers vs the one query that brings clicks. |
| J | Affiliate (current) | $0 lifetime. Keep only if it costs no time. |

## 7. Decisions and deadlines

- [x] **Firewall on Amplify:** removed 2026-10-24 (~$28/month saved); budget
  alert $30 instead. See §1.1.
- [x] Route 53 hosted zone: already deleted 2026-09-25; confirm $0 in Oct bill.
- [ ] **Hide images that could show nude minors** (Carles reviews; rows moved
  to an archive table, files out of public S3, removal requests in GSC/Bing).
  **2026-10-24: Carles decided to locate them only (keep online, no hiding,
  no deletion); hide procedure stays ready.**
- [ ] **Apple Developer renewal 2026-11-16** ($99): renew only if Mosaic stays
  at least until the next decision point. Removing it pulls the app from the
  App Store (the only AI-cited Mosaic source).
- [ ] **Decision rule** (to fix with numbers): e.g. "by 2027-05-31, revenue ≥
  costs over the last 3 months, otherwise close everything".
- [ ] Which 1–2 monetization options to try (from §6).
