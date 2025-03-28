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
              ? "Explore the Beauty and Artistry of Classic Nude Photography"
              : "Discover the Stories of Iconic Photographers and Their Timeless Works"}
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
