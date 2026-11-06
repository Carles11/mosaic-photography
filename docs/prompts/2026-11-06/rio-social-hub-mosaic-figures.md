# Prompt for rio-social-hub: Mosaic in numbers (build-in-public angles)

> Written 2026-11-06 in the Mosaic project. Paste everything below the line into a
> rio-social-hub session (Claude), or run it as input to the `write-posts` routine.
> Figures are sourced and dated; don't round them further or invent new ones.

---

You are working in **rio-social-hub**. Brand: **Mosaic Photography**
(www.mosaic.photography + the iOS/Android app "Iconic Photography by Mosaic"), a
free public-domain (CC PDM 1.0) gallery of vintage fine-art photography from
1840–1930, built and run by one person (Carles) with no marketing budget.

**Task:** find the post-worthy stories in the figures below and turn them into
**post angles**, not finished posts. First read the Mosaic brand brief and the existing
angle list in this repo (follow this repo's own conventions for where angles live), so
you don't duplicate an angle we already have.

For each angle give:
1. One-line hook.
2. The exact figure(s) it rests on, with the date.
3. Best platform(s) from the ones this hub publishes to, and why.
4. A visual idea. Prefer a simple chart or a before/after number card, or a non-nude
   photograph from the collection (e.g. Mathew Brady, Alfred Stieglitz, Julia Margaret
   Cameron portraits).
5. Risk note if any (see "Rules").

Aim for **6–10 angles**, ranked by how likely they are to get a reaction from indie
builders, photographers or history fans. Then stop and wait for Carles to pick. Don't
draft full posts, generate images or schedule anything in Postiz until he has chosen.

## The figures (all Mosaic, verified 2026-10-20 → 2026-11-06)

**Traffic (GA4, 1 Nov 2025 – 31 Oct 2026)**
- 26,578 sessions in 12 months; 60 % engaged; average engagement 1m 25s.
- Monthly: peak **Dec 2025 = 3,702**, then 1,800–2,400/month, **Oct 2026 = 1,480**
  (lowest of the year, −60 % vs Dec).
- 80 % comes from search engines, 16.5 % direct, 1.5 % from AI assistants (only since
  Jun 2026).
- 93 % of visits land on the homepage. The longest visits are on photographer pages
  (von Plüschow ~6 min average).
- **The real search channel is Bing, not Google:** Bing + DuckDuckGo + Yahoo bring
  ~20× what Google brings (Google ≈ 2 % of sessions, Oct 2026).

**Search events that hit it**
- Google June 2026 spam update: on 26 Jun 2026 Web impressions fell from ~136/day to
  ~23/day (−83 %) overnight.
- Bing: long decline since Dec 2025 (peak ~111 clicks/day → ~20/day in Oct 2026).
- A 7-day HTTPS outage (19–25 Sep 2026): an auto-renewed certificate silently failed.

**Bugs that cost months (all fixed Oct 2026)**
- Every photographer page told Google its canonical URL was the homepage, for 5 months
  (one-word typo, `alternatives` instead of `alternates`). After the fix, Google indexed
  photographer pages: indexed pages went from 16 → 21.
- 165 of 1,165 images were never in the image sitemap (a silent 1,000-row query cap).
- `llms.txt` (the file meant for AI crawlers) returned 404 for months: it sat in the
  repo root instead of `public/`.
- The homepage HTML was 1.2 MB, of which 946 KB was hidden data for the browser.
  Trimmed to 0.9 MB.

**AI visibility (ChatGPT + Perplexity, 24 answers, Oct 2026)**
- Mosaic appeared in 6 of 24 answers, all for one question ("iPhone app with public
  domain vintage photographs…"), as #1 every time.
- The source AI assistants cite is always the **App Store listing, never the website**,
  even for questions the website answers.

**App (App Store, 30 days to 22 Oct 2026)**
- 58 first-time downloads (+41.5 %), 10.7K impressions (+162 % after one promo-text
  change), 0.7 % conversion.

**Money**
- Revenue: **$0, ever** (affiliate links: 381 clicks to two partners in 2026 up to 24 Oct, 0 sales; Ko-fi tips: $0).
- Running cost: **≈ $53/month in Sep 2026 → ≈ $25.50/month from Nov 2026.** More than
  half the AWS bill was a web firewall (~$28/month incl. VAT) that blocked 0.4 % of
  requests, all exploit probes. Removed 24 Oct; a $30 budget alert guards cost instead.
  AWS alone: $33.86 in Oct (incl. 24 days of firewall) → ~$13/month now.
- Carles's own rule: **Mosaic must cover its costs by ~May 2027, or it closes.**

## Rules (hard)

- **No nude images in any post or visual**, even though nudes are part of the
  collection (platforms remove them, and it would mislabel the brand). No AI-generated
  or AI-edited versions of collection photographs.
- Don't name search queries that contain "nude"; say "the top query" instead.
- **Do not use** (not public, decisions pending): anything about exposed user or
  contributor data, database security policies, git-history purges, comment moderation,
  reports, or the review of images of possible minors.
- No account IDs, emails, card digits, or other people's sites/projects.
- Affiliate mentions only if disclosed, and only on-topic partners (books, prints, photo
  software).
- Keep claims as precise as the figures above. "Google ≈ 2 %" is fine; "Google hates
  us" is not.

## Out of scope

- Finished post copy, images, video, scheduling in Postiz (wait for Carles's pick).
- Changing anything in the Mosaic repos.
- New research or new numbers. If an angle needs a figure that isn't here, list it as
  "needs data" instead of estimating.
