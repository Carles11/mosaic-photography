"use client";

// import ImageCard from "../cards/ImageCard";
import VirtualizedMosaicGallery from "./GalleryVirtualizer";
import { useFilters } from "@/context/settingsContext/filters";
import { useModal } from "@/context/modalContext/useModal";
import type { GalleryProps } from "@/types/gallery";
import styles from "./gallery.module.css";
import GoToTopButton from "@/components/buttons/GoToTopButton";

const Gallery: React.FC<GalleryProps> = ({ id, images, onLoginRequired }) => {
  const { filters, setFilters } = useFilters();
  const { open } = useModal();
  function handleOpenFiltersModal() {
    open("galleryFilters", {
      filters,
      onApply: (newFilters) => setFilters(newFilters),
      onClose: () => {},
    });
  }

  const filteredImages = images?.filter((img) => {
    // Gender filter
    if (filters.gender && img.gender !== filters.gender) return false;
    // Orientation filter
    if (filters.orientation && img.orientation !== filters.orientation)
      return false;
    // Color filter
    if (filters.color && img.color !== filters.color) return false;
    // Nudity filter (if you implement it later)
    if (filters.nudity && img.nudity !== filters.nudity) return false;
    return true;
  });
  return (
    <div id={id} className={styles.galleryContainer}>
      <hr />
      <h2>THE MOSAIC COLLECTION </h2>
      <p className={styles.sectionIntro}>
        Browse the complete collection of vintage nude photography—featuring
        public domain, copyright-free, and open access images. All available for
        download and personal or commercial use.
      </p>
      <button onClick={handleOpenFiltersModal} style={{ marginBottom: 16 }}>
        Filters
      </button>
      <VirtualizedMosaicGallery
        images={filteredImages ?? []}
        onLoginRequired={onLoginRequired}
      />
      <GoToTopButton />
    </div>
  );
};

export default Gallery;
