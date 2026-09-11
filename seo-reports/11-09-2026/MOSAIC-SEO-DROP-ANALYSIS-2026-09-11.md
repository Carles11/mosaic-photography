# mosaic.photography — the 26 June 2026 traffic drop

Inputs: GSC exports in `seo-reports/11-09-2026/` (Domain property), the repo
on `main`, the local git reflog, and the live site read from a real browser
session on 11 Sep 2026.

---

## 1. What happened, and when

The drop is a single-day cliff, not a slide:

| | 19–25 Jun (7 days) | 26 Jun – 2 Jul (7 days) |
| --- | --- | --- |
| Impressions / day | 149 | **25** (−83%) |
| Clicks / day | 12 | **1.6** |
| Avg position | 5.6 | **23** |
| Indexed pages | 16 | 16 |

It has not recovered. The last 3 months run at 15–35 impressions/day with
average position 25–45, against 120–190/day at position 5–6 in June. The
indexed-page count never moved, so this is not a de-indexing — the same 16
pages are still in the index and rank four pages lower.

Nothing was deployed near the cliff. The local reflog shows the last commit
before it on **19 June** (`fixed download image in new-tab issue`); the
substantial May–June batch (affiliate/toolkit section, community pages, GEO
copy, sliders) had all shipped by 9 June, two and a half weeks earlier.

