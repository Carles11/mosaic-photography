"use client";

// BottomNav is now rendered globally by ClientLayout; individual pages should
// not render another BottomNav directly.

import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { HomeTitles } from "../header/titles/HomeTitles";
import PhotographersCardsSlide from "../sliders/photographers/PhotographersCardsSlide";
import styles from "./home.module.css";
import { useAgeConsent } from "@/context/AgeConsentContext";
import { SupabaseUser } from "@/lib/supabaseClient";

import Gallery from "@/components/gallery/Gallery";

import { structuredData } from "@/utils/structuredData";
import { AgeConsent } from "@/components/modals/ageConsent/AgeConsent";

import { Photographer, ImageWithOrientation } from "@/types/gallery";

interface HomeClientWrapperProps {
  photographers?: Photographer[];
  images?: ImageWithOrientation[];
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  user?: SupabaseUser | null;
}

function HomeClientWrapper({
  images,
  photographers,
  onLoginClick,
}: HomeClientWrapperProps) {
  const { isMinimumAgeConfirmed, setIsMinimumAgeConfirmed } = useAgeConsent();
  const [isCrawlerBot, setCrawlerIsBot] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className={styles.container}>
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
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

      {/* Always render main content for SEO, but visually obscure and block interaction if age not confirmed */}
      <>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <section
          className={`${styles.pageContent} ${styles.visible} ${
            !isMinimumAgeConfirmed ? "obscuredContent" : ""
          }`}
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
            <PhotographersCardsSlide
              photographers={photographers}
              onLoginRequired={onLoginClick}
            />
            <Gallery
              id="gallery-section"
              images={images}
              onLoginRequired={onLoginClick}
            />
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
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
    </div>
  );
}

export default HomeClientWrapper;
