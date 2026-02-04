import Link from "next/link";
import styles from "./appLanding.module.css";

export default function QuickWhy() {
  return (
    <section className={styles.features} aria-labelledby="why-title">
      <h2 id="why-title">Not Just Another Photo App</h2>
      <p>
        Mosaic brings together public-domain photographic treasures you won’t
        easily find elsewhere — organized, curated and contextualized for
        collectors, students, and art lovers. It’s fast, educational, and gives
        you creative freedom with no ads.
      </p>
      <p>
        Questions? Visit our{" "}
        <Link href="/faq" data-gtm="app-landing-faq">
          FAQs
        </Link>{" "}
        for more details.
      </p>
    </section>
  );
}
