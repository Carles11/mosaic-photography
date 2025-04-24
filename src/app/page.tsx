import React from "react";
import { useAppContext } from "@/context/AppContext";
import Gallery from "@/components/gallery/Gallery";
import { ImageCardTitles } from "@/components/header/titles/ImageCardTitles";
import { AuthorCardTitles } from "@/components/header/titles/AuthorCardTitles";
import { structuredData } from "@/utils/structuredData";
import styles from "./app.module.css"; // Import the CSS module

export default function Home() {
  const { isMosaic } = useAppContext();

  return (
    <div className={styles.container}>
      <main>
        <div className="v-margin">
          {isMosaic ? <ImageCardTitles /> : <AuthorCardTitles />}
        </div>

        {/* Structured data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>

        <Gallery isMosaic={isMosaic} />
      </main>
    </div>
  );
}
