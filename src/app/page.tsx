"use client";

import { useEffect } from "react";
import Head from "next/head";
import Gallery from "@/components/gallery/Gallery";
import { useAppContext } from "@/context/AppContext";

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

  useEffect(() => {
    // Update the metadata dynamically based on the gallery view
    if (isMosaic) {
      document.title = "Image Gallery | Mosaic Photography";
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          "Explore our stunning image gallery featuring classic nude photography by iconic photographers."
        );
      }
    } else {
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          "Meet the iconic photographers behind the stunning classic nude photography in our collection."
        );
      }
    }
  }, [isMosaic]);

  return (
    <>
      <Head>
        <title>
          {isMosaic
            ? "Image Gallery | Mosaic Photography"
            : "Photographers Gallery | Mosaic Photography"}
        </title>
        <meta
          name="description"
          content={
            isMosaic
              ? "Explore our stunning image gallery featuring classic nude photography by iconic photographers."
              : "Meet the iconic photographers behind the stunning classic nude photography in our collection."
          }
        />
        <meta
          name="keywords"
          content="classic nude photography, iconic photographers, image gallery, high-quality images"
        />
        <link rel="canonical" href="https://www.mosaic.photography/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            name: "Mosaic Photography",
            description:
              "Explore our stunning image gallery featuring classic nude photography by iconic photographers.",
            url: "https://www.mosaic.photography",
            image: [
              // Add URLs of representative images from your gallery
              "https://cdn.mosaic.photography/Google%20Fotos/mosaic_man-ray/webImage26.jpg",
              "https://cdn.mosaic.photography/Google%20Fotos/mosaic_david-dubnitskiy/david5.jpg",
              "https://cdn.mosaic.photography/Google%20Fotos/mosaic_helmuth-newton/webImage136.jpg",
            ],
          })}
        </script>
      </Head>
      <div>
        <main>
          <Gallery />
        </main>
      </div>
    </>
  );
}
