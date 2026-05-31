import RioFrancesLink from "./RioFrancesLink";

import styles from "./footer.module.css";
import FooterAppBanner from "@/components/appBanner/FooterAppBanner";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div className={styles.footerItem}>
          <p>&copy; {currentYear} Mosaic Photography Gallery</p>
          <p>
            <a href="/legal/privacy-policy" className="fancy-link">
              Privacy Policy
            </a>{" "}
            |{" "}
            <a href="/legal/terms-of-service" className="fancy-link">
              Terms of Service
            </a>{" "}
            |{" "}
            <a href="/legal/credits" className="fancy-link">
              Thank you
            </a>{" "}
            |{" "}
            <a href="/faq" className="fancy-link">
              {" "}
              FAQs
            </a>{" "}
            |{" "}
            <a href="/about" className="fancy-link">
              About
            </a>
          </p>
          <p>
            Official project social:{" "}
            <a
              href="https://www.instagram.com/mosaic.photography.gallery"
              className="fancy-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>{" "}
            |{" "}
            <a
              href="https://www.facebook.com/mosaic.photography.gallery"
              className="fancy-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </p>
        </div>
        <div className={styles.footerItem}>
          <p>Created by</p>
          <span className="fancy-link">
            <RioFrancesLink />
          </span>
          <span className={styles.separator}> | </span>
          <a
            className="fancy-link"
            href="https://github.com/Carles11"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <span className={styles.separator}> | </span>
          <a
            className="fancy-link"
            href="https://www.instagram.com/analogue_carles"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <div className={styles.footerBadgeItem}>
            <FooterAppBanner />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
