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

Plus Carles's hours (not costed; TODO: decide whether to put a value on them).

## 2. Revenue

- **$0, ever.** Awin (TASCHEN, WhiteWall, Retouch4me) has never paid.
  Amazon account terminated; Fine Art America never approved, retired 2026-10-19.
- Awin 2026 YTD (read 2026-10-24): TASCHEN **17 clicks**, WhiteWall **364
  clicks**, 0 sales. TASCHEN was barely seen; WhiteWall (print your own photos)
  doesn't fit the audience.
- Ko-fi badge (nav + /about) live for months: **$0**.

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
- TODO: GA4 monthly sessions for 12 months; engaged sessions; top pages.

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
- TODO: App Store downloads for 12 months; Google Play installs + active users.

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
