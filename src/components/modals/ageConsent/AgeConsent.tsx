import React from "react";
import Head from "next/head";
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
      className={`${styles.ageModalOverlayContainer} ${
        isMinimumAgeConfirmed ? styles.hidden : ""
      }`}
    >
      <Head>
        <link rel="preload" as="style" href="./AgeConsent.module.css" />
      </Head>
      <div className={styles.ageModalOverlay}>
        <div className={styles.ageConfirmationContent}>
          <h2 className={styles.consentTitle}>Age Confirmation</h2>
          <p className={styles.consentText}>
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
