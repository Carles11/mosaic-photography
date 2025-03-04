import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Photographer, Image as ImageType } from "@/types";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";
import ImageGalleryModal from "@/components/modals/imageGallery/ImageGalleryModal";

import styles from "./AuthorCard.module.css";

type AuthorCardProps = object;

const AuthorCard: React.FC<AuthorCardProps> = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [selectedPhotographerImages, setSelectedPhotographerImages] = useState<
    ImageType[]
  >([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

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

  const handleImageClick = (images: ImageType[], index: number) => {
    setSelectedPhotographerImages(images);
    setSelectedImageIndex(index);
    setSelectedImage(images[index]);
  };

  const closePhotographerModal = () => {
    setSelectedPhotographer(null);
  };

  const closeImageGalleryModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className={styles.authorCardContainer}>
      {photographers.map((photographer, index) => (
        <div key={index} className={styles.authorCard}>
          <h2
            onClick={() => handleNameClick(photographer)}
            className={styles.authorName}
          >
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
              <div
                key={index}
                onClick={() => handleImageClick(photographer.images, index)}
              >
                <Image
                  src={image.url}
                  alt={image.title || "Image"}
                  width={50}
                  height={50}
                  className={styles.image}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {selectedPhotographer && (
        <PhotographerModal
          photographer={selectedPhotographer}
          onClose={closePhotographerModal}
        />
      )}
      {selectedImage && (
        <ImageGalleryModal
          images={selectedPhotographerImages.map((image) => ({
            original: image.url,
            thumbnail: image.url,
          }))}
          startIndex={selectedImageIndex}
          onClose={closeImageGalleryModal}
          play={true}
          bullets={false}
          fullscreen={true}
        />
      )}
    </div>
  );
};

export default AuthorCard;
