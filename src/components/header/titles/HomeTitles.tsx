import styles from "./Titles.module.css";

export const HomeTitles = () => {
  return (
    <div className={styles.homeTitleGrid}>
      <div className={styles.homeTitleGridItemLeft}>
        <h1 className={styles.mainTitle}>VINTAGE NUDE PHOTOGRAPHY</h1>
        <h2 className={styles.subTitle}>
          A curated gallery of classic nude photography in the public domain
        </h2>
      </div>
      <div className={styles.homeTitleGridItemRight}>
        <h2 className={styles.subTitle}>
          <a href="#gallery-section">ALL PHOTOS</a>
        </h2>
      </div>
    </div>
  );
};
