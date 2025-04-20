import React, { Suspense } from "react";
import ImageCard from "../cards/ImageCard";
// import AuthorCard from "../cards/AuthorCard";
import GoToTopButton from "@/components/buttons/GoToTopButton";
import dynamic from "next/dynamic";

import styles from "./gallery.module.css";

// lazy load AuthorCard
const LazyAuthorCard = dynamic(() => import("../cards/AuthorCard"));

const Gallery = ({ isMosaic }: { isMosaic: boolean }) => {
  return (
    <div className={styles.galleryGridContainer}>
      {isMosaic ? (
        <div className={styles.galleryGrid}>
          <ImageCard />
        </div>
      ) : (
        <Suspense
          fallback={<div className="center-text">Loading authors...</div>}
        >
          <LazyAuthorCard />
        </Suspense>
      )}
      <GoToTopButton />
    </div>
  );
};

export default Gallery;
