import React from "react";
import styles from "./HeroSection.module.css";
import ThemedLogo from "@/components/logo/ThemedLogo";
import { HomeTitles } from "../header/titles/HomeTitles";
import {
  S3_SIZE_WIDTHS,
  convertToWebpExtension,
} from "@/utils/imageResizingS3";

/**
 * Homepage hero.
 *
 * Why this is a `<picture>` and not a CSS background (changed 2026-09-11):
 * the hero used to be a full-viewport section whose only visual was a CSS
 * `background-image` pointing at a FULL-RESOLUTION original
 * (`…/originalsWEBP/…`, 2.4 s to arrive on a fast desktop), with the page H1
 * below the fold. Google's renderer screenshots on a short clock and does not
 * wait for large CSS backgrounds, so its picture of the homepage was a blank
 * ochre rectangle — confirmed in Search Console's live test. A page whose DOM
 * says "4,000 words about nude photography" while its pixels say "nothing"
 * is what an algorithmic spam demotion looks for, and the site lost ~80% of
 * its impressions the day the June 2026 spam update finished.
 *
 * Now: a real `<img>` with `fetchpriority="high"`, sized renditions from the
 * CDN via the shared size table (never an original), art-directed per
 * viewport, plus the H1 and one descriptive sentence INSIDE the hero so the
 * first screen carries the page's subject in text.
 */

const CDN_BASE =
  "https://cdn.mosaic.photography/mosaic-collections/public-domain-collection";

/** Hero renditions. Both files verified present in every w400…w1600 folder (2026-09-11). */
const HERO_IMAGES = {
  desktop: {
    author: "edward-weston",
    filename:
      "edward-weston_nude-charis-wilson-laying-on-the-beach-naked-full-body_year-1936_horizontal_female_bw.jpg",
    alt: "Charis Wilson lying on the beach, photographed by Edward Weston in 1936 — public domain",
    width: 1600,
    height: 1248,
  },
  mobile: {
    author: "mario-von-bucovich",
    filename:
      "mario-von-bucovich_unknown_female-nude_annotated-atelier-schenker_year-1925_vertical_female_bw.jpg",
    alt: "Female nude study by Mario von Bucovich, Atelier Schenker, 1925 — public domain",
    width: 800,
    height: 1243,
  },
} as const;

/** `w400 400w, w600 600w, …` for one hero file, largest rendition capped. */
function srcSetFor(author: string, filename: string, maxWidth: number) {
  const webp = convertToWebpExtension(filename);
  return S3_SIZE_WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${CDN_BASE}/${author}/w${w}/${webp} ${w}w`)
    .join(", ");
}

const HeroSection: React.FC = () => {
  const d = HERO_IMAGES.desktop;
  const m = HERO_IMAGES.mobile;

  return (
    <section className={styles.heroSection} aria-labelledby="hero-title">
      <picture className={styles.bgImage}>
        <source
          media="(max-width: 767px)"
          srcSet={srcSetFor(m.author, m.filename, m.width)}
          sizes="100vw"
        />
        <img
          src={`${CDN_BASE}/${d.author}/w1200/${convertToWebpExtension(d.filename)}`}
          srcSet={srcSetFor(d.author, d.filename, d.width)}
          sizes="100vw"
          alt={d.alt}
          width={d.width}
          height={d.height}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className={styles.bgImg}
        />
      </picture>
      <div className={styles.fadeOverlay} aria-hidden="true" />
      <div className={styles.content}>
        <ThemedLogo className={styles.themeImage} />
        <h1 id="hero-title" className={styles.heroTitle}>
          Vintage Nude Photography Gallery – Public Domain &amp; Copyright-Free
          Art
        </h1>
        <p id="hero-summary" className={styles.heroSummary}>
          Iconic works by Edward Weston, Wilhelm von Plüschow, Félix-Jacques
          Moulin and other legendary photographers — biographies, timelines and
          thousands of copyright-free images.
        </p>
        <div className={styles.badges}>
          <HomeTitles />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
