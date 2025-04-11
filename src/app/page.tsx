"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";

import Gallery from "@/components/gallery/Gallery";
import { AgeConsent } from "@/components/modals/ageConsent/AgeConsent";

export default function Home() {
  const { isMosaic } = useAppContext();
  const [isMinimumAgeConfirmed, setIsMinimumAgeConfirmed] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

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

  useEffect(() => {
    // Simulate database readiness check
    const checkDatabase = async () => {
      // Replace this with actual database readiness logic
      const dbReady = true; // Set to true when the database is ready
      setIsDatabaseReady(dbReady);
    };
    checkDatabase();
  }, []);

  if (isCheckingSession) {
    return null; // Prevent rendering anything until session check is complete
  }

  if (!isDatabaseReady) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8f9fa",
          color: "#212529",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <div>
          <h1>Under Construction</h1>
          <p>
            We are currently working on the database. Please check back later!
          </p>
        </div>
      </div>
    );
  }

  if (!isMinimumAgeConfirmed) {
    return (
      <div style={{ position: "absolute", top: 0, left: 0 }}>
        <div
          style={{
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 999,
          }}
        />
        <AgeConsent setIsMinimumAgeConfirmed={handleAgeConfirmation} />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
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
