"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useAgeConsent } from "@/context/AgeConsentContext";
import Cookies from "js-cookie";
import { withClientLogic } from "@/hocs/withClientLogic"; // Import the HOC

// Add a declaration file for 'js-cookie' to avoid TypeScript errors
// Create a file named `js-cookie.d.ts` in your project (e.g., in a `types` folder) with the following content:
// declare module 'js-cookie';

import Gallery from "@/components/gallery/Gallery";
import { ImageCardTitles } from "@/components/header/titles/ImageCardTitles";
import { AuthorCardTitles } from "@/components/header/titles/AuthorCardTitles";
import { structuredData } from "@/utils/structuredData";
import { AgeConsent } from "@/components/modals/ageConsent/AgeConsent";

import GitHubCorner from "@/components/buttons/GitHubCorner";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

import styles from "./home.module.css";

function HomeClientWrapper() {
  const { isMosaic } = useAppContext();
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
      {/* Show AgeConsent only for real users */}
      {!isCrawlerBot && (
        <AgeConsent
          isMinimumAgeConfirmed={isMinimumAgeConfirmed}
          setIsMinimumAgeConfirmed={setIsMinimumAgeConfirmed}
        />
      )}
      {isMinimumAgeConfirmed && (
        <section
          className={`${styles.pageContent} ${
            isMinimumAgeConfirmed ? styles.visible : styles.invisible
          }`}
          aria-hidden={!isMinimumAgeConfirmed}
        >
          <GitHubCorner url="https://github.com/Carles11/mosaic-photography" />
          <Header />
          <div className="v-margin">
            {isMosaic ? <ImageCardTitles /> : <AuthorCardTitles />}
          </div>

          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>

          <Gallery isMosaic={isMosaic} />
          <Footer />
        </section>
      )}
    </div>
  );
}

export default withClientLogic(HomeClientWrapper);
