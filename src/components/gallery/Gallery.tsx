"use client";

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
      <div className={styles.filtersInfo}>
        <button
          className={styles.filtersButton}
          onClick={handleOpenFiltersModal}
          aria-label="Open filters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            style={{ marginRight: 8 }}
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M6 12h12M10 18h4"
            />
          </svg>
          <span>Filters</span>
        </button>
      </div>
      <VirtualizedMosaicGallery
        images={filteredImages ?? []}
        onLoginRequired={onLoginRequired}
      />
      <GoToTopButton />
    </div>
  );
};

export default Gallery;
