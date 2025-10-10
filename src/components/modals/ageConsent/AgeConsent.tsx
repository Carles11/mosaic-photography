import React, { useEffect, useState } from "react";
import styles from "./AgeConsent.module.css";

export const AgeConsent = ({
  setIsMinimumAgeConfirmed,
}: {
  setIsMinimumAgeConfirmed: (value: boolean) => void;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Delay rendering for 50ms to allow CSS/fonts to load
    const timer = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted || !show) {
    return null;
  }
  return (
    <div
      role="dialog"
      aria-labelledby="ageConsentTitle"
      aria-describedby="ageConsentDescription"
      className={styles.ageModalOverlayContainer}
    >
      <div className={styles.ageModalOverlay}>
        <div className={styles.ageConfirmationContent}>
          <h1 id="ageConsentTitle" className={styles.consentTitle}>
            Age Confirmation Required
          </h1>

          <p id="ageConsentDescription" className={styles.consentText}>
            By continuing, you confirm that you are of legal age to view
            artistic nude photography. This curated gallery features vintage and
            classic nude images intended for mature audiences only. All
            photographs are public domain, copyright-free, and presented for
            artistic and historical appreciation.
          </p>

          <button
            id="ageConsentButton"
            className={styles.consentButton}
            onClick={() => {
              setIsMinimumAgeConfirmed(true);
            }}
          >
            I confirm I am of legal age
          </button>
        </div>
      </div>
    </div>
  );
};
