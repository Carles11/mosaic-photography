"use client";

import React from "react";
import Image from "next/image";
import styles from "./HomeAppBanner.module.css";
import { sendGTMEvent } from "@next/third-parties/google";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/appLinks";
import Link from "next/link";

export default function FooterAppBanner() {
  const handleClick = (platform: "ios" | "android") => {
    try {
      sendGTMEvent({
        event: "app_banner_click",
        platform,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn("[FooterAppBanner] sendGTMEvent failed", err);
    }
  };

  return (
    <div
      className={styles.bannerContainer}
      role="region"
      aria-label="Download the Mosaic mobile app"
    >
      <div className={styles.inner}>
        <div className={styles.badges}>
          <a
            className={`${styles.badgeLink} no-fancy-link`}
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-gtm="app-banner-ios"
            aria-label="Download on the App Store"
            onClick={() => handleClick("ios")}
          >
            <Image
              src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
              alt="Download on the App Store"
              width={135}
              height={40}
              loading="eager"
              unoptimized
            />
          </a>

          <a
            className={`${styles.badgeLink} no-fancy-link`}
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-gtm="app-banner-android"
            aria-label="Get it on Google Play"
            onClick={() => handleClick("android")}
          >
            <Image
              src="/images/GetItOnGooglePlay_Badge_Web_color_English.svg"
              alt="Get it on Google Play"
              width={135}
              height={40}
              loading="eager"
              unoptimized
            />
          </a>
        </div>
        <Link href="/app">Learn more...</Link>
      </div>
    </div>
  );
}
