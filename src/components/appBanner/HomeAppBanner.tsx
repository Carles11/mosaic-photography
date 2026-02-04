"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./HomeAppBanner.module.css";
import { sendGTMEvent } from "@next/third-parties/google";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/appLinks";

const COOKIE_NAME = "app_banner_dismissed";

export default function HomeAppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // If the navigation was a reload, clear the stored dismissed flag so
      // the banner reappears after a refresh. sessionStorage normally
      // persists across reloads in the same tab, so remove it on reload.
      try {
        const perfNav = (performance.getEntriesByType &&
          performance.getEntriesByType("navigation")) as
          | PerformanceNavigationTiming[]
          | undefined;
        const navType =
          perfNav &&
          perfNav[0] &&
          (perfNav[0] as PerformanceNavigationTiming).type;
        if (navType === "reload") {
          sessionStorage.removeItem(COOKIE_NAME);
        } else if (
          // fallback for older browsers
          (performance as Performance & { navigation?: { type?: number } })
            .navigation &&
          (performance as Performance & { navigation?: { type?: number } })
            .navigation?.type === 1
        ) {
          sessionStorage.removeItem(COOKIE_NAME);
        }
      } catch (e) {
        // ignore
      }

      const dismissed = sessionStorage.getItem(COOKIE_NAME);
      if (!dismissed) setVisible(true);
    } catch (err) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      // Use sessionStorage so dismissal is per tab/window (reappears in new tabs)
      sessionStorage.setItem(COOKIE_NAME, "1");
    } catch (err) {
      // swallow
    }
    setVisible(false);
  };

  const pushBadgeClick = (platform: "ios" | "android") => {
    try {
      sendGTMEvent({
        event: "app_banner_click",
        platform,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn("[HomeAppBanner] sendGTMEvent failed", err);
    }
  };

  if (!visible) return null;

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
            onClick={() => pushBadgeClick("ios")}
          >
            <Image
              src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
              alt="Download on the App Store"
              width={135}
              height={40}
              priority
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
            onClick={() => pushBadgeClick("android")}
          >
            <Image
              src="/images/GetItOnGooglePlay_Badge_Web_color_English.svg"
              alt="Get it on Google Play"
              width={135}
              height={40}
              priority
              loading="eager"
              unoptimized
            />
          </a>
        </div>

        <button
          className={styles.dismissButton}
          onClick={dismiss}
          aria-label="Dismiss app banner"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
