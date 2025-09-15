"use client";

import ImageCard from "../cards/ImageCard";
import type { GalleryProps } from "@/types/gallery";
import styles from "./gallery.module.css";
import GoToTopButton from "@/components/buttons/GoToTopButton";

import { ImageWithOrientation } from "@/types/gallery";

const Gallery: React.FC<GalleryProps> = ({ id, images, onLoginRequired }) => {
  return (
    <div id={id} className={styles.galleryGridContainer}>
      <hr />
      <h2 className={styles.subTitle}>THE MOSAIC COLLECTION </h2>
      <p className={styles.sectionIntro}>
        Browse the complete collection of vintage nude photography—featuring
        public domain, copyright-free, and open access images. All available for
        download and personal or commercial use.
      </p>
      <div className={styles.galleryGrid}>
        <ImageCard images={images} onLoginRequired={onLoginRequired} />
        <GoToTopButton />
      </div>
    </div>
  );
};

export default Gallery;
