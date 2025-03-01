import React from "react";
import styles from "./terms-of-service.module.css";

const TermsOfService: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Terms of Service</h1>
      <p className={styles.text}>
        Welcome to Mosaic Photography Gallery. By using our website, you agree
        to the following terms and conditions.
      </p>
      <h2 className={styles.subtitle}>Use of Images</h2>
      <p className={styles.text}>
        The images displayed on this website are sourced from various
        photographers found on the internet. We do not have consent from the
        photographers to use these images. If you are a photographer and would
        like your images and yourself to be removed from our gallery, please
        contact us at <a href="mailto:carles@crix.design">carles@crix.design</a>
        .
      </p>
      <h2 className={styles.subtitle}>Disclaimer</h2>
      <p className={styles.text}>
        We do not claim ownership of the images displayed on this website. All
        images are the property of their respective owners.
      </p>
      <h2 className={styles.subtitle}>Contact</h2>
      <p className={styles.text}>
        If you have any questions or concerns about our terms of service, please
        contact us at <a href="mailto:carles@crix.design">carles@crix.design</a>
        .
      </p>
    </div>
  );
};

export default TermsOfService;
