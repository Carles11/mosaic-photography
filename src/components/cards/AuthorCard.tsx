import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Photographer, AuthorCardProps } from "@/types";
import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";

import styles from "./AuthorCard.module.css";

const AuthorCard: React.FC<AuthorCardProps> = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);

  useEffect(() => {
    const fetchPhotographersWithImages = async () => {
      setLoading(true);

      const { data: photographers } = await supabase
        .from("photographers")
        .select(
          `
          name, surname, author, biography, birthdate, deceasedate, origin,
          images (id, url, author, title, description, created_at)
        `
        )
        .limit(10);

      setPhotographers(photographers || []);
      setLoading(false);
    };

    fetchPhotographersWithImages();
  }, []);

  const shuffledPhotographers = useMemo(() => {
    return photographers.sort(() => Math.random() - 0.5);
  }, [photographers]);

  const debouncedScrollIntoView = useMemo(() => {
    let timeout: NodeJS.Timeout | null = null;
    return (id: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };
  }, []);

  const closePhotographerModal = () => {
    setSelectedPhotographer(null);
  };

  return (
    <div className={styles.authorCardContainer}>
      {loading ? (
        ClimbBoxLoaderContainer("var(--color-white)", 25, loading)
      ) : (
        <>
          <div className={styles.authorScrollList}>
            {shuffledPhotographers.map((photographer, index) => (
              <button
                key={index}
                className={styles.authorButton}
                onClick={() => debouncedScrollIntoView(`author-${index}`)}
              >
                {photographer.author}
              </button>
            ))}
          </div>
          {shuffledPhotographers.map((photographer, index) => (
            <div
              key={index}
              id={`author-${index}`}
              className={styles.authorCard}
            >
              <div onClick={() => setSelectedPhotographer(photographer)}>
                <h2 className={styles.authorName}>
                  {`${photographer.name} ${photographer.surname}`.toUpperCase()}
                </h2>
                <p className={styles.biography}>
                  {photographer.biography || "No biography available."}
                </p>
                <p>
                  <strong>Birthdate: </strong>
                  {new Date(photographer.birthdate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Origin:</strong> {photographer.origin}
                </p>
                {photographer.deceasedate && (
                  <p>
                    <strong>Deceasedate:</strong>{" "}
                    {new Date(photographer.deceasedate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <PhotoSwipeWrapper galleryOptions={{ zoom: true }}>
                <div className={styles.imageList}>
                  {photographer.images.map((image) => (
                    <ImageWrapper key={image.id} image={image} />
                  ))}
                </div>
              </PhotoSwipeWrapper>
            </div>
          ))}
        </>
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

export default AuthorCard;
