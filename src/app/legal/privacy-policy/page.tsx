import React from "react";
import styles from "./privacy-policy.module.css";

// overwrwite metadata for this page

export const metadata = {
  title: "Privacy Policy - Mosaic Photography",
  description:
    "Learn about Mosaic Photography's privacy practices and how we handle your data.",
  openGraph: {
    title: "Privacy Policy - Mosaic Photography",
    description:
      "Learn about Mosaic Photography's privacy practices and how we handle your data.",
    images: ["https://example.com/og-image.jpg"],
  },
  twitter: {
    cardType: "summary_large_image",
    title: "Privacy policy - Mosaic Photography",
    description:
      "Privacy policy page of Mosaic Photography. Learn about Mosaic Photography's privacy practices and how we handle your data.",
    image: "/favicons/favicon.ico",
  },
};

const PrivacyPolicy: React.FC = () => {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Privacy Policy</h1>

      <h2 className={styles.subtitle}>Information Collection</h2>
      <p className={styles.text}>
        We do not collect any personal information from visitors to our website.
        However, we use Google Analytics (via Google Tag Manager) to collect
        non-personal information such as your IP address, browser type, and
        operating system.
      </p>
      <h2 className={styles.subtitle}>Information Use</h2>
      <p className={styles.text}>
        We use the non-personal information collected by Google Analytics to
        improve our website and provide a better user experience.
      </p>
      <h2 className={styles.subtitle}>Information Sharing</h2>
      <p>We don&apos;t share your information with third parties</p>
      <h2 className={styles.subtitle}>Google Tag Manager</h2>
      <p className={styles.text}>
        We use Google Tag Manager to help manage analytics and tracking on our
        website. Google Tag Manager itself does not collect personal
        information, but it may deploy tags that collect data for analytics
        purposes and help us improve the user experience. For more information,
        please review Google&apos;s privacy policy.
      </p>
      <h2 className={styles.subtitle}>Contact</h2>
      <p className={styles.text}>
        If you have any questions or concerns about our privacy policy, please
        contact us at <a href="mailto:carles@crix.design">carles@crix.design</a>
        .
      </p>
    </section>
  );
};

export default PrivacyPolicy;
