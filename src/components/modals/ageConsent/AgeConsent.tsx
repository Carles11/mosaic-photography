import React from "react";
import PrimaryButton from "@/components/buttons/PrimaryButton";

import styles from "./AgeConsent.module.css";

export const AgeConsent = ({
  setIsMinimumAgeConfirmed,
  isMinimumAgeConfirmed,
}: {
  setIsMinimumAgeConfirmed: (value: boolean) => void;
  isMinimumAgeConfirmed: boolean;
}) => {
  return (
    <div
      role="dialog"
      aria-labelledby="ageConsentTitle"
      aria-describedby="ageConsentDescription"
      className={`${styles.ageModalOverlayContainer} ${
        isMinimumAgeConfirmed ? styles.hidden : ""
      }`}
    >
      <div className={styles.ageModalOverlay}>
        <div className={styles.ageConfirmationContent}>
          <h1 id="ageConsentTitle" className={styles.consentTitle}>
            Age Confirmation Required
          </h1>
          <h2 id="ageConsentSubtitle" className={styles.consentSubTitle}>
            Please Review Before Entering the Gallery
          </h2>
          <p id="ageConsentDescription" className={styles.consentText}>
            By continuing, you confirm that you are of legal age to view
            artistic nude photography. This curated gallery features vintage and
            classic nude images intended for mature audiences only. All
            photographs are public domain, copyright-free, and presented for
            artistic and historical appreciation.
          </p>
          <PrimaryButton
            id="ageConsentButton"
            className={styles.consentButton}
            btnText="I confirm I am of legal age"
            handleClick={() => setIsMinimumAgeConfirmed(true)}
          />
        </div>
      </div>
    </div>
  );
};
