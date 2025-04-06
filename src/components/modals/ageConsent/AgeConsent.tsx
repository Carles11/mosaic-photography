import React from "react";
import PrimaryButton from "@/components/buttons/PrimaryButton";

import styles from "./AgeConsent.module.css";

export const AgeConsent = ({
  setIsMinimumAgeConfirmed,
}: {
  setIsMinimumAgeConfirmed: (value: boolean) => void;
}) => {
  return (
    <div className={styles.ageConfirmationModal}>
      <div className={styles.modalContent}>
        <h2 className={styles.consentTitle}>Age Confirmation</h2>
        <p className={styles.consentText}>
          By proceeding, you confirm that you are of legal age to access this
          content based on the laws and regulations of your country or
          jurisdiction. This page contains content that includes nudity and is
          intended for mature audiences only. Please ensure compliance with all
          applicable legal requirements and verify that accessing such content
          is permissible in your location.
        </p>
        <PrimaryButton
          id="ageConsentButton"
          className={styles.consentButton}
          btnText="I confirm I am of legal age"
          handleClick={() => setIsMinimumAgeConfirmed(true)}
        />
      </div>
    </div>
  );
};
