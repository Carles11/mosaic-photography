"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import styles from "./CookieConsentBanner.module.css";

const COOKIE_NAME = "cookie_consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get(COOKIE_NAME);
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    Cookies.set(COOKIE_NAME, "true", { expires: 365 });
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-granted"));
  };

  const handleDecline = () => {
    Cookies.set(COOKIE_NAME, "false", { expires: 365 });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite">
      <span className={styles.text}>
        This site uses cookies and tracking technologies (Google Analytics and
        Microsoft Clarity) for analytics and to improve your experience.{" "}
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
