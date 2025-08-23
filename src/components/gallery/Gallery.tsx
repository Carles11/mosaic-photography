"use client";

import React, { useRef } from "react";
import styles from "./gallery.module.css";
import GoToTopButton from "@/components/buttons/GoToTopButton";
import { ImageWithOrientation } from "@/types/gallery";
import ImageCard from "../cards/ImageCard";
import GallerySkeletonCard from "../cards/GallerySkeletonCard";
import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import JsonLdSchema from "@/components/seo/JsonLdSchema";

interface GalleryProps {
  id: string;
  images: ImageWithOrientation[];
  onLoginRequired?: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ id, images, onLoginRequired }) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  if (!images || images.length === 0) {
    // Show skeletons if no images provided (SSR fallback)
    return (
      <div className={styles.galleryGridContainer}>
        <hr />
        <h2 className={styles.subTitle}>THE MOSAIC COLLECTION </h2>
        <p className={styles.sectionIntro}>
          Browse the complete collection of vintage nude photography—featuring
          public domain, copyright-free, and open access images. All available
          for download and personal or commercial use.
        </p>
        <div className={styles.galleryGrid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <GallerySkeletonCard key={i} imageHeight={220} textLines={1} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id={id} className={styles.galleryGridContainer}>
      <hr />
      <h2 className={styles.subTitle}>THE MOSAIC COLLECTION </h2>
      <p className={styles.sectionIntro}>
        Browse the complete collection of vintage nude photography—featuring
        public domain, copyright-free, and open access images. All available for
        download and personal or commercial use.
      </p>
      {/* SEO schema.org markup */}
      <JsonLdSchema
        type="ImageGallery"
        name="Mosaic Photography Gallery"
        description="A curated collection of high-quality vintage photography from our archives"
        images={images.map((image) => ({
          contentUrl: image.url,
          name: image.title || "Untitled Image",
          description:
            image.description || "Vintage photography from Mosaic's archives",
          creditText: image.author || "Unknown Photographer",
          width: typeof image.width === "number" ? image.width : 1200,
          height: typeof image.height === "number" ? image.height : 800,
          encodingFormat:
            image.url.endsWith(".jpg") || image.url.endsWith(".jpeg")
              ? "image/jpeg"
              : image.url.endsWith(".png")
                ? "image/png"
                : "image/jpeg",
          license: "https://creativecommons.org/publicdomain/mark/1.0/",
          acquireLicensePage: "https://www.mosaic.photography/license",
        }))}
      />
      <PhotoSwipeWrapper
        images={images}
        onLoginRequired={onLoginRequired}
        galleryOptions={{
          zoom: true,
          maxSpreadZoom: 1,
          fullscreenEl: true,
          bgOpacity: 1,
          wheelToZoom: true,
        }}
      >
        <div className={styles.galleryGrid}>
          {images.map((image) => {
            // Determine CSS class based on orientation and mosaic type
            let cssClass = styles.gridItem;
            if (image.orientation === "horizontal") {
              cssClass += ` ${styles.landscape}`;
            } else if (image.orientation === "vertical") {
              switch (image.mosaicType) {
                case "large":
                  cssClass += ` ${styles.mosaicLarge}`;
                  break;
                case "wide":
                  cssClass += ` ${styles.mosaicWide}`;
                  break;
                case "tall":
                  cssClass += ` ${styles.mosaicTall}`;
                  break;
                default:
                  cssClass += ` ${styles.portrait}`;
              }
            } else if (image.orientation === "square") {
              cssClass += ` ${styles.portrait}`;
            }

            return (
              <div key={image.id} className={cssClass}>
                <ImageCard
                  image={image}
                  onLoginRequired={onLoginRequired}
                  imgRef={imgRef}
                />
              </div>
            );
          })}
          <GoToTopButton />
        </div>
      </PhotoSwipeWrapper>
    </div>
  );
};

export default Gallery;
