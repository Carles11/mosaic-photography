import styles from "./Titles.module.css";

export const HomeTitles = () => {
  return (
    <div>
      <h1 className={styles.mainTitle}>
        Vintage Nude Photography Gallery – Public Domain & Copyright-Free Art
      </h1>

      <div className={styles.homeTitleGrid}>
        <h2 className={styles.subTitle}>
          Explore iconic works by legendary photographers who shaped the history
          of nude art and nude photography.
        </h2>
        <div className={styles.homeTitleGridItemRight}>
          <h2 className={styles.subTitle}>
            <a
              href="#gallery-section"
              title="View the full collection of vintage nude photos"
            >
              BROWSE ALL PHOTOS
            </a>
          </h2>
        </div>
      </div>
    </div>
  );
};
