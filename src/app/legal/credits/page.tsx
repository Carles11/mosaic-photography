"use client";

import React from "react";
import styles from "./credits.module.css";

const Credits: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>This is a thank you page</h1>

      <h2 className={styles.subtitle}>Logo Credits</h2>
      <p className={styles.text}>
        The mosaic logo was created for free using{" "}
        <a href="https://logo.com" title="Logo.com">
          Logo.com
        </a>
        .
      </p>
      <h2 className={styles.subtitle}>Icon Credits</h2>
      <p className={styles.text}>
        The icons used on this website are sourced from various free icon
        libraries. We would like to thank the creators of these icons for their
        work.
      </p>

      <ul className={styles.list}>
        <li>
          <a
            href="https://www.flaticon.com/free-icons/author"
            title="author icons"
          >
            Author icons created by Freepik - Flaticon
          </a>
        </li>
        <li>
          <a
            href="https://www.flaticon.com/free-icons/mosaic"
            title="mosaic icons"
          >
            Mosaic icons created by Freepik - Flaticon
          </a>
        </li>
        <li>
          <a
            href="https://www.flaticon.com/free-icons/close"
            title="close icons"
          >
            Close icons created by Uniconlabs - Flaticon
          </a>
        </li>
        <li>
          <a href="https://favicon.io/" title="mosaic favicons">
            Mosaic favicons created by favicon.io
          </a>
        </li>
      </ul>
      <div className={styles.kofiWidgetContainer}>
        <p>
          Hi, I&apos;m{" "}
          <a href="https://www.rio-frances.com" title="Carles">
            Carles
          </a>
          , the creator of mosaic.photography. This site is a labor of love to
          photography, and your support helps cover the costs of hosting and
          development, allowing me to continue providing valuable content for
          free. If you find my work helpful, please consider buying me a coffee.
        </p>
        <p>Thank you for your support!</p>
        <iframe
          id="kofiframe"
          src="https://ko-fi.com/carlesdelriofrances/?hidefeed=true&widget=true&embed=true&preview=true"
          style={{
            border: "none",
            width: "auto",
            padding: "4px",
            background: "transparent",
          }}
          height="712"
          title="carlesdelriofrances"
        ></iframe>
      </div>
    </div>
  );
};

export default Credits;
