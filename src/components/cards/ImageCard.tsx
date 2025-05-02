import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ImageData, ImageCardProps } from "@/types";
import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import { ClimbingBoxLoader } from "react-spinners";
import styles from "./ImageCard.module.css";

const ImageCard: React.FC<ImageCardProps> = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchImages = async (): Promise<void> => {
      setLoading(true);

      const { data: images, error } = await supabase.from("images").select(
        `
          id, url, author, title, description, created_at
        `
      );

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!images) {
        setError("No images found.");
        setLoading(false);
        return;
      }

      setImages(images.sort(() => Math.random() - 0.5)); // Shuffle images
      setLoading(false);
    };

    fetchImages();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {loading ? (
        <div className={styles.loaderContainer}>
          <ClimbingBoxLoader
            color="var(--color-white)"
            loading={loading}
            size={25}
          />
          <p className={styles.loaderText}>Loading images...</p>
        </div>
      ) : (
        <PhotoSwipeWrapper galleryOptions={{ zoom: true }}>
          {images.map((image) => (
            <ImageWrapper key={image.id} image={image} />
          ))}
        </PhotoSwipeWrapper>
      )}
    </>
  );
};

export default ImageCard;
