"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";

import Gallery from "@/components/gallery/Gallery";
import { AgeConsent } from "@/components/modals/ageConsent/AgeConsent";
import SiteUnderConstruction from "@/components/underConstruction/siteUnderConstruction";

export default function Home() {
  const { isMosaic } = useAppContext();
  const [isMinimumAgeConfirmed, setIsMinimumAgeConfirmed] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSiteInConstruction, setIsSiteInConstruction] = useState(false);

  useEffect(() => {
    // Check sessionStorage for age confirmation
    const ageConfirmed = sessionStorage.getItem("isMinimumAgeConfirmed");
    if (ageConfirmed === "true") {
      setIsMinimumAgeConfirmed(true);
    }
    setIsCheckingSession(false); // Ensure the modal doesn't disappear prematurely
  }, []);

  const handleAgeConfirmation = () => {
    setIsMinimumAgeConfirmed(true);
    sessionStorage.setItem("isMinimumAgeConfirmed", "true");
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/workbox-e43f5367.js")
          .then((registration) => {
            console.log("SW registered: ", registration);
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError);
          });
      });
    }
  }, []);

  // Set SITE IN CONSTRUCTION readiness check
  useEffect(() => {
    const checkDatabase = () => {
      // Replace this with actual database readiness logic
      const dbReady = true; // Set to true when the database is ready
      setIsSiteInConstruction(dbReady);
    };
    checkDatabase();
  }, []);

  if (isCheckingSession) {
    return null; // Prevent rendering anything until session check is complete
  }

  return (
    <>
      {!isSiteInConstruction && <SiteUnderConstruction />}

      <AgeConsent
        isMinimumAgeConfirmed={isMinimumAgeConfirmed}
        setIsMinimumAgeConfirmed={handleAgeConfirmation}
      />
      <div
        style={{
          display:
            isSiteInConstruction && isMinimumAgeConfirmed ? "flex" : "none",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <main>
          <div className="v-margin">
            <h1 className="center-text">
              Public Domain Nude Photography Gallery
            </h1>
            <h2 className="center-text">
              Vintage Nude Photography by Iconic Photographers
            </h2>
            <p className="center-text">
              Explore Mosaic&apos;s curated collection of timeless nude
              photography, featuring classic works from legendary photographers
              in the public domain.
            </p>
          </div>

          {/* Structured data for SEO */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Public Domain Nude Photography | Mosaic",
              url: "https://mosaic.photography",
              description:
                "Explore our public domain collection of classic nude photography featuring legendary photographers.",
              mainEntity: {
                "@type": "ImageGallery",
                name: "Vintage Nude Photography Gallery",
                image: [
                  "https://cdn.mosaic.photography/public-domain/Wilhelm_von_Plueschow/Plueschow_Wilhelm_von_n_1852_1930_A_man_aa_woman.webp",
                  "https://cdn.mosaic.photography/public-domain/Wilhelm_von_Plueschow/640px_Plueschow_Wilhelm_von_n_1852_1930_10836_Galerie_Lempertz.webp",
                  "https://cdn.mosaic.photography/public-domain/Wilhelm_von_Plueschow/640px_Plueschow_Wilhelm_von_n_1852_1930_12204.webp",
                ],
                about:
                  "A curated gallery of classic nude photos in the public domain",
              },
            })}
          </script>

          <Gallery isMosaic={isMosaic} />
        </main>
      </div>
    </>
  );
}
