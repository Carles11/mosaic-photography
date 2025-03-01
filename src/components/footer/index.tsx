import React from "react";
import styles from "./footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div className={styles.footerItem}>
          <p>&copy; 2025 Mosaic Photography Gallery</p>
        </div>
        <div className={styles.footerItem}>
          <a href="/legal/privacy-policy">Privacy Policy</a>
        </div>
        <div className={styles.footerItem}>
          <a href="/legal/terms-of-service">Terms of Service</a>
        </div>
        <div className={styles.footerItem}>
          <a href="/legal/credits">Credits</a>
        </div>
        <div className={styles.footerItem}>
          <p>
            Created by{" "}
            <a
              href="https://www.rio-frances.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Carles del Río Francés
            </a>{" "}
            |
            <a
              href="https://github.com/Carles11"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              GitHub
            </a>{" "}
            |
            <a
              href="https://www.instagram.com/analogue_carles"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              Instagram
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
