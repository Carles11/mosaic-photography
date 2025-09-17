"use client";

// import ImageCard from "../cards/ImageCard";
import VirtualizedMosaicGallery from "./GalleryVirtualizer";
import PhotoSwipeWrapper, {
  Item,
} from "@/components/wrappers/PhotoSwipeWrapper";

import type { GalleryProps } from "@/types/gallery";
import styles from "./gallery.module.css";
import GoToTopButton from "@/components/buttons/GoToTopButton";

const Gallery: React.FC<GalleryProps> = ({ id, images, onLoginRequired }) => {
  return (
    <div id={id} className={styles.galleryGridContainer}>
      <hr />
      <h2>THE MOSAIC COLLECTION </h2>
      <p className={styles.sectionIntro}>
        Browse the complete collection of vintage nude photography—featuring
        public domain, copyright-free, and open access images. All available for
        download and personal or commercial use.
      </p>
      <PhotoSwipeWrapper
        images={images ?? []}
        onLoginRequired={onLoginRequired}
        galleryOptions={{
          zoom: true,
          maxSpreadZoom: 1,
          fullscreenEl: true,
          bgOpacity: 1,
          wheelToZoom: true,
        }}
      >
        {/* Register all images for PhotoSwipe navigation */}
        {(images ?? []).map((image) => (
          <Item
            key={image.id}
            original={image.url}
            thumbnail={image.url}
            caption={image.title}
            width={image.width}
            height={image.height}
            id={image.id}
            alt={image.title}
          >
            {() => null}
          </Item>
        ))}
        {/* Render the virtualized gallery */}
        <VirtualizedMosaicGallery
          images={images ?? []}
          onLoginRequired={onLoginRequired}
        />
        <GoToTopButton />
      </PhotoSwipeWrapper>
    </div>
  );
};

export default Gallery;