What did happen on those dates is on Google's side: the **June 2026 spam
update** rolled out from 24 June and finished on **26 June** — the day the
cliff appears in your chart. (Sources: [SERoundtable — May 2026 core update
done](https://www.seroundtable.com/google-may-2026-core-update-done-41435.html),
[Google June 2026 spam update](https://www.josephcharnin.com/seo/google-june-2026-spam-update/),
[Search Engine Land — May 2026 core update](https://searchengineland.com/google-may-2026-core-update-rolling-out-now-478430).)
The May core update (21 May – 2 Jun) passed without any effect on the site.
The spam update targeted existing policies via SpamBrain: doorway pages,
thin affiliate content, cloaking, scraped/auto-generated content.

**Bing did not drop.** Bing Webmaster's 16-month export shows June 2026 at
11.0k impressions / 1,118 clicks, then **July back up to 16.8k / 1,779** and
August 13.3k / 1,471 — i.e. a normal seasonal dip and recovery, no cliff on
26 June, no step change at all. Bing crawls and renders the same HTML. That
isolates the cause to Google's ranking systems, not to the site's content
or availability.

An algorithmic spam demotion fits every observable: overnight, site-wide,
rankings pushed down rather than removed, no change in indexing, and
**Manual actions and Security issues both read "No issues detected"**
(checked 11 Sep) — so it is algorithmic, not a penalty you can appeal.

---

## 2. Why this site was exposed

Google reassessed every site during that window. Four things about
mosaic.photography would make a spam classifier nervous, and the first one is
the serious one.

### 2.1 Every page is client-side rendered — the server HTML is empty

`src/components/modals/ModalProviderLoader.tsx` wraps `{children}` in
`dynamic(() => import(ModalProvider), { ssr: false })` with
`fallback={null}`, and `ClientProviders` puts that wrapper around the entire
app in the root layout. So no route on the site renders on the server.
Confirmed live: the raw HTML of the homepage is 1.1 MB, of which the `<body>`
minus scripts is **1.8 KB** — four empty `<div>`s and
`<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">`. Zero `<img>`,
zero `<h1>`, 10 words. Every page checked has the same shape:

| URL | body words (no JS) | `<h1>` | `<img>` | bailout marker |
| --- | --- | --- | --- | --- |
| `/` | 10 | 0 | 0 | yes |
| `/photographers/moulin` | 14 | 0 | 0 | yes |
| `/photographers/von-plueschow` | 14 | 0 | 0 | yes |
| `/faq`, `/about`, `/toolkit/retouch4me`, `/community/photography` | 12–14 | 0 | 0 | yes |

The server components in `page.tsx` — the H1, the H2, the `WebPage` /
`ImageGallery` JSON-LD with 12 `ImageObject`s, the SSR fetches — all execute
on the server, and then get thrown away, because the bailout happens *above*
them in the tree. Only the two `<head>` JSON-LD blocks in `layout.tsx`
(`WebSite`, `Organization`) reach the HTML.

**What Google actually gets (from your live-test export, 11 Sep):** the
"View crawled page → HTML" dump *does* contain the rendered content — 4,019
words, 65 `<img>`, 2 `<h1>`, no `opacity:0` / `display:none` on anything, and
no age gate. So Google's second-pass renderer succeeds. But the
**Screenshot tab is a plain ochre rectangle** — nothing painted — and the
render logged **50 JavaScript console messages**. Google keeps both the DOM
and the screenshot; a page whose DOM says "4,000 words of nude photography
+ 88 sponsored links" while its pixels say "blank" is, to a classifier,
either hidden text or a doorway. That contrast, with an empty first-pass
HTML underneath it, is the exposure.

**Why the screenshot is blank — the hero.** The first viewport is a
full-height `HeroSection` whose only visual is a CSS `background-image`
pointing at a **full-resolution original** on the CDN
(`edward-weston/originalsWEBP/…_nude-charis-wilson-…webp`, 2.4 s to arrive
even on a fast desktop connection) plus a logo through `/_next/image`. There
is no `<img>`, no `srcset`, no `priority`, and the H1 sits *below* the fold at
y≈844 px. Google's renderer takes its screenshot on a short clock and does
not wait for large CSS background images, so what it paints is the hero's
solid background and nothing else — the ochre rectangle. On a real first
visit the age-gate modal ("Age Confirmation Required") then covers the same
viewport. So the picture Google keeps of the page is: adult title, blank
first screen, text only after a scroll it never performs. This also
violates the project's own rule 1 (`imageResizingS3.ts` for every image
URL — the hero bypasses it and ships an original).

Google rendered this shape fine for a year, so CSR alone did not cause the
drop. But every signal the spam update evaluates comes through the renderer
here, and the renderer's visual output is blank. The file's mtime (Sep 2025)
suggests the wrapper predates the drop: it is the vulnerability, not the
trigger — and the one thing entirely in your control.

### 2.2 88 `rel="sponsored"` links on the homepage

The May affiliate/toolkit work put 88 sponsored outbound links on the
homepage (the "Curated finds" slider plus product cards). Combined with
§2.1, the first-pass picture of the homepage is "adult keywords + affiliate
links + no content" — the textbook thin-affiliate signature the spam policies
name. The toolkit pages themselves are also "Crawled – not indexed" or
absent from the sitemap (`docs/TASKS.md` already records both).

### 2.3 Adult-keyword density

"nude" appears 2,506 times in the homepage payload; the title, both meta
descriptions, the OG title, three `<h1>`s and the `<h2>` all lead with it.
The queries the site wins are genuinely those terms, so the topic is correct
— but the density and repetition read as keyword stuffing to a classifier
that cannot see the gallery behind the JS. Three H1s on one page
("Mosaic Photography: Iconic Nude Photography Gallery", "Vintage Nude
Photography Gallery – …", and "Age Confirmation Required") is the kind of
thing to fix regardless.

### 2.4 The age gate is rendered as page content

"Age Confirmation Required" is an `<h1>` in the rendered DOM of every page.
Interstitials are a known ranking negative, and this one is also the third
H1 of the page. For a fresh crawler with no consent cookie it is the most
prominent element on screen.

---

## 3. What is fine

Canonicals (`https://www.mosaic.photography/`), apex/http → www redirects
(3 "Page with redirect" entries, all correct), `noindex` on
`/photo-curations` and a private collection (correct), `robots.txt` open,
the two `cdn.` 403s (directory listings — harmless), fonts and manifest
being "crawled – not indexed" (non-HTML, harmless), sitemap index with
page/image/collection streams.

---

## 4. What to do, in order

1. **Make the site server-render again.** This is the fix. `ModalProvider`
   must not be the component that wraps `{children}` with `ssr: false`.
   Two shapes work: (a) render `{children}` *outside* the dynamic component
   and mount the modal system as a sibling that only needs `#modal-root`;
   or (b) make `ModalProvider` SSR-safe (guard `document`/portal creation
   behind a mounted flag) and drop `ssr: false`. Either way, verify with a
   plain fetch that `/` returns the H1, the gallery `<img>` tags with alt
   text, and the `WebPage` JSON-LD in the HTML — that is the acceptance
   test, not the browser. This touches the modal system (`CLAUDE.md` rule
   4), so it is a small but real change.
2. **Rebuild the hero so the first screen has content.** A real
   `<Image priority>` from `getBestS3FolderForWidth` (w1200/w1600, never
   `originalsWEBP`) with alt text, and the H1 + one descriptive sentence
   *inside* the hero, above the fold. Then re-run the live test: the
   screenshot must show text and an image. Remove the per-card
   `console.log` while there.
3. **One H1 per page.** Drop the header's H1 to a `<p>`/logo, and render the
   age gate as a `<dialog>`/`role="dialog"` with an `<h2>` — or better, keep
   it out of the DOM until the user interacts.
4. **Thin the affiliate footprint on the homepage.** 88 sponsored links on
   the page that carries 95% of the traffic is a liability with no upside;
   a handful of featured items linking to `/toolkit` is enough. Fix the
   toolkit pages' own sitemap gap and `rel` attributes (already in
   `docs/TASKS.md` Task 2) so the affiliate content has a home that is not
   the homepage.
5. **Reduce keyword repetition in the head/H1s.** Keep "vintage nude
   photography" in the title once; let the description and H2 describe the
   collection (photographers, era, public domain) instead of repeating it.
6. After 1–5 are live: GSC → URL Inspection on `/` → **Request indexing**,
   resubmit the sitemap, and expect nothing for 2–4 weeks. Algorithmic
   demotions from a spam update lift on reassessment, which usually means
   the next spam or core update, not the next crawl. Do not chase the
   number week to week.

Nothing else on the technical list is worth doing before items 1 and 2.

---

## 5. What the follow-up reports showed

- **Links:** 227 external links, all to the homepage, from pixabay.com
  (128), apple.com (52), reddit.com (30), crix.design, medium.com. Normal
  profile; nothing that looks like a link scheme.
- **Live test:** URL available, indexable, 12 valid Image Metadata items,
  "all resources loaded", 200 OK — and a blank screenshot with 50 console
  messages (see §2.1).
- **Bing:** no drop (see §1).

## 6. Still to check

- ~~Manual actions / Security issues~~ — checked: no issues detected.
- ~~The 50 console messages~~ — checked, benign: 1 × service-worker
  registration rejected (Google's renderer always refuses SW registration),
  1 × GTM debug line, 48 × a leftover `console.log("Rendering store", …)`
  firing once per affiliate card. No hydration error, no exception. Remove
  the `console.log`; it is noise, not a cause.
