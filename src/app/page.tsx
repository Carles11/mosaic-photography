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
          {/* Visually hidden content for SEO */}
          <h1 className="sr-only">
            {isMosaic
              ? "Explore the Beauty and Artistry of Classic Nude Photography"
              : "Discover the Stories of Iconic Photographers and Their Timeless Works"}
          </h1>
          <h2 className="sr-only">
            {isMosaic
              ? "Explore Stunning Classic Nude Photography"
              : "Meet Iconic Photographers Behind Classic Nude Photography"}
          </h2>
          <p className="sr-only">
            {isMosaic
              ? "Discover our curated gallery of classic nude photography, showcasing the work of iconic photographers. Our collection highlights the beauty, creativity, and artistry of nude photography, offering a unique perspective on the human form. Learn about the creators and inspirations behind these timeless works of art. Each photograph in our gallery tells a story, capturing the essence of the subject and the vision of the artist."
              : "Learn about the famous photographers who created stunning classic nude photography featured in our collection. Explore their artistic journeys, their unique styles, and the stories behind their most iconic works. Our gallery celebrates the legacy of these talented artists and their contributions to the world of photography. Discover how their work has influenced modern photography and continues to inspire new generations of artists."}
          </p>
          <p className="sr-only">
            {isMosaic
              ? "Our gallery is a celebration of the human form and the artistic vision of renowned photographers. Each piece in the collection is carefully curated to highlight the creativity, technical skill, and emotional depth that define classic nude photography. From striking black-and-white compositions to vibrant color works, the gallery offers a diverse range of styles and perspectives. Visitors can explore the stories behind these masterpieces, gaining insight into the inspirations and techniques that shaped them. This collection not only honors the legacy of past artists but also serves as a source of inspiration for contemporary creators."
              : "Dive into the lives and works of iconic photographers who have shaped the world of classic nude photography. Our collection provides a window into their artistic journeys, showcasing their most celebrated works alongside lesser-known gems. Learn about the cultural and historical contexts that influenced their creations, as well as the innovative techniques they pioneered. By exploring their stories, visitors can gain a deeper appreciation for the artistry and dedication that define this genre. This gallery is a tribute to their enduring impact on the art world and their ability to capture the essence of the human experience."}
          </p>

          {/* Structured data for SEO */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: isMosaic
                ? "Nude Photography Gallery - Iconic Artistic Nudes by Mosaic"
                : "Famous Nude Photographers - Iconic Artistic Nudes by Mosaic",
              description: isMosaic
                ? "Discover our curated gallery of classic nude photography, showcasing the work of iconic photographers. Explore stunning compositions and learn about the artistry behind these timeless masterpieces."
                : "Learn about the famous photographers who created stunning classic nude photography featured in our collection. Discover their unique styles and the stories behind their iconic works.",
              mainEntity: {
                "@type": "ImageGallery",
                name: isMosaic
                  ? "Artistic Nude Photography Gallery"
                  : "Famous Nude Photographers Collection",
              },
            })}
          </script>

          <Gallery isMosaic={isMosaic} />
        </main>
      </div>
    </>
  );
}
