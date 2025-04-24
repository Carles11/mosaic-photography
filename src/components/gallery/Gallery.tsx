"use client";

import React from "react";
import ImageCard from "../cards/ImageCard";
import AuthorCard from "../cards/AuthorCard";
import GoToTopButton from "@/components/buttons/GoToTopButton";
import { useAgeConsent } from "@/context/AgeConsentContext";

import styles from "./gallery.module.css";

const Gallery = ({ isMosaic }: { isMosaic: boolean }) => {
  const { isMinimumAgeConfirmed } = useAgeConsent();

  return (
    <div className={styles.galleryGridContainer}>
      {isMosaic && isMinimumAgeConfirmed ? (
        <div className={styles.galleryGrid}>
          <ImageCard />
        </div>
      ) : (
        <AuthorCard />
      )}
      <GoToTopButton />
    </div>
  );
};

export default Gallery;
