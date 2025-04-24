import React from "react";
import styles from "./Titles.module.css";

export const AuthorCardTitles = () => {
  return (
    <>
      {/* SEO-friendly content for the photographers list */}
      <h1 className={styles.centerText}>
        Meet the iconic photographers behind mosaic photography
      </h1>
      <h2 className={styles.centerText}>
        Learn about the masters of vintage nude photography
      </h2>
      <p className={styles.centerText}>
        Dive into the lives and works of legendary photographers who shaped the
        world of classic nude photography. Discover their stories and artistic
        journeys.
      </p>
    </>
  );
};
