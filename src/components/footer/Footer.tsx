import React from "react";
import styles from "./footer.module.css";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div className={styles.footerItem}>
          <p>&copy; {currentYear} Mosaic Photography Gallery</p>
          <p>
            <a href="/legal/privacy-policy">Privacy Policy</a> |{" "}
            <a href="/legal/terms-of-service">Terms of Service</a> |{" "}
            <a href="/legal/credits">Credits</a>
          </p>
        </div>{" "}
        <div className={styles.footerItem}>
          <p>Created by </p>
          <p>
            <a
              href="https://www.rio-frances.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Carles del Río Francés
            </a>{" "}
            |{" "}
            <a
              href="https://github.com/Carles11"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{" "}
            |{" "}
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
