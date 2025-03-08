"use client";

import React from "react";
import styles from "./credits.module.css";

const Credits: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Thanks</h1>
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
        <li>
          <a href="https://tholman.com/github-corners/" title="GitHub Corners">
            GitHub Corners created by Tim Holman
          </a>
        </li>
      </ul>
      <h2 className={styles.subtitle}>About the creator of Mosaic</h2>
      <div className={styles.kofiWidgetContainer}>
        <p>
          Hi, I&apos;m{" "}
          <a href="https://www.rio-frances.com" title="Carles">
            Carles
          </a>
          , this site is a labor of love for photography and web development.
          Your support helps cover hosting expenses and keeps the content fresh
          and accessible. If you find my work helpful, please consider buying me
          a coffee.
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
      <h2 className={styles.subtitle}>Imprint / Legal Notice</h2>

      <ul className={styles.noBullets}>
        <li>Owner & Operator: Carles del Río Francés</li>
        <li>Address: Elbestrasse 15, 60329 Frankfurt am Main - Deutschland</li>
        <li>
          Email:{" "}
          <a
            href="mailto:carles@crix.design"
            target="_blank"
            rel="noopener noreferrer"
          >
            carles@crix.design
          </a>
        </li>
        <li>
          Website:{" "}
          <a
            href="https://www.rio-frances.com"
            title="Carles del Río Francés"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.rio-frances.com
          </a>
        </li>
        <li>
          Responsible for Content (§ 55 Abs. 2 RStV): Carles del Río Francés{" "}
        </li>
      </ul>
      <p>
        Disclaimer: Despite careful content control, we assume no liability for
        the content of external links. The operators of the linked pages are
        solely responsible for their content.
      </p>
    </div>
  );
};

export default Credits;
