"use client";

import React, { JSX } from "react";
import ImageCard from "../cards/ImageCard";
// import AuthorCard from "../cards/AuthorCard";
import GoToTopButton from "@/components/buttons/GoToTopButton";

import styles from "./gallery.module.css";

interface GalleryProps extends JSX.IntrinsicAttributes {
  id: string;
}

const Gallery: React.FC<GalleryProps> = ({ id }) => {
  return (
    <div id={id} className={styles.galleryGridContainer}>
      <hr />
      <h2 className={styles.subTitle}>ALL PHOTOS </h2>
      <p className={styles.sectionIntro}>
        Browse the complete collection of vintage nude photography—featuring
        public domain, copyright-free, and open access images. All available for
        download and personal or commercial use.
      </p>
      <div className={styles.galleryGrid}>
        <ImageCard />
        <GoToTopButton />
      </div>
    </div>
  );
};

export default Gallery;
