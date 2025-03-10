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
      <h2 className={styles.subtitle}>Imprint</h2>
      <div className={styles.imprint}>
        <p>
          <strong>Owner:</strong> Carles del Río Francés
        </p>
        <p>
          <strong>Address:</strong> Elbestrasse 15, 60329 Frankfurt am Main,
          Germany
        </p>
        <p>
          <strong>Tax Number:</strong> DE275710941
        </p>
        <p>
          <strong>Commercial Register:</strong> Finanzamt Frankfurt am Main I
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:carles@crix.design">carles@crix.design</a>
        </p>
        <p>
          <strong>Official Website:</strong>{" "}
          <a href="https://www.rio-frances.com" title="Official Website">
            www.rio-frances.com
          </a>
        </p>

        {/* <p>
          <strong>Commercial Register:</strong> Frankfurt am Main, HRB 123456
        </p> */}
        <p>
          <strong>VAT Identification Number:</strong> DE275710941
        </p>
        <p>
          <strong>Authorized Representative:</strong> Carles del Río Francés
        </p>
        <p>
          <strong>Responsible for content according to § 18 MStV:</strong>{" "}
          Carles del Río Francés
        </p>
      </div>
    </div>
  );
};

export default Credits;
