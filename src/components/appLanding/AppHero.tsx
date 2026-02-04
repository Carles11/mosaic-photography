import Image from "next/image";
import Link from "next/link";
import styles from "./appLanding.module.css";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/appLinks";

export default function AppHero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <h1 className={styles.headline}>
          Mosaic — Iconic Vintage Nude Photography, Now On Your Phone
        </h1>
        <p className={styles.lead}>
          Explore world-class, rare, high-res public domain images—free, easy,
          and always in your pocket.
        </p>

        <div className={styles.badgesRow}>
          <a
            href={APP_STORE_URL}
            className="no-fancy-link"
            data-gtm="app-landing-ios"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download on the App Store"
          >
            <Image
              src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
              alt="Download on the App Store"
              width={140}
              height={40}
              priority
              loading="eager"
              unoptimized
            />
          </a>

          <a
            href={PLAY_STORE_URL}
            className="no-fancy-link"
            data-gtm="app-landing-android"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get it on Google Play"
          >
            <Image
              src="/images/GetItOnGooglePlay_Badge_Web_color_English.svg"
              alt="Get it on Google Play"
              width={140}
              height={40}
              priority
              loading="eager"
              unoptimized
            />
          </a>
        </div>
        <div className={styles.qrRow}>
          <p className={styles.lead}>Scan to download the app:</p>
          <Link
            href="/app"
            aria-label="App landing QR"
            data-gtm="app-landing-qr"
            className="no-fancy-link"
          >
            <span className={styles.qr}>
              <Image
                src="/images/QR/Mosaic-photography-app-play-store-qr-code-mobile-2048px.svg"
                alt="QR code linking to Mosaic app download page"
                width={125}
                height={125}
                unoptimized
                loading="eager"
              />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
