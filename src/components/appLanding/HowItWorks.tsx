import styles from "./appLanding.module.css";

export default function HowItWorks() {
  return (
    <section className={styles.howItWorks} aria-labelledby="how-title">
      <h2 id="how-title">How Mosaic Works</h2>
      <ol>
        <li>
          Open the app and browse curated collections or search by artist.
        </li>
        <li>
          Tap an image to view details, historical context, and download
          options.
        </li>
        <li>Save favorites, share with attribution, or export for print.</li>
      </ol>
    </section>
  );
}
