import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import styles from "./AuthorCard.module.css";
import { Photographer } from "@/types";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";

const AuthorCard: React.FC = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);

  useEffect(() => {
    const fetchPhotographersWithImages = async () => {
      const { data, error } = await supabase.from("photographers").select(`
          name,
          surname,
          biography,
          birthdate,
          deceasedate,
          origin,
          images (
            id,
            url,
            author,
            title,
            description,
            created_at
          )
        `);

      if (error) {
        setError(error.message);
      } else {
        setPhotographers(data);
      }
    };

    fetchPhotographersWithImages();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleNameClick = (photographer: Photographer) => {
    setSelectedPhotographer(photographer);
  };

  const closeModal = () => {
    setSelectedPhotographer(null);
  };

  return (
    <div className={styles.authorCardContainer}>
      {photographers.map((photographer, index) => (
        <div key={index} className={styles.authorCard}>
          <h2 onClick={() => handleNameClick(photographer)}>
            {`${photographer.name} ${photographer.surname}`.toUpperCase()}
          </h2>
          <p>{photographer.biography || "No biography available."}</p>
          <p>
            <strong>Birthdate:</strong>{" "}
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
          <div className={styles.imageList}>
            {photographer.images.map((image, index) => (
              <Image
                key={index}
                src={image.url}
                alt={image.title}
                width={50}
                height={50}
                className={styles.image}
              />
            ))}
          </div>
        </div>
      ))}
      {selectedPhotographer && (
        <PhotographerModal
          photographer={selectedPhotographer}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default AuthorCard;
