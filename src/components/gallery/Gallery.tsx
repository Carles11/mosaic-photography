"use client";

import React, { JSX } from "react";
import ImageCard from "../cards/ImageCard";
import AuthorCard from "../cards/AuthorCard";
import GoToTopButton from "@/components/buttons/GoToTopButton";

import styles from "./gallery.module.css";

interface GalleryProps extends JSX.IntrinsicAttributes {
  isMosaic: boolean;
  id: string;
}

const Gallery: React.FC<GalleryProps> = ({ isMosaic, id }) => {
  return (
    <div id={id} className={styles.galleryGridContainer}>
      <div className={styles.galleryGrid}>
        {isMosaic ? <ImageCard /> : <AuthorCard />}
        <GoToTopButton />
      </div>
    </div>
  );
};

export default Gallery;
