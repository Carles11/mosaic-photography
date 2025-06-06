import styles from "./Titles.module.css";

export const HomeTitles = () => {
  return (
    <div>
      <div>
        <h1 className={styles.mainTitle}>
          Vintage Nude Photography Gallery – Public Domain & Copyright-Free Art
        </h1>

        <div className={styles.homeTitleGrid}>
          <p className={styles.subTitle}>
            Each image is copyright-free, open access, and in the public domain.
            Download high-resolution vintage photographs, all available for
            personal and commercial use.
          </p>
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
    </div>
  );
};
