"use client";

import React, { useEffect, useState } from "react";
import { useAgeConsent } from "@/context/AgeConsentContext";
import Cookies from "js-cookie";
import { withClientLogic } from "@/hocs/withClientLogic";

import Gallery from "@/components/gallery/Gallery";

import { structuredData } from "@/utils/structuredData";
import { AgeConsent } from "@/components/modals/ageConsent/AgeConsent";

import GitHubCorner from "@/components/buttons/GitHubCorner";

import styles from "./home.module.css";
import { HomeTitles } from "../header/titles/HomeTitles";
import PhotographersCardsSlide from "../sliders/photographers/PhotographersCardsSlide";

function HomeClientWrapper() {
  const { isMinimumAgeConfirmed, setIsMinimumAgeConfirmed } = useAgeConsent();
  const [isCrawlerBot, setCrawlerIsBot] = useState(false);

  useEffect(() => {
    // Check for the bot cookie set by the middleware
    const skipForBots = Cookies.get("skip_age_modal") === "1";

    if (skipForBots) {
      setCrawlerIsBot(true);
      setIsMinimumAgeConfirmed(true); // Automatically confirm age for bots
    }
  }, [setIsMinimumAgeConfirmed]);

  return (
    <div className={styles.container}>
      <GitHubCorner url="https://github.com/Carles11/mosaic-photography" />
      {/* Show AgeConsent only for real users */}
      {!isCrawlerBot && (
        <AgeConsent
          isMinimumAgeConfirmed={isMinimumAgeConfirmed}
          setIsMinimumAgeConfirmed={setIsMinimumAgeConfirmed}
        />
      )}
      {isMinimumAgeConfirmed && (
        <>
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
          <section
            className={`${styles.pageContent} ${
              isMinimumAgeConfirmed ? styles.visible : styles.invisible
            }`}
            aria-hidden={!isMinimumAgeConfirmed}
          >
            <div className={styles.content}>
              <div className="v-margin">
                <HomeTitles />
              </div>
              <PhotographersCardsSlide />
              <Gallery id="gallery-section" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default withClientLogic(HomeClientWrapper);
