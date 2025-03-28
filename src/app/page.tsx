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
              ? "Discover our curated gallery of classic nude photography, showcasing the work of iconic photographers."
              : "Learn about the famous photographers who created stunning classic nude photography featured in our collection."}
          </p>
          <Gallery isMosaic={isMosaic} />
        </main>
      </div>
    </>
  );
}
