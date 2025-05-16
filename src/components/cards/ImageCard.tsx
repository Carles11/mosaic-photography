import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ImageData, ImageCardProps } from "@/types";
import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import styles from "./ImageCard.module.css";

const ImageCard: React.FC<ImageCardProps> = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orientationClass, setOrientationClass] = useState("");

  const imgRef = useRef<HTMLImageElement | null>(null);

  // Function to handle image load and set orientation class
  const handleLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      const isLandscape = naturalWidth > naturalHeight;
      const orientation = isLandscape ? styles.landscape : styles.portrait;
      setOrientationClass(orientation);
    }
  };

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
        ClimbBoxLoaderContainer("var(--color-white)", 25, loading)
      ) : (
        <PhotoSwipeWrapper galleryOptions={{ zoom: true }}>
          {images.map((image) => (
            <div
              key={image.id}
              className={`${styles.gridItem} ${orientationClass}`}
            >
              <ImageWrapper
                image={image}
                imgRef={imgRef}
                handleLoad={handleLoad}
              />
            </div>
          ))}
        </PhotoSwipeWrapper>
      )}
    </>
  );
};

export default ImageCard;
