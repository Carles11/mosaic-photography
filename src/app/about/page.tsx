import { Metadata } from "next";
import styles from "./about.module.css";
import ShareButtons from "@/components/buttons/ShareButtons";

export const metadata: Metadata = {
  title: "About – Mosaic Photography",
  description:
    "Mosaic is a free, ad-free archive of public domain photography from the late 19th and early 20th centuries.",
  openGraph: {
    title: "About – Mosaic Photography",
    description:
      "Mosaic is a free, ad-free archive of public domain photography from the late 19th and early 20th centuries.",
    type: "website",
    url: "https://www.mosaic.photography/about",
  },
  alternates: {
    canonical: "https://www.mosaic.photography/about",
  },
};

const AboutPage = () => {
  const shareUrl = "https://www.mosaic.photography/about";
  const shareText =
    "Learn about Mosaic, a free archive of public domain photography.";
  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>About Mosaic</h1>
      </header>

      <main className={styles.content}>
        {/* What is Mosaic? */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What is Mosaic?</h2>
          <p className={styles.body}>
            Mosaic is a free, ad-free archive of public domain photography —
            images from the late 19th and early 20th centuries, when photography
            was still finding out what it could be. Every image is free to
            browse, download, and share. No strings attached.
          </p>
          <p className={styles.body}>
            Every image in Mosaic is in the public domain: works whose authors
            passed away more than 70 years ago, meaning no copyright applies in
            most jurisdictions in the world. Our primary source is Wikimedia
            Commons, the largest freely licensed media archive on the internet.
          </p>
          <p className={styles.body}>
            Image quality varies by age and origin — these are digitised
            originals, not studio shoots. Most are served at over 3,000 pixels
            on the longest side, which is more than enough to fill any screen or
            make a decent print.
          </p>

          <div className={styles.socialBlock}>
            <a
              href="https://www.instagram.com/mosaic.photography.gallery/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramLink}
            >
              <span className={styles.handle}>@mosaic.photography.gallery</span>
            </a>
            <span className={styles.socialCaption}>
              Follow the archive on Instagram
            </span>
          </div>
        </section>

        {/* Who made this? */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Who made this?</h2>
          <p className={styles.body}>
            I&apos;m Carles — a Spanish developer and hobby analogue
            photographer currently living in Santiago de Chile. I built Mosaic
            because I kept losing track of the photographers and images I loved,
            and nothing out there felt right for this kind of archive.
          </p>
          <p className={styles.body}>
            No team, no funding, no ads. Just my own time and a genuine love for
            old photographs and the people who made them.
          </p>

          <div className={styles.socialBlock}>
            <a
              href="https://www.instagram.com/analogue_carles"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramLink}
            >
              <span className={styles.handle}>@analogue_carles</span>
            </a>
            <span className={styles.socialCaption}>
              My personal analogue photography
            </span>
          </div>
        </section>

        {/* Open source */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Open source</h2>
          <p className={styles.body}>
            Mosaic is fully open source. The code is on GitHub — feel free to
            explore, report issues, or contribute.
          </p>
          <div className={styles.socialBlock}>
            <a
              href="https://github.com/Carles11/mosaic-photography.git"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              github.com/Carles11/mosaic-photography
            </a>
            <span className={styles.socialCaption}>
              Website repository on GitHub
            </span>
          </div>
          <div className={styles.socialBlock}>
            <a
              href="https://github.com/Carles11/mosaic-photography-app.git"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              github.com/Carles11/mosaic-photography-app
            </a>
            <span className={styles.socialCaption}>
              Mobile App repository on GitHub
            </span>
          </div>
        </section>

        {/* Support Mosaic */}
        <section className={`${styles.section} ${styles.supportSection}`}>
          <h2 className={styles.sectionTitle}>Support Mosaic</h2>
          <p className={styles.body}>
            Mosaic is built and maintained by a single independent developer and
            analogue photography enthusiast.
          </p>
          <p className={styles.body}>
            Keeping Mosaic running has a cost — hosting, storage, and more hours
            than I care to count. But Mosaic is free, and ad-free, and I&apos;d
            love to keep it that way. If it&apos;s ever given you a moment worth
            having, a small contribution helps more than you&apos;d think.
          </p>
          <a
            href="https://ko-fi.com/Q5Q6R6S40"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.kofiButton} no-fancy-link`}
          >
            ☕ Support Mosaic on Ko-fi
          </a>
        </section>
        <ShareButtons url={shareUrl} title={shareText} />
      </main>

      <footer className={styles.pageFooter}>
        <p className={styles.footerLine}>
          Mosaic · Free downloads · No ads · Public domain
        </p>
      </footer>
    </div>
  );
};

export default AboutPage;
