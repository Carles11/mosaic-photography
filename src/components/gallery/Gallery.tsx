"use client";

import VirtualizedMosaicGallery from "./GalleryVirtualizer";
import { useFilters } from "@/context/settingsContext/filters";
import { useModal } from "@/context/modalContext/useModal";
import type { GalleryProps, GalleryFilter } from "@/types/gallery";
import styles from "./gallery.module.css";
import GoToTopButton from "@/components/buttons/GoToTopButton";

// Type guard for year filter
function isYearFilter(value: unknown): value is { from: number; to: number } {
  return (
    value !== null &&
    typeof value === "object" &&
    "from" in value &&
    "to" in value &&
    typeof (value as { from: unknown }).from === "number" &&
    typeof (value as { to: unknown }).to === "number"
  );
}

const Gallery: React.FC<GalleryProps> = ({ id, images, onLoginRequired }) => {
  const { filters, setFilters } = useFilters();
  const { open } = useModal();

  function handleOpenFiltersModal() {
    open("galleryFilters", {
      filters,
      onApply: (newFilters: GalleryFilter) => setFilters(newFilters),
      onClose: () => {},
    });
  }

  const filteredImages = images?.filter((img) => {
    if (filters.gender && img.gender !== filters.gender) return false;
    if (filters.orientation && img.orientation !== filters.orientation)
      return false;
    if (filters.color && img.color !== filters.color) return false;
    if (filters.nudity && img.nudity !== filters.nudity) return false;

    if (filters.year && isYearFilter(filters.year)) {
      if (typeof img.year === "undefined" || img.year === null) return false;
      const imgYear =
        typeof img.year === "string" ? parseInt(img.year) : img.year;
      if (!imgYear || isNaN(imgYear)) return false;
      if (imgYear < filters.year.from || imgYear > filters.year.to)
        return false;
    }
    return true;
  });

  // Helper: are filters active?
  const filtersActive =
    !!filters.gender ||
    !!filters.orientation ||
    !!filters.color ||
    !!filters.nudity ||
    !!filters.print_quality ||
    (filters.year &&
      isYearFilter(filters.year) &&
      filters.year.from &&
      filters.year.to);

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
        {filtersActive && (
          <div className={styles.activeFilters}>
            {Object.entries(filters)
              .filter(([key, value]) => {
                if (!value) return false;
                if (
                  key === "year" &&
                  isYearFilter(value) &&
                  value.from &&
                  value.to
                ) {
                  return true;
                }
                if (
                  [
                    "gender",
                    "orientation",
                    "color",
                    "nudity",
                    "print_quality",
                  ].includes(key)
                ) {
                  return true;
                }
                return false;
              })
              .map(([key, value]) => {
                if (key === "year" && isYearFilter(value)) {
                  return (
                    <span key={key} className={styles.filterTag}>
                      Year: {value.from}–{value.to}
                    </span>
                  );
                }
                return (
                  <span key={key} className={styles.filterTag}>
                    {key.replace("_", " ")}: {String(value)}
                  </span>
                );
              })}
          </div>
        )}
      </div>

      {/* Show an empty state if no images */}
      {filteredImages?.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No images match your filters</h3>
          <p>Try adjusting your filter settings to see more images!</p>
          {filtersActive && (
            <button
              className={styles.resetButton}
              onClick={() => setFilters({})}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <VirtualizedMosaicGallery
          images={filteredImages ?? []}
          onLoginRequired={onLoginRequired}
        />
      )}

      <GoToTopButton />
    </div>
  );
};

export default Gallery;
