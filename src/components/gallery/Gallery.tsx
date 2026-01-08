"use client";

import { useEffect, useMemo } from "react";
import VirtualizedMosaicGallery from "./GalleryVirtualizer";
import { useFilters } from "@/context/settingsContext/filters";
import { useModal } from "@/context/modalContext/useModal";
import type {
  GalleryFilter,
  ImageWithOrientation,
  Photographer,
} from "@/types/gallery";
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

type GalleryExtendedProps = {
  id?: string;
  images?: ImageWithOrientation[];
  onLoginRequired?: () => void;
  photographers?: Photographer[]; // optional array passed from HomeClientWrapper
};

// Local type: image extended with optional slug
type ImageWithPhotographerSlug = ImageWithOrientation & {
  photographer_slug?: string;
};

// Type guard to check if an object has photographer_slug property
function hasPhotographerSlug(
  obj: unknown
): obj is { photographer_slug: string } {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "photographer_slug" in obj &&
    typeof (obj as { photographer_slug: unknown }).photographer_slug ===
      "string"
  );
}

const Gallery: React.FC<GalleryExtendedProps> = ({
  id,
  images,
  onLoginRequired,
  photographers,
}) => {
  const { filters, setFilters } = useFilters();
  const { open } = useModal();

  // Set default filter for nudity to "nude" if not set
  useEffect(() => {
    if (!filters.nudity) {
      setFilters({ ...filters, nudity: "nude" });
    }
    // Only run on mount or when filters.nudity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // Make color filter comparison case-insensitive and trim whitespace
    if (
      filters.color &&
      typeof img.color === "string" &&
      typeof filters.color === "string" &&
      img.color.trim().toLowerCase() !== filters.color.trim().toLowerCase()
    )
      return false;
    if (filters.color && typeof img.color !== "string") return false;
    if (filters.nudity && img.nudity !== filters.nudity) return false;
    if (filters.print_quality && img.print_quality !== filters.print_quality)
      return false;

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

  /**
   * Attach photographer slug to each image when possible by matching the image's author field
   * against the passed photographers array. The key added is `photographer_slug` so the
   * virtualizer can pick it up.
   */
  const imagesWithPhotographerSlug: ImageWithPhotographerSlug[] =
    useMemo(() => {
      if (!filteredImages || filteredImages.length === 0)
        return filteredImages ?? [];

      // Fast path if no photographers provided
      if (!photographers || photographers.length === 0) {
        // return original images as-is, typed to include optional slug
        return filteredImages as ImageWithPhotographerSlug[];
      }

      const normalize = (s?: string) =>
        (s || "").toString().trim().toLowerCase();

      return filteredImages.map((img) => {
        // If the image already carries a slug-like field, return unchanged
        if (hasPhotographerSlug(img)) {
          return img as ImageWithPhotographerSlug;
        }

        const imgAuthorNorm = normalize(img.author);

        const match = photographers.find((p) => {
          const pAuthor = normalize(p.author ?? `${p.name} ${p.surname}`);
          const pFullName = normalize(`${p.name} ${p.surname}`);
          const pSurname = normalize(p.surname);
          if (!imgAuthorNorm) return false;
          return (
            imgAuthorNorm === pAuthor ||
            imgAuthorNorm === pFullName ||
            imgAuthorNorm === pSurname
          );
        });

        if (
          match &&
          typeof match.slug === "string" &&
          match.slug.trim().length > 0
        ) {
          return {
            ...img,
            photographer_slug: match.slug.trim(),
          } as ImageWithPhotographerSlug;
        }

        return img as ImageWithPhotographerSlug;
      });
    }, [filteredImages, photographers]);

  return (
    <div id={id} className={styles.galleryContainer}>
      <hr />
      <h2>THE MOSAIC COLLECTION </h2>
      <p className={styles.sectionIntro}>
        Explore the Mosaic Collection—a curated archive of vintage nude and
        not-nude photography, celebrating history, beauty, and artistic freedom.
        Every image is public domain, copyright-free, and open access, ready for
        you to download and use for personal or commercial projects.
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
            <div className={styles.activeFiltersList}>
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
          </div>
        )}
      </div>

      {/* Show an empty state if no images */}
      {imagesWithPhotographerSlug?.length === 0 ? (
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
        <>
          <VirtualizedMosaicGallery
            images={imagesWithPhotographerSlug}
            onLoginRequired={onLoginRequired}
          />
        </>
      )}

      <GoToTopButton />
    </div>
  );
};

export default Gallery;
