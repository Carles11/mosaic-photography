"use client";

import React from "react";
import { useAppContext } from "@/context/AppContext";
import { useAgeConsent } from "@/context/AgeConsentContext";

import Gallery from "@/components/gallery/Gallery";
import { ImageCardTitles } from "@/components/header/titles/ImageCardTitles";
import { AuthorCardTitles } from "@/components/header/titles/AuthorCardTitles";
import { structuredData } from "@/utils/structuredData";
import { AgeConsent } from "@/components/modals/ageConsent/AgeConsent";

import styles from "./home.module.css";

export default function HomeClientWrapper() {
  const { isMosaic } = useAppContext();
  const { isMinimumAgeConfirmed, setIsMinimumAgeConfirmed } = useAgeConsent();

  return (
    <div className={styles.container}>
      {!isMinimumAgeConfirmed ? (
        <AgeConsent
          isMinimumAgeConfirmed={isMinimumAgeConfirmed}
          setIsMinimumAgeConfirmed={setIsMinimumAgeConfirmed}
        />
      ) : (
        <section
          className={`${styles.pageContent} ${
            isMinimumAgeConfirmed ? styles.visible : styles.invisible
          }`}
          aria-hidden={!isMinimumAgeConfirmed}
        >
          <div className="v-margin">
            {isMosaic ? <ImageCardTitles /> : <AuthorCardTitles />}
          </div>

          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>

          <Gallery isMosaic={isMosaic} />
        </section>
      )}
    </div>
  );
}
