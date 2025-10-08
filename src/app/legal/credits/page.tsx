import Image from "next/image";

import styles from "./credits.module.css";

// overwrwite metadata for this page

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
    <section className={styles.container}>
      <h1 className={styles.title}>Thanks</h1>

      <h2 className={styles.subtitle}>Logo credits</h2>
      <p className={styles.text}>
        The mosaic logo was created for free using{" "}
        <a href="https://logo.com" title="Logo.com">
          Logo.com
        </a>
        .
      </p>
      <h2 className={styles.subtitle}>Image optimization credits</h2>
      <p className={styles.text}>
        All images in the mosaic gallery were optimized into webp format for
        free using{" "}
        <a href="https://towebp.io/" title="towebp.io">
          towebp.io
        </a>
        .
      </p>
      <h2 className={styles.subtitle}>Image processing credits</h2>
      <p className={styles.text}>
        The image resizing and optimization functionality on this website is
        powered by{" "}
        <a
          href="https://sharp.pixelplumbing.com/"
          title="Sharp - High performance Node.js image processing"
        >
          Sharp
        </a>
        , a high-performance Node.js image processing library. We thank the
        Sharp team for creating this excellent tool that ensures optimal
        performance and quality.
      </p>
      <h2 className={styles.subtitle}>Font Credits</h2>
      <p className={styles.text}>
        The font used on this website, Trade Gothic, was downloaded for free
        from{" "}
        <a
          href="https://www.dafontfree.io/download/trade-gothic/"
          title="Trade Gothic font on dafontfree.io"
        >
          dafontfree.io
        </a>
        . We would like to thank them for providing this resource.
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
            className="fancy-link"
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
        {/* <li>
          <a href="https://tholman.com/github-corners/" title="GitHub Corners">
            GitHub Corners created by Tim Holman
          </a>
        </li> */}
      </ul>
      <div className={styles.kofiWidgetContainer}>
        <h2 className={styles.subtitle}>About me</h2>

        <p className={styles.text}>
          Hi! My name is Carles, I created MOSAIC.PHOTOGRAPHY. This site
          reflects my passion for both{" "}
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
              priority={false} // Set to true for critical images
              loading="lazy"
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
          <a href="mailto:carles@rio-frances.com">carles@rio-frances.com</a>
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
    </section>
  );
};

export default Credits;
