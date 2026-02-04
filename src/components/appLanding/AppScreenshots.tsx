import Image from "next/image";
import styles from "./appLanding.module.css";
import type { Screenshot } from "@/types/app";

const screenshots: Screenshot[] = [
  {
    src: "/screenshots/Android-10-inch-tablet/main-gallery-home-tablet-10inch.png",
    alt: "Mosaic app — tablet gallery view",
    caption: "Browse curated collections on tablet.",
    width: 1200,
    height: 800,
  },
  {
    src: "/screenshots/Apple-iPhone-16-Pro-Max/Apple-iPhone-16-Pro-Max-Screenshot1.png",
    alt: "Mosaic app — iPhone photo view",
    caption: "High-resolution image viewer with metadata.",
    width: 1290,
    height: 2796,
  },
  {
    src: "/screenshots/Android-Samsung-Galaxy-S21-Ultra/Samsung-Galaxy-S21-Ultra-Screenshot1.png",
    alt: "Mosaic app — Android search by artist",
    caption: "Discover by artist, era, or theme.",
    width: 1440,
    height: 3200,
  },
];

export default function AppScreenshots() {
  return (
    <section aria-labelledby="screenshots-title" className={styles.screenshots}>
      <h2 id="screenshots-title">See Mosaic on Mobile</h2>
      {screenshots.map((s) => (
        <figure key={s.src} className={styles.screenshotCard}>
          <Image
            src={s.src}
            alt={s.alt}
            width={s.width}
            height={s.height}
            sizes="(max-width: 600px) 100vw, 33vw"
            style={{ width: "100%", height: "auto" }}
          />
          <figcaption className={styles.screenshotCaption}>
            {s.caption}
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
