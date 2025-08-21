"use client";

import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { HomeTitles } from "../header/titles/HomeTitles";
import PhotographersCardsSlide from "../sliders/photographers/PhotographersCardsSlide";
import styles from "./home.module.css";
import { useAgeConsent } from "@/context/AgeConsentContext";
import { SupabaseUser } from "@/lib/supabaseClient";

import Gallery from "@/components/gallery/Gallery";

// Preload gallery and photographers data/images for performance
import { preloadGalleryData } from "@/utils/preloadGallery";
import { preloadPhotographersData } from "@/utils/preloadPhotographers";

import { structuredData } from "@/utils/structuredData";
import { AgeConsent } from "@/components/modals/ageConsent/AgeConsent";

import GitHubCorner from "@/components/buttons/GitHubCorner";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import BottomNav from "@/components/navigation/BottomNav/BottomNav";

interface HomeClientWrapperProps {
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  user?: SupabaseUser | null;
  onGoProClick?: () => void;
}

function HomeClientWrapper({
  onLoginClick,
  onLogoutClick,
  user,
  onGoProClick,
}: HomeClientWrapperProps) {
  const { isMinimumAgeConfirmed, setIsMinimumAgeConfirmed } = useAgeConsent();
  const [isCrawlerBot, setCrawlerIsBot] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [preloaded, setPreloaded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Improved bot detection: check userAgent for major bots
    const botRegex =
      /bot|crawl|slurp|spider|bing|duckduckgo|baidu|yandex|sogou|exabot|facebot|ia_archiver/i;
    const isBot = botRegex.test(navigator.userAgent);
    const skipForBots = Cookies.get("skip_age_modal") === "1";
    if (isBot || skipForBots) {
      setCrawlerIsBot(true);
      setIsMinimumAgeConfirmed(true); // Automatically confirm age for bots
    }
  }, [setIsMinimumAgeConfirmed]);

  // Preload gallery and photographers data/images in background for performance
  useEffect(() => {
    if (!preloaded) {
      Promise.all([preloadGalleryData(), preloadPhotographersData()]).finally(
        () => setPreloaded(true),
      );
    }
  }, [preloaded]);

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <GitHubCorner url="https://github.com/Carles11/mosaic-photography" />
      <Header
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        user={user}
      />

      {/* Show AgeConsent only for real users and if age is not confirmed */}
      {!isCrawlerBot && !isMinimumAgeConfirmed && (
        <div
          ref={modalRef}
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
          aria-labelledby="ageConsentTitle"
          aria-describedby="ageConsentDescription"
          onKeyDown={(e) => {
            // Focus trap: keep focus inside modal
            if (e.key === "Tab" && modalRef.current) {
              const focusable = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
              );
              const first = focusable[0] as HTMLElement;
              const last = focusable[focusable.length - 1] as HTMLElement;
              if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              } else if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              }
            }
          }}
        >
          <AgeConsent
            setIsMinimumAgeConfirmed={(value) => {
              setIsMinimumAgeConfirmed(value);
              // Persist consent in cookie for 1 year
              if (value) {
                Cookies.set("isMinimumAgeConfirmed", "true", { expires: 365 });
              }
            }}
          />
        </div>
      )}

      {/* Always render main content, but visually obscure and block interaction if age not confirmed */}
      <>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <section
          className={`${styles.pageContent} ${styles.visible} ${!isMinimumAgeConfirmed ? "obscuredContent" : ""}`}
          aria-hidden={!isMinimumAgeConfirmed}
          style={
            !isMinimumAgeConfirmed
              ? { pointerEvents: "none", userSelect: "none" }
              : {}
          }
        >
          <div className={styles.content}>
            <div className="v-margin">
              <HomeTitles />
            </div>
            <PhotographersCardsSlide onLoginRequired={onLoginClick} />
            <Gallery id="gallery-section" onLoginRequired={onLoginClick} />
          </div>
        </section>
        {/* Overlay for modal: visually obscure and block interaction if not confirmed */}
        {!isCrawlerBot && !isMinimumAgeConfirmed && (
          <div
            ref={modalRef}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
            aria-labelledby="ageConsentTitle"
            aria-describedby="ageConsentDescription"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(10,10,10,0.45)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onKeyDown={(e) => {
              // Focus trap: keep focus inside modal
              if (e.key === "Tab" && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                );
                const first = focusable[0] as HTMLElement;
                const last = focusable[focusable.length - 1] as HTMLElement;
                if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                } else if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                }
              }
            }}
          >
            <AgeConsent
              setIsMinimumAgeConfirmed={(value) => {
                setIsMinimumAgeConfirmed(value);
                // Persist consent in cookie for 1 year
                if (value) {
                  Cookies.set("isMinimumAgeConfirmed", "true", {
                    expires: 365,
                  });
                }
              }}
            />
          </div>
        )}
      </>
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
