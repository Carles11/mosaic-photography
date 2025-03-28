"use client";

import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

import Gallery from "@/components/gallery/Gallery";

export default function Home() {
  const { isMosaic } = useAppContext();

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

  return (
    <>
      <div>
        <main>
          {/* Visually hidden content for SEO */}
          <h1
            style={{
              position: "absolute",
              left: "-9999px",
              top: "auto",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            {isMosaic
              ? "Nude Photography Gallery - Iconic Artistic Nudes by Mosaic"
              : "Famous Nude Photographers - Iconic Artistic Nudes by Mosaic"}
          </h1>
          <h2
            style={{
              position: "absolute",
              left: "-9999px",
              top: "auto",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            {isMosaic
              ? "Explore Stunning Classic Nude Photography"
              : "Meet Iconic Photographers Behind Classic Nude Photography"}
          </h2>
          <p
            style={{
              position: "absolute",
              left: "-9999px",
              top: "auto",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            {isMosaic
              ? "Discover our curated gallery of classic nude photography, showcasing the work of iconic photographers. Our collection highlights the beauty, creativity, and artistry of nude photography, offering a unique perspective on the human form. Learn about the creators and inspirations behind these timeless works of art. Each photograph in our gallery tells a story, capturing the essence of the subject and the vision of the artist."
              : "Learn about the famous photographers who created stunning classic nude photography featured in our collection. Explore their artistic journeys, their unique styles, and the stories behind their most iconic works. Our gallery celebrates the legacy of these talented artists and their contributions to the world of photography. Discover how their work has influenced modern photography and continues to inspire new generations of artists."}
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
