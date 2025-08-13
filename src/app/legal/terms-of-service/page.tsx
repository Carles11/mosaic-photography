import React from "react";
import styles from "./terms-of-service.module.css";

// overwrwite metadata for this page
export const metadata = {
  title: "Terms of Service - Mosaic Photography",
  description:
    "Read the terms of service for using Mosaic Photography's website and services.",
  openGraph: {
    title: "Terms of Service - Mosaic Photography",
    description:
      "Read the terms of service for using Mosaic Photography's website and services.",
    images: ["https://example.com/og-image.jpg"],
  },
  twitter: {
    cardType: "summary_large_image",
    title: "Terms of service - Mosaic Photography",
    description:
      "Terms of service page of Mosaic Photography. Read the terms of service for using Mosaic Photography's website and services.",
    image: "/favicons/favicon.ico",
  },
};

const TermsOfService: React.FC = () => {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Terms of Service</h1>
      <h2 className={styles.subtitle}>Use of Images</h2>
      <p className={styles.text}>
        This website primarily features vintage nude images that are in the
        public domain, sourced from platforms like{" "}
        <a
          href="https://commons.wikimedia.org/wiki/Main_Page"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wikimedia Commons
        </a>
        . If other images are displayed, it means that explicit permission has
        been obtained from the copyright owner. If you believe an image has been
        used improperly, please contact me, and I will address the issue
        promptly.
      </p>

      <h2 className={styles.subtitle}>Disclaimer</h2>
      <p className={styles.text}>
        We do not claim ownership of the images displayed on this website. All
        images are the property of their respective owners or, in most cases,
        public domain.
      </p>
      <h2 className={styles.subtitle}>Contact</h2>
      <p className={styles.text}>
        If you have any questions or concerns about our terms of service, please
        contact me at <a href="mailto:carles@crix.design">carles@crix.design</a>
        .
      </p>
      <h2 className={styles.subtitle}>Affiliate links</h2>
      <p className={styles.text}>
        Some of the links provided under &quot;Make it yours&quot; section may
        be affiliate links, meaning I may earn a small commission from the store
        if you make a purchase through them. This helps support my work at no
        additional cost to you.
      </p>
      <p>
        By accessing this website, you agree to our &quot;Terms of Service&quot;
      </p>
    </section>
  );
};

export default TermsOfService;
