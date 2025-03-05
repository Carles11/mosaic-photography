import React from "react";
import styles from "./privacy-policy.module.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.text}>
        This privacy policy explains how we collect, use, and share your
        personal information when you use our website.
      </p>
      <h2 className={styles.subtitle}>Information Collection</h2>
      <p className={styles.text}>
        We do not collect any personal information from visitors to our website.
        However, we use Vercel Analytics to collect non-personal information
        such as your IP address, browser type, and operating system.
      </p>
      <h2 className={styles.subtitle}>Information Use</h2>
      <p className={styles.text}>
        We use the non-personal information collected by Vercel Analytics to
        improve our website and provide a better user experience.
      </p>
      <h2 className={styles.subtitle}>Information Sharing</h2>
      <p className={styles.text}>
        We do not share any personal information with third parties. However,
        Vercel Analytics may share non-personal information with third parties
        for the purpose of improving our website.
      </p>
      <h2 className={styles.subtitle}>Contact</h2>
      <p className={styles.text}>
        If you have any questions or concerns about our privacy policy, please
        contact us at <a href="mailto:carles@crix.design">carles@crix.design</a>
        .
      </p>
    </div>
  );
};

export default PrivacyPolicy;
