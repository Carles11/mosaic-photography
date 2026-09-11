"use client";

// BottomNav is rendered globally by ClientLayout; do not add it here.

import { useEffect, useRef } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);

  // No user-agent sniffing. This used to detect Googlebot/Bingbot by UA and
  // auto-confirm age for them, so crawlers got the page un-gated and un-blurred
  // while humans got it blurred behind a dialog. Serving crawlers a different
  // experience from users, keyed on the user agent, is the definition of
  // cloaking in Google's spam policies — the one thing an adult-content site
  // must never do. Everyone now gets the same page: content in the DOM, the
  // dialog on top until confirmed. The `skip_age_modal` cookie stays as a
  // manual escape hatch (e.g. for screenshots).
  useEffect(() => {
    if (Cookies.get("skip_age_modal") === "1") {
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
              {/* Capped: 44 cards × 2 sponsored links = 88 affiliate links on
                  the page that carries ~95% of the site's traffic. Featured
                  first, then sort_order; the full catalogue lives on the
                  /toolkit pages. */}
              <ResourcesSlider products={affiliateProducts} limit={12} />
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
      {!isMinimumAgeConfirmed && (
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
            // Backdrop lives in AgeConsent.module.css (one layer, ~60%).
            // Three stacked layers used to sum to ~97% black, so crawlers'
            // rendered screenshot of the homepage was a black rectangle.
            background: "transparent",
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
