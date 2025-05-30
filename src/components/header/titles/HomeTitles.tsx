import React from "react";
import styles from "./Titles.module.css";

export const HomeTitles = () => {
  return (
    <>
      {/* SEO-friendly content for the image gallery */}
      <h1 className={styles.centerText}>
        VINTAGE NUDE PHOTOGRAPHY in the public domain
      </h1>
      <h2 className={styles.centerText}>
        A curated gallery of classic nude photography
      </h2>
      <p className={styles.centerText}>
        Discover a stunning collection of classic nude photography from
        legendary photographers, now in the public domain.
      </p>
    </>
  );
};
