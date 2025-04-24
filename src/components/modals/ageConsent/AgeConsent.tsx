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
            Age Confirmation
          </h1>
          <h2 id="ageConsentTitle" className={styles.consentTitle}>
            Read the following before proceeding
          </h2>
          <p id="ageConsentDescription" className={styles.consentText}>
            By proceeding, you confirm you are of legal age. This page contains
            nudity for mature audiences.
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
