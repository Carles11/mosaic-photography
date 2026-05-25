import React from "react";
import styles from "./HeroSection.module.css";
import ThemedLogo from "@/components/logo/ThemedLogo";
import { HomeTitles } from "../header/titles/HomeTitles";

const HeroSection: React.FC = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.bgImage} aria-hidden="true" />
      <div className={styles.fadeOverlay} aria-hidden="true" />
      <div className={styles.content}>
        <ThemedLogo className={styles.themeImage} />
        <div className={styles.badges}>
          <HomeTitles />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
