"use client";

// BottomNav is rendered globally by ClientLayout; do not add it here.

import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import PhotographersCardsSlide from "../sliders/photographers/PhotographersCardsSlide";
import ContributorsSlide from "../sliders/contributors/ContributorsSlide";
import styles from "./home.module.css";
import { useAgeConsent } from "@/context/AgeConsentContext";
import { SupabaseUser } from "@/lib/supabaseClient";
import {
  AffiliateProductWithAdvertiser,
  ResourcesSlider,
} from "@/components/sliders/ResourcesSlider";
import Gallery from "@/components/gallery/Gallery";
import { AgeConsent } from "@/components/modals/ageConsent/AgeConsent";
import { Photographer, ImageWithOrientation } from "@/types/gallery";
import { ContributorWithFeatured } from "@/utils/fetchContributorsWithFeaturedSSR";

interface HomeClientWrapperProps {
  photographers?: Photographer[];
  images?: ImageWithOrientation[];
  affiliateProducts?: AffiliateProductWithAdvertiser[];
  contributors?: ContributorWithFeatured[];
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  user?: SupabaseUser | null;
}

function HomeClientWrapper({
  images,
  photographers,
  affiliateProducts,
  contributors,
  onLoginClick,
}: HomeClientWrapperProps) {
  const { isMinimumAgeConfirmed, setIsMinimumAgeConfirmed } = useAgeConsent();
  const [isCrawlerBot, setCrawlerIsBot] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const botRegex =
      /bot|crawl|slurp|spider|bing|duckduckgo|baidu|yandex|sogou|exabot|facebot|ia_archiver/i;
    const isBot = botRegex.test(navigator.userAgent);
    const skipForBots = Cookies.get("skip_age_modal") === "1";
    if (isBot || skipForBots) {
      setCrawlerIsBot(true);
      setIsMinimumAgeConfirmed(true);
    }
  }, [setIsMinimumAgeConfirmed]);

  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
  };

  return (
    <div className={styles.container}>
      <section
        className={`${styles.pageContent} ${styles.visible} ${
          !isMinimumAgeConfirmed ? styles.obscuredContent : ""
        }`}
        aria-hidden={!isMinimumAgeConfirmed}
        style={
          !isMinimumAgeConfirmed
            ? { pointerEvents: "none", userSelect: "none" }
            : {}
        }
      >
        <div className={styles.content} id="our-photographers">
          {/* VINTAGE NUDe ART PHOTOGRAPHERS */}
          <PhotographersCardsSlide
            photographers={photographers}
            onLoginRequired={onLoginClick}
          />

          {/* SHOPPING RESOURCES */}
          {affiliateProducts && affiliateProducts.length > 0 && (
            <section
              aria-label="Creative Essentials"
              className={styles.resourcesSection}
            >
              <h2 className={styles.subTitle} id="toolkits">
                MOSAIC&apos;S CURATED FINDS
              </h2>
              <p className={styles.sectionIntro}>
                Curated tools &amp; resources for photographers and vintage
                photography lovers
              </p>
              <ResourcesSlider products={affiliateProducts} />
            </section>
          )}

          {/* CONTRIBUTORS */}
          {contributors && contributors.length > 0 && (
            <section
              aria-label="Community Section"
              className={styles.resourcesSection}
              id="community-section"
            >
              <ContributorsSlide contributors={contributors} />
            </section>
          )}

          {/* GALLERY */}
          <Gallery
            id="gallery-section"
            images={images}
            photographers={photographers}
            onLoginRequired={onLoginClick}
          />
        </div>
      </section>

      {/* Age Consent Modal */}
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
          onKeyDown={handleModalKeyDown}
        >
          <AgeConsent
            setIsMinimumAgeConfirmed={(value) => {
              setIsMinimumAgeConfirmed(value);
              if (value) {
                Cookies.set("isMinimumAgeConfirmed", "true", { expires: 365 });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default HomeClientWrapper;
