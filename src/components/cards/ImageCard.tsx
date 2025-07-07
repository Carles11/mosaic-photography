import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ImageData, ImageCardProps } from "@/types";
import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import styles from "./ImageCard.module.css";

const ImageCard: React.FC<ImageCardProps> = ({ onLoginRequired }) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageOrientations, setImageOrientations] = useState<
    Record<string, string>
  >({});

  const imgRef = useRef<HTMLImageElement | null>(null);

  // Function to handle image load and set orientation class for a specific image
  const handleLoad = (imgElement: HTMLImageElement, imageId: string) => {
    const { naturalWidth, naturalHeight } = imgElement;
    const isLandscape = naturalWidth > naturalHeight;
    const orientation = isLandscape ? styles.landscape : styles.portrait;

    setImageOrientations((prev) => ({
      ...prev,
      [imageId]: orientation,
    }));
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

      // Filter out images that start with "000_aaa"
      const filteredImages = images.filter((img) => {
        const fileName = img.url.split("/").pop()?.toLowerCase(); // Extract the file name and normalize case
        return !fileName?.startsWith("000_aaa");
      });

      setImages(filteredImages.sort(() => Math.random() - 0.5)); // Shuffle images
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
        ClimbBoxLoaderContainer("var(--text-color)", 16, loading)
      ) : (
        <PhotoSwipeWrapper
          galleryOptions={{
            zoom: true,
            maxSpreadZoom: 1,
            fullscreenEl: true,
            bgOpacity: 1,
            wheelToZoom: true,
          }}
        >
          {images.map((image) => (
            <div
              key={image.id}
              className={`${styles.gridItem} ${
                imageOrientations[image.id] || ""
              }`}
            >
              <ImageWrapper
                image={image}
                imgRef={imgRef}
                handleLoad={(e) => handleLoad(e.currentTarget, image.id)}
                onLoginRequired={onLoginRequired}
              />
            </div>
          ))}
        </PhotoSwipeWrapper>
      )}
    </>
  );
};

export default ImageCard;
