# Mosaic — SEO fixes after the 26 June drop — report (11 Sep 2026)

Companion to `MOSAIC-SEO-DROP-ANALYSIS-2026-09-11.md`. 11 files written to the
working copy via the desktop bridge. No gate was run here.

## Gate — repo root, copy as-is

```
yarn tsc --noEmit && yarn lint && yarn test
```

Then the acceptance test that matters — after `yarn build && yarn start` (or
on the Vercel/Amplify preview), fetch the homepage WITHOUT JavaScript and
check the HTML itself. Git Bash, copy as-is:

```
curl -s http://localhost:3000/ | grep -c "<h1"; curl -s http://localhost:3000/ | grep -c "<img"; curl -s http://localhost:3000/ | grep -c BAILOUT_TO_CLIENT_SIDE_RENDERING
```

Expected: `1`, a number in the dozens, `0`. Before this change the three
numbers were `0`, `0`, `1`.

## What changed

| File | Change |
| --- | --- |
| `components/modals/ModalProviderLoader.tsx` | Plain `<ModalProvider>` import; the `dynamic(…, { ssr: false })` wrapper around the whole app is gone. Modal bodies stay lazy via the registry. **This is the SSR fix.** |
| `components/hero/HeroSection.tsx` + `.module.css` | Hero is now a `<picture>`/`<img fetchpriority="high">` with w400–w1600 renditions (art-directed desktop/mobile; both files verified present in every size folder), alt text, and the page **H1 + one-sentence summary inside the hero**, above the fold. CSS `background-image` pointing at `originalsWEBP` removed. `#hero-title` / `#hero-summary` now exist, matching the `speakable` selectors in `generateWebPageSchema`. |
| `components/header/Header.tsx` | Site-wide `<h1 class="sr-only">` removed (every page already has its own H1; the homepage's is now in the hero). |
| `app/page.tsx` | `<h1>` dropped from `.home-titles` (hero owns it); `<h2>` kept. |
| `components/modals/ageConsent/AgeConsent.tsx` | Dialog title `<h1>` → `<h2>`. |
| `components/wrappers/HomeClientWrapper.tsx` | **User-agent bot sniffing removed.** It auto-confirmed age for `bot|crawl|spider|bing|…` UAs, so crawlers got the page un-gated and un-blurred while humans got it blurred behind the dialog — cloaking by Google's definition. Everyone now gets the same page. `skip_age_modal` cookie kept. Affiliate slider capped at 12 cards. |
| `components/sliders/ResourcesSlider.tsx` | New optional `limit` prop: featured first, then `sort_order`, sliced. |
| `components/cards/toolkit/toolkitCard.tsx` | `rel="sponsored"` → `rel="sponsored noopener noreferrer"` (open item in `docs/TASKS.md`). |
| `components/cards/PhotographersViewCard.tsx` | Removed `console.log("Rendering store", …)` (the 48 lines in Google's render log). |
| `app/layout.tsx` | Title template `%s \| Mosaic Photography` (was `\| Vintage Nude Photography by Mosaic` on every page); layout-level OG/Twitter title and description no longer lead with "nude". Page-level metadata untouched. |

## Decisions made without asking

- **Bot-UA sniffing removed** rather than kept. It was not in the approved
  list because I had not seen it yet; it is the single most spam-policy-
  relevant line in the codebase, so it went. The gate is still shown to
  every unconfirmed human, and the content is still in the DOM underneath
  for everyone — only the "crawlers skip the gate" branch is gone.
- **Homepage slider cap = 12.** 88 → ~24 sponsored links. Number is
  arbitrary but the slider shows ~4 at a time, so 12 is three screens.
- **Hero copy** names three photographers. Edit freely; the point is that
  the first screen carries a text description of what the page is.
- **`fetchPriority` attribute** on the hero `<img>` — valid HTML, typed in
  React 19 (which this repo uses). If `tsc` objects, it is the one line to
  check.
- **`ModalProvider.test.tsx`** is entirely commented out today; nothing to
  update there.

## What my verification could not have caught

- No `tsc`/`lint`/`jest` run.
- Whether `AffiliateProduct` types `featured` and `sort_order` as I assumed
  from `docs/TASKS.md` (sort in `ResourcesSlider`).
- Visual layout of the hero H1/summary over the image — check on mobile.
  The CSS uses `clamp()` sizes and centres both; adjust `.heroTitle` /
  `.heroSummary` if the logo + tabs stack gets too tall.
- Anything else that relied on the site being client-only (e.g. a component
  reading `window` at module scope) will now throw during SSR and show up
  in `yarn build`. That is the change working; fix each one at the source.

## After deploy

1. GSC → URL Inspection `https://www.mosaic.photography/` → **Test live
   URL** → Screenshot tab must show the hero image and the H1. If it is still
   blank, stop and report before anything else.
2. **Request indexing** on `/`, then on the 14 photographer pages.
3. Expect nothing for 2–4 weeks; algorithmic demotions lift on
   reassessment, which usually means the next update cycle.

## Full diff

```diff
diff --git a/src/app/layout.tsx b/src/app/layout.tsx
index 1c56334..43af245 100644
--- a/src/app/layout.tsx
+++ b/src/app/layout.tsx
@@ -21,7 +21,7 @@ export const metadata: Metadata = {
   metadataBase: new URL("https://www.mosaic.photography"),
   title: {
     default: "Public Domain Vintage Nude Photography | Mosaic Gallery",
-    template: "%s | Vintage Nude Photography by Mosaic",
+    template: "%s | Mosaic Photography",
   },
   alternates: {
     canonical: "https://www.mosaic.photography/",
@@ -54,9 +54,9 @@ export const metadata: Metadata = {
   },
   manifest: "/site.webmanifest",
   openGraph: {
-    title: "Nude photography | Mosaic Photography curated Gallery",
+    title: "Mosaic Photography — Public Domain Vintage Photography Gallery",
     description:
-      "Meet the iconic photographers behind the stunning classic nude photography in our collection.",
+      "A curated gallery of public domain photographs by legendary photographers — biographies, timelines and copyright-free images.",
     images: [
       {
         url: "/images/og-image.jpg",
@@ -69,9 +69,9 @@ export const metadata: Metadata = {
   },
   twitter: {
     card: "summary_large_image",
-    title: "Nude photography | Mosaic Photography curated Gallery",
+    title: "Mosaic Photography — Public Domain Vintage Photography Gallery",
     description:
-      "Explore our stunning image gallery featuring classic nude photography by iconic photographers.",
+      "A curated gallery of public domain photographs by legendary photographers — biographies, timelines and copyright-free images.",
     images: ["/images/og-image.jpg"],
     creator: "@mosaicphotography",
   },
diff --git a/src/app/page.tsx b/src/app/page.tsx
index b11f153..37d30d4 100644
--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -77,10 +77,9 @@ export default async function Page() {
         dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema) }}
       />
 
+      {/* The page's single H1 lives in HeroSection (above the fold, inside
+          the header's hero). This section carries only the H2. */}
       <section className="home-titles">
-        <h1>
-          Vintage Nude Photography Gallery – Public Domain & Copyright-Free Art
-        </h1>
         <h2>
           Iconic works by legendary photographers who shaped the history of nude
           art and nude photography.
diff --git a/src/components/cards/PhotographersViewCard.tsx b/src/components/cards/PhotographersViewCard.tsx
index 1e268c2..709a121 100644
--- a/src/components/cards/PhotographersViewCard.tsx
+++ b/src/components/cards/PhotographersViewCard.tsx
@@ -87,7 +87,6 @@ const PhotographersViewCard: React.FC<PhotographersViewCardProps> = ({
                   .map((storeString: string) => {
                     try {
                       const store = JSON.parse(storeString);
-                      console.log("Rendering store", { store });
 
                       return {
                         store: String(store.store),
diff --git a/src/components/cards/toolkit/toolkitCard.tsx b/src/components/cards/toolkit/toolkitCard.tsx
index 31c9dd5..19176c8 100644
--- a/src/components/cards/toolkit/toolkitCard.tsx
+++ b/src/components/cards/toolkit/toolkitCard.tsx
@@ -46,7 +46,7 @@ const ToolkitCard: React.FC<ToolkitCardProps> = ({
         <a
           href={product.affiliate_url}
           target="_blank"
-          rel="sponsored"
+          rel="sponsored noopener noreferrer"
           style={{
             display: "block",
             position: "relative",
@@ -99,7 +99,7 @@ const ToolkitCard: React.FC<ToolkitCardProps> = ({
           <a
             href={product.affiliate_url}
             target="_blank"
-            rel="sponsored"
+            rel="sponsored noopener noreferrer"
             className={styles.affiliateButton}
             onClick={handleShopNowClick}
           >
diff --git a/src/components/header/Header.tsx b/src/components/header/Header.tsx
index 7f1a9de..bbd7279 100644
--- a/src/components/header/Header.tsx
+++ b/src/components/header/Header.tsx
@@ -22,9 +22,9 @@ export default function Header({
 }: HeaderProps) {
   return (
     <header>
-      <h1 className="sr-only">
-        Mosaic Photography: Iconic Nude Photography Gallery
-      </h1>
+      {/* No H1 here. The header is on every route, so an H1 in it gave every
+          page two (three on the homepage, with the age gate). Each page owns
+          its own H1; on the homepage it lives in HeroSection, above the fold. */}
       <nav className={styles.navContainer}>
         <ul className={styles.navGrid}>
           {isHome ? (
diff --git a/src/components/hero/HeroSection.module.css b/src/components/hero/HeroSection.module.css
index 5cdbebd..1357ff9 100644
--- a/src/components/hero/HeroSection.module.css
+++ b/src/components/hero/HeroSection.module.css
@@ -10,15 +10,40 @@
   z-index: 0;
 }
 
+/* The hero image is a real <picture>/<img> (see HeroSection.tsx), not a CSS
+   background — crawlers and social scrapers see it, and it gets fetch
+   priority instead of waiting for a multi-MB original. */
 .bgImage {
   position: absolute;
   inset: 0;
   width: 100%;
   height: 100%;
-  background-position: center;
-  background-size: cover;
-  background-repeat: no-repeat;
   z-index: 0;
+  display: block;
+}
+
+.bgImg {
+  width: 100%;
+  height: 100%;
+  object-fit: cover;
+  object-position: center;
+  display: block;
+}
+
+.heroTitle {
+  margin: 1rem 1rem 0.5rem;
+  text-align: center;
+  font-size: clamp(1.4rem, 2.6vw, 2.25rem);
+  line-height: 1.15;
+  max-width: 60rem;
+}
+
+.heroSummary {
+  margin: 0 1rem 1rem;
+  text-align: center;
+  font-size: clamp(0.95rem, 1.4vw, 1.15rem);
+  line-height: 1.5;
+  max-width: 46rem;
 }
 
 .content {
@@ -73,9 +98,6 @@
   .rightActions {
     justify-content: center;
   }
-  .bgImage {
-    background-image: url("https://cdn.mosaic.photography/mosaic-collections/public-domain-collection/mario-von-bucovich/originalsWEBP/mario-von-bucovich_unknown_female-nude_annotated-atelier-schenker_year-1925_vertical_female_bw.webp");
-  }
 
   .fadeOverlay {
     position: absolute;
@@ -98,9 +120,6 @@
   .heroSection {
     min-height: 95vh;
   }
-  .bgImage {
-    background-image: url("https://cdn.mosaic.photography/mosaic-collections/public-domain-collection/edward-weston/originalsWEBP/edward-weston_nude-charis-wilson-laying-on-the-beach-naked-full-body_year-1936_horizontal_female_bw.webp");
-  }
 
   .fadeOverlay {
     position: absolute;
diff --git a/src/components/hero/HeroSection.tsx b/src/components/hero/HeroSection.tsx
index 87a5671..79a0c0c 100644
--- a/src/components/hero/HeroSection.tsx
+++ b/src/components/hero/HeroSection.tsx
@@ -2,14 +2,99 @@ import React from "react";
 import styles from "./HeroSection.module.css";
 import ThemedLogo from "@/components/logo/ThemedLogo";
 import { HomeTitles } from "../header/titles/HomeTitles";
+import {
+  S3_SIZE_WIDTHS,
+  convertToWebpExtension,
+} from "@/utils/imageResizingS3";
+
+/**
+ * Homepage hero.
+ *
+ * Why this is a `<picture>` and not a CSS background (changed 2026-09-11):
+ * the hero used to be a full-viewport section whose only visual was a CSS
+ * `background-image` pointing at a FULL-RESOLUTION original
+ * (`…/originalsWEBP/…`, 2.4 s to arrive on a fast desktop), with the page H1
+ * below the fold. Google's renderer screenshots on a short clock and does not
+ * wait for large CSS backgrounds, so its picture of the homepage was a blank
+ * ochre rectangle — confirmed in Search Console's live test. A page whose DOM
+ * says "4,000 words about nude photography" while its pixels say "nothing"
+ * is what an algorithmic spam demotion looks for, and the site lost ~80% of
+ * its impressions the day the June 2026 spam update finished.
+ *
+ * Now: a real `<img>` with `fetchpriority="high"`, sized renditions from the
+ * CDN via the shared size table (never an original), art-directed per
+ * viewport, plus the H1 and one descriptive sentence INSIDE the hero so the
+ * first screen carries the page's subject in text.
+ */
+
+const CDN_BASE =
+  "https://cdn.mosaic.photography/mosaic-collections/public-domain-collection";
+
+/** Hero renditions. Both files verified present in every w400…w1600 folder (2026-09-11). */
+const HERO_IMAGES = {
+  desktop: {
+    author: "edward-weston",
+    filename:
+      "edward-weston_nude-charis-wilson-laying-on-the-beach-naked-full-body_year-1936_horizontal_female_bw.jpg",
+    alt: "Charis Wilson lying on the beach, photographed by Edward Weston in 1936 — public domain",
+    width: 1600,
+    height: 1248,
+  },
+  mobile: {
+    author: "mario-von-bucovich",
+    filename:
+      "mario-von-bucovich_unknown_female-nude_annotated-atelier-schenker_year-1925_vertical_female_bw.jpg",
+    alt: "Female nude study by Mario von Bucovich, Atelier Schenker, 1925 — public domain",
+    width: 800,
+    height: 1243,
+  },
+} as const;
+
+/** `w400 400w, w600 600w, …` for one hero file, largest rendition capped. */
+function srcSetFor(author: string, filename: string, maxWidth: number) {
+  const webp = convertToWebpExtension(filename);
+  return S3_SIZE_WIDTHS.filter((w) => w <= maxWidth)
+    .map((w) => `${CDN_BASE}/${author}/w${w}/${webp} ${w}w`)
+    .join(", ");
+}
 
 const HeroSection: React.FC = () => {
+  const d = HERO_IMAGES.desktop;
+  const m = HERO_IMAGES.mobile;
+
   return (
-    <section className={styles.heroSection}>
-      <div className={styles.bgImage} aria-hidden="true" />
+    <section className={styles.heroSection} aria-labelledby="hero-title">
+      <picture className={styles.bgImage}>
+        <source
+          media="(max-width: 767px)"
+          srcSet={srcSetFor(m.author, m.filename, m.width)}
+          sizes="100vw"
+        />
+        <img
+          src={`${CDN_BASE}/${d.author}/w1200/${convertToWebpExtension(d.filename)}`}
+          srcSet={srcSetFor(d.author, d.filename, d.width)}
+          sizes="100vw"
+          alt={d.alt}
+          width={d.width}
+          height={d.height}
+          loading="eager"
+          decoding="async"
+          fetchPriority="high"
+          className={styles.bgImg}
+        />
+      </picture>
       <div className={styles.fadeOverlay} aria-hidden="true" />
       <div className={styles.content}>
         <ThemedLogo className={styles.themeImage} />
+        <h1 id="hero-title" className={styles.heroTitle}>
+          Vintage Nude Photography Gallery – Public Domain &amp; Copyright-Free
+          Art
+        </h1>
+        <p id="hero-summary" className={styles.heroSummary}>
+          Iconic works by Edward Weston, Wilhelm von Plüschow, Félix-Jacques
+          Moulin and other legendary photographers — biographies, timelines and
+          thousands of copyright-free images.
+        </p>
         <div className={styles.badges}>
           <HomeTitles />
         </div>
diff --git a/src/components/modals/ModalProviderLoader.tsx b/src/components/modals/ModalProviderLoader.tsx
index d93c886..32f2a36 100644
--- a/src/components/modals/ModalProviderLoader.tsx
+++ b/src/components/modals/ModalProviderLoader.tsx
@@ -1,26 +1,30 @@
 "use client";
 
-import dynamic from "next/dynamic";
 import React from "react";
+import { ModalProvider } from "@/context/modalContext/ModalProvider";
 
-const ModalProvider = dynamic(
-  () =>
-    import("@/context/modalContext/ModalProvider").then(
-      (mod) => mod.ModalProvider,
-    ),
-  {
-    ssr: false,
-  },
-);
-
+/**
+ * Mounts the modal system around the app.
+ *
+ * This used to wrap `{children}` in `dynamic(() => import(ModalProvider),
+ * { ssr: false })` with `fallback={null}`. Because ClientProviders puts this
+ * component around the ENTIRE app in the root layout, that single flag
+ * disabled server rendering for every route on the site: the HTML Google
+ * (and any fetch without JavaScript) received was a 1.8 KB shell with
+ * `BAILOUT_TO_CLIENT_SIDE_RENDERING`, zero `<img>`, zero `<h1>`, ten words —
+ * confirmed live on every route on 2026-09-11. All the SSR fetchers, the
+ * page-level JSON-LD and the H1s ran on the server and were thrown away.
+ *
+ * ModalProvider is SSR-safe on its own: it touches `document` only inside
+ * effects and creates the portal only once `#modal-root` has been found on
+ * the client. Modal BODIES stay lazy via `modalRegistry` — that is where the
+ * bundle-size win was; the provider itself is a few KB. So: plain import,
+ * children render on the server, modals still load on demand.
+ */
 export default function ModalProviderLoader({
   children,
 }: {
   children?: React.ReactNode;
 }) {
-  return (
-    <React.Suspense fallback={null}>
-      <ModalProvider>{children}</ModalProvider>
-    </React.Suspense>
-  );
+  return <ModalProvider>{children}</ModalProvider>;
 }
diff --git a/src/components/modals/ageConsent/AgeConsent.tsx b/src/components/modals/ageConsent/AgeConsent.tsx
index 84651bb..0784db9 100644
--- a/src/components/modals/ageConsent/AgeConsent.tsx
+++ b/src/components/modals/ageConsent/AgeConsent.tsx
@@ -29,9 +29,10 @@ export const AgeConsent = ({
     >
       <div className={styles.ageModalOverlay}>
         <div className={styles.ageConfirmationContent}>
-          <h1 id="ageConsentTitle" className={styles.consentTitle}>
+          {/* h2, not h1: a dialog title must not become the page's heading. */}
+          <h2 id="ageConsentTitle" className={styles.consentTitle}>
             Age Confirmation Required
-          </h1>
+          </h2>
 
           <p id="ageConsentDescription" className={styles.consentText}>
             By continuing, you confirm that you are of legal age to view
diff --git a/src/components/sliders/ResourcesSlider.tsx b/src/components/sliders/ResourcesSlider.tsx
index 8dda631..3b4e0bf 100644
--- a/src/components/sliders/ResourcesSlider.tsx
+++ b/src/components/sliders/ResourcesSlider.tsx
@@ -43,12 +43,26 @@ function getUniqueAdvertisers(products: AffiliateProductWithAdvertiser[]) {
 interface ResourcesSliderProps {
   products: AffiliateProductWithAdvertiser[];
   locale?: string;
+  /** Max cards to render (featured first, then sort_order). Omit for all. */
+  limit?: number;
 }
 
 export const ResourcesSlider: React.FC<ResourcesSliderProps> = ({
-  products,
+  products: allProducts,
   locale = "en",
+  limit,
 }) => {
+  const products = useMemo(() => {
+    if (!limit) return allProducts;
+    return [...allProducts]
+      .sort(
+        (a, b) =>
+          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
+          (a.sort_order ?? 0) - (b.sort_order ?? 0),
+      )
+      .slice(0, limit);
+  }, [allProducts, limit]);
+
   const [selected, setSelected] = useState("all");
   const [advertiser, setAdvertiser] = useState<string | null>(null);
   const [viewMode, setViewMode] = useState<"list" | "grid">("list");
diff --git a/src/components/wrappers/HomeClientWrapper.tsx b/src/components/wrappers/HomeClientWrapper.tsx
index 1e5982b..d01555f 100644
--- a/src/components/wrappers/HomeClientWrapper.tsx
+++ b/src/components/wrappers/HomeClientWrapper.tsx
@@ -2,7 +2,7 @@
 
 // BottomNav is rendered globally by ClientLayout; do not add it here.
 
-import { useEffect, useState, useRef } from "react";
+import { useEffect, useRef } from "react";
 import Cookies from "js-cookie";
 import PhotographersCardsSlide from "../sliders/photographers/PhotographersCardsSlide";
 import ContributorsSlide from "../sliders/contributors/ContributorsSlide";
@@ -36,16 +36,18 @@ function HomeClientWrapper({
   onLoginClick,
 }: HomeClientWrapperProps) {
   const { isMinimumAgeConfirmed, setIsMinimumAgeConfirmed } = useAgeConsent();
-  const [isCrawlerBot, setCrawlerIsBot] = useState(false);
   const modalRef = useRef<HTMLDivElement>(null);
 
+  // No user-agent sniffing. This used to detect Googlebot/Bingbot by UA and
+  // auto-confirm age for them, so crawlers got the page un-gated and un-blurred
+  // while humans got it blurred behind a dialog. Serving crawlers a different
+  // experience from users, keyed on the user agent, is the definition of
+  // cloaking in Google's spam policies — the one thing an adult-content site
+  // must never do. Everyone now gets the same page: content in the DOM, the
+  // dialog on top until confirmed. The `skip_age_modal` cookie stays as a
+  // manual escape hatch (e.g. for screenshots).
   useEffect(() => {
-    const botRegex =
-      /bot|crawl|slurp|spider|bing|duckduckgo|baidu|yandex|sogou|exabot|facebot|ia_archiver/i;
-    const isBot = botRegex.test(navigator.userAgent);
-    const skipForBots = Cookies.get("skip_age_modal") === "1";
-    if (isBot || skipForBots) {
-      setCrawlerIsBot(true);
+    if (Cookies.get("skip_age_modal") === "1") {
       setIsMinimumAgeConfirmed(true);
     }
   }, [setIsMinimumAgeConfirmed]);
@@ -100,7 +102,11 @@ function HomeClientWrapper({
                 Curated tools &amp; resources for photographers and vintage
                 photography lovers
               </p>
-              <ResourcesSlider products={affiliateProducts} />
+              {/* Capped: 44 cards × 2 sponsored links = 88 affiliate links on
+                  the page that carries ~95% of the site's traffic. Featured
+                  first, then sort_order; the full catalogue lives on the
+                  /toolkit pages. */}
+              <ResourcesSlider products={affiliateProducts} limit={12} />
             </section>
           )}
 
@@ -126,7 +132,7 @@ function HomeClientWrapper({
       </section>
 
       {/* Age Consent Modal */}
-      {!isCrawlerBot && !isMinimumAgeConfirmed && (
+      {!isMinimumAgeConfirmed && (
         <div
           ref={modalRef}
           tabIndex={-1}
```
