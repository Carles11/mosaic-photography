/**
 * Custom Cookie Consent Banner
 * - Shows a banner until user gives or declines consent
 * - Sets a cookie for persistence
 * - On "Accept", updates GTM Consent Mode and calls onConsentChange(true)
 * - On "Decline", updates GTM Consent Mode and calls onConsentChange(false)
 */

"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import styles from "./CookieConsentBanner.module.css";

const COOKIE_NAME = "cookie_consent";

type Props = {
  onConsentChange: (granted: boolean) => void;
};

export default function CookieConsentBanner({ onConsentChange }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get(COOKIE_NAME);
    if (!consent) setVisible(true);
  }, []);

  const handleConsent = (granted: boolean) => {
    Cookies.set(COOKIE_NAME, granted ? "true" : "false", {
      expires: 365,
      path: "/",
    });
    setVisible(false);

    // Update Google Consent Mode if GTM is already loaded
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
      });
    }

    onConsentChange(granted);

    // Optional: reload to ensure GTM is injected immediately
    if (granted) {
      window.location.reload();
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite">
      <span className={styles.text}>
        This site uses cookies for analytics and to improve your experience.{" "}
        <a href="/legal/privacy-policy" className="fancy-link">
          Learn more
        </a>
        .
      </span>
      <div className={styles.buttonsSection}>
        <button onClick={() => handleConsent(true)} className={styles.accept}>
          Accept
        </button>
        <button onClick={() => handleConsent(false)} className={styles.decline}>
          Decline
        </button>
      </div>
    </div>
  );
}
