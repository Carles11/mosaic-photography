"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import styles from "./CookieConsentBanner.module.css";

const COOKIE_NAME = "cookie_consent";

type CookieConsentEvent = {
  event: "cookie_consent";
  consent: boolean;
  timestamp: number;
  [key: string]: unknown;
};

type DataLayerItem = CookieConsentEvent | Record<string, unknown>;

export default function CookieConsentBanner(): React.ReactElement | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get(COOKIE_NAME);
    if (!consent) setVisible(true);
  }, []);

  const pushDataLayer = (consent: boolean): void => {
    try {
      // Use a local typed view of window.dataLayer to avoid conflicting with ambient types.
      const win = window as unknown as { dataLayer?: DataLayerItem[] };

      const payload: CookieConsentEvent = {
        event: "cookie_consent",
        consent,
        timestamp: Date.now(),
      };

      const existing = win.dataLayer ?? [];
      existing.push(payload);
      win.dataLayer = existing;

      console.debug("[CookieConsentBanner] dataLayer push:", payload);
    } catch (err) {
      // do not break on errors
      console.warn("[CookieConsentBanner] dataLayer push failed", err);
    }
  };

  const notifyChange = (granted: boolean): void => {
    try {
      if (granted) window.dispatchEvent(new Event("cookie-consent-granted"));
      else window.dispatchEvent(new Event("cookie-consent-declined"));

      // generic change event that AnalyticsLoader listens for
      window.dispatchEvent(new Event("cookie-consent-changed"));

      console.debug(
        "[CookieConsentBanner] dispatched consent events:",
        granted,
      );
    } catch (err) {
      console.warn("[CookieConsentBanner] dispatch failed", err);
    }
  };

  const handleAccept = (): void => {
    Cookies.set(COOKIE_NAME, "true", { expires: 365 });
    setVisible(false);

    // push to dataLayer (so GTM/Preview can capture it) and notify other code
    pushDataLayer(true);
    notifyChange(true);
  };

  const handleDecline = (): void => {
    Cookies.set(COOKIE_NAME, "false", { expires: 365 });
    setVisible(false);

    // push to dataLayer and notify so AnalyticsLoader revokes analytics
    pushDataLayer(false);
    notifyChange(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite">
      <span className={styles.text}>
        This site uses cookies and tracking technologies (Google Analytics and
        Microsoft Clarity) to understand website usage and improve your
        experience. No personal data is collected or shared with third parties.{" "}
        <a href="/legal/privacy-policy" className="fancy-link">
          Learn more
        </a>
        .
      </span>
      <div className={styles.buttonsSection}>
        <button onClick={handleAccept} className={styles.accept}>
          Accept
        </button>
        <button onClick={handleDecline} className={styles.decline}>
          Decline
        </button>
      </div>
    </div>
  );
}
