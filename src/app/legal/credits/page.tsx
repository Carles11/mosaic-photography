import React from "react";
import Image from "next/image";
// import PrimaryButton from "@/components/buttons/PrimaryButton";
// import { Tooltip as ReactTooltip } from "react-tooltip";

import styles from "./credits.module.css";

export const metadata = {
  title: "Credits - Mosaic Photography",
  description:
    "Credits page of Mosaic Photography, thanking the creators of logos and icons used, and providing a Ko-fi link for donations.",
  keywords:
    "credits, logo credits, icon credits, donations, Ko-fi, Mosaic Photography",
  openGraph: {
    title: "Credits - Mosaic Photography",
    description:
      "Credits page of Mosaic Photography, thanking the creators of logos and icons used, and providing a Ko-fi link for donations.",
  },
  twitter: {
    cardType: "summary_large_image",
    title: "Credits - Mosaic Photography",
    description:
      "Credits page of Mosaic Photography, thanking the creators of logos and icons used, and providing a Ko-fi link for donations.",
    image: "/favicons/favicon.ico",
  },
};

const Credits: React.FC = () => {
  return (
    <main className={styles.container}>
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
        <h2 className={styles.subtitle}>About me</h2>

        <p className={styles.text}>
          Hi! My name is Carles, I created MOSAIC{" "}
          {/* <PrimaryButton
            id="copyButton"
            className={styles.copyButton}
            btnText="MOSAIC"
            handleClick={() =>
              navigator.clipboard.writeText("https://www.mosaic.photography")
            }
          />{" "} */}
          to be opensource and free. This site reflects my passion for both{" "}
          <a
            href="https://www.instagram.com/analogue_carles/"
            title="Carles' instagram"
          >
            photography
          </a>{" "}
          and{" "}
          <a href="https://www.rio-frances.com" title="Carles' Portfolio">
            web development
          </a>
          . If you enjoy my work, your support helps keep it running—consider
          buying me a coffee!{" "}
        </p>
        <div className={styles.thankYou}>
          <p className={styles.text}>Thank you for your support!</p>
          <a
            href="https://ko-fi.com/Q5Q6R6S40"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              height="36"
              width="144"
              style={{
                border: "0px",
                height: "36px",
                margin: "1rem 0 2rem 0",
              }}
              src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
            />
          </a>
        </div>
        {/* <ReactTooltip
          anchorSelect="#copyButton"
          content="Copy url to clipboard"
        /> */}
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
    </main>
  );
};

export default Credits;
