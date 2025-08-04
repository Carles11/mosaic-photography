"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { HomeTitles } from "../header/titles/HomeTitles";
import PhotographersCardsSlide from "../sliders/photographers/PhotographersCardsSlide";
import styles from "./home.module.css";
import { useAgeConsent } from "@/context/AgeConsentContext";
import { SupabaseUser } from "@/lib/supabaseClient";

import Gallery from "@/components/gallery/Gallery";

import { structuredData } from "@/utils/structuredData";
import { AgeConsent } from "@/components/modals/ageConsent/AgeConsent";

import GitHubCorner from "@/components/buttons/GitHubCorner";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import BottomNav from "@/components/navigation/BottomNav/BottomNav";

interface HomeClientWrapperProps {
  showLoginButton?: boolean;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  user?: SupabaseUser | null;
  onGoProClick?: () => void;
}

function HomeClientWrapper({
  showLoginButton = false,
  onLoginClick,
  onLogoutClick,
  user,
  onGoProClick,
}: HomeClientWrapperProps) {
  const { isMinimumAgeConfirmed, setIsMinimumAgeConfirmed } = useAgeConsent();
  const [isCrawlerBot, setCrawlerIsBot] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Check for the bot cookie set by the middleware
    const skipForBots = Cookies.get("skip_age_modal") === "1";

    if (skipForBots) {
      setCrawlerIsBot(true);
      setIsMinimumAgeConfirmed(true); // Automatically confirm age for bots
    }
  }, [setIsMinimumAgeConfirmed]);

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <GitHubCorner url="https://github.com/Carles11/mosaic-photography" />
      <Header
        showLoginButton={showLoginButton}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        user={user}
      />

      {/* Show AgeConsent only for real users and if age is not confirmed */}
      {!isCrawlerBot && !isMinimumAgeConfirmed && (
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
            className={`${styles.pageContent} ${styles.visible}`}
            aria-hidden={!isMinimumAgeConfirmed}
          >
            <div className={styles.content}>
              <div className="v-margin">
                <HomeTitles />
              </div>
              <PhotographersCardsSlide onLoginRequired={onLoginClick} />
              <Gallery id="gallery-section" onLoginRequired={onLoginClick} />
            </div>
          </section>
        </>
      )}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        user={user}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onGoProClick={onGoProClick}
      />
    </div>
  );
}

export default HomeClientWrapper;
