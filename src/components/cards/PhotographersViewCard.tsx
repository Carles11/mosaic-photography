import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Photographer, PhotographersViewCardProps } from "@/types";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import ImageGallery from "react-image-gallery";

import "react-image-gallery/styles/css/image-gallery.css"; // Import default styles
import styles from "./PhotographersViewCard.module.css";

const PhotographersViewCard: React.FC<PhotographersViewCardProps> = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);
  const [expandedBiography, setExpandedBiography] = useState<number | null>(
    null
  );
  const [expandedOrigin, setExpandedOrigin] = useState<number | null>(null); // State for expanded origin

  useEffect(() => {
    const fetchPhotographersWithImages = async () => {
      setLoading(true);

      const { data: photographers } = await supabase
        .from("photographers")
        .select(
          `
          name, surname, author, biography, birthdate, deceasedate, origin, website, store, instagram,
          images (id, url, author, title, description, created_at)
        `
        )
        .limit(10);

      setPhotographers(photographers || []);
      setLoading(false);
    };

    fetchPhotographersWithImages();
  }, []);

  const toggleBiography = (index: number) => {
    setExpandedBiography((prev) => (prev === index ? null : index));
  };

  const toggleOrigin = (index: number) => {
    setExpandedOrigin((prev) => (prev === index ? null : index)); // Toggle origin state
  };

  const getGroupedItems = (items: Photographer[], itemsPerSlide: number) => {
    const groupedItems = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      groupedItems.push(items.slice(i, i + itemsPerSlide));
    }
    return groupedItems;
  };

  const calculateItemsPerSlide = () => {
    const width = window.innerWidth;
    if (width > 1200) return 4; // Show 4 items for large screens
    if (width > 768) return 3; // Show 3 items for medium screens
    if (width < 768) return 1; // Show 1 items for small screens
    return 2; // Show 2 items for small screens
  };

  const groupedGalleryItems = getGroupedItems(
    photographers,
    calculateItemsPerSlide()
  ).map((group, index) => ({
    renderItem: () => (
      <div key={index} style={{ display: "flex", gap: "1rem" }}>
        {group.map((photographer, idx) => (
          <div
            key={idx}
            id={`author-${index}-${idx}`}
            className={styles.photographersViewCard}
          >
            <h2
              className={styles.authorName}
              onClick={() => setSelectedPhotographer(photographer)}
              role="button"
              tabIndex={0}
            >
              <a href="">
                {`${photographer.name} ${photographer.surname}`.toUpperCase()}
              </a>
            </h2>
            <ImageGallery
              items={photographer.images.map((image) => ({
                original: image.url,
                thumbnail: image.url,
                description: image.title || "Untitled",
              }))}
              showThumbnails={false}
              showPlayButton={false}
              showFullscreenButton={false}
            />
            <p
              className={`${styles.biography} ${
                expandedBiography === index ? styles.expanded : ""
              }`}
              onClick={() => toggleBiography(index)}
            >
              <strong>Biography: </strong>
              <br />
              {photographer.biography || "No biography available."}
            </p>
            <p>
              <strong>Birthdate: </strong>
              {new Date(photographer.birthdate).toLocaleDateString()}
            </p>
            <p
              className={`${styles.origin} ${
                expandedOrigin === index ? styles.expanded : ""
              }`}
              onClick={() => toggleOrigin(index)}
            >
              <strong>Origin:</strong> {photographer.origin}
            </p>
            {photographer.deceasedate && (
              <p>
                <strong>Deceasedate:</strong>{" "}
                {new Date(photographer.deceasedate).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    ),
  }));

  const closePhotographerModal = () => {
    setSelectedPhotographer(null);
  };

  return (
    <div className={styles.photographersViewCardContainer}>
      {loading ? (
        ClimbBoxLoaderContainer("var(--color-white)", 25, loading)
      ) : (
        <ImageGallery
          items={groupedGalleryItems}
          autoPlay={false}
          showBullets={true}
          showNav={false}
          showThumbnails={false}
          showPlayButton={false}
          showFullscreenButton={false}
          slideDuration={2000}
          // slideInterval={5000}
        />
      )}
      {selectedPhotographer && (
        <PhotographerModal
          photographer={selectedPhotographer}
          onClose={closePhotographerModal}
        />
      )}
    </div>
  );
};

export default PhotographersViewCard;
