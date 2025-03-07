import React from "react";
import styles from "./terms-of-service.module.css";

const TermsOfService: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Terms of Service</h1>
      <h2 className={styles.subtitle}>Use of Images</h2>
      <p className={styles.text}>
        This website is a gallery of images sourced from the internet. If you
        are a photographer and see your images on this site and would like them
        to be removed, please contact me, and I will promptly remove them.
      </p>
      <p className={styles.text}>
        Conversely, if you are a photographer and would like to see your
        pictures featured in the mosaic, please feel free to reach out to me at{" "}
        <a href="mailto:carles@crix.design">carles@crix.design</a>.
      </p>
      <p className={styles.text}>
        Thank you for your understanding and support.
      </p>
      <h2 className={styles.subtitle}>Disclaimer</h2>
      <p className={styles.text}>
        We do not claim ownership of the images displayed on this website. All
        images are the property of their respective owners.
      </p>
      <h2 className={styles.subtitle}>Contact</h2>
      <p className={styles.text}>
        If you have any questions or concerns about our terms of service, please
        contact me at <a href="mailto:carles@crix.design">carles@crix.design</a>
        .
      </p>
    </div>
  );
};

export default TermsOfService;
