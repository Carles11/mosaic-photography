import styles from "./appLanding.module.css";

export default function AppFeatures() {
  return (
    <section className={styles.features} aria-labelledby="features-title">
      <h2 id="features-title">Features You’ll Love</h2>
      <ul className={styles.featureList}>
        <li>
          <strong>Curated public-domain images</strong> — rare and artistic
          photographs aggregated from trusted archives.
        </li>
        <li>
          <strong>For download & print</strong> — full public domain, free to
          use.
        </li>
        <li>
          <strong>Fast galleries</strong> — optimized mobile viewing and
          offline-friendly browsing.
        </li>
        <li>
          <strong>Discover by artist, era, or theme</strong> — powerful filters
          for deep exploration.
        </li>
        <li>
          <strong>Multiple download sizes</strong> — originals and print-ready
          exports.
        </li>
        <li>
          <strong>No ads</strong> — an educational, distraction-free experience.
        </li>
      </ul>
    </section>
  );
}
