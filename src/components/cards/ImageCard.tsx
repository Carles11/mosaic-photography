import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ImageCardProps, ImageWithOrientation } from "@/types";
import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import styles from "./ImageCard.module.css";

const ImageCard: React.FC<ImageCardProps> = ({ onLoginRequired }) => {
  const [images, setImages] = useState<ImageWithOrientation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orientationsLoading, setOrientationsLoading] = useState<Set<string>>(
    new Set(),
  );

  const imgRef = useRef<HTMLImageElement | null>(null);

  // Pre-load image dimensions to determine orientation
  const loadImageDimensions = (
    imageUrl: string,
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageUrl;

      // Add timeout to prevent hanging
      setTimeout(() => {
        reject(new Error("Image load timeout"));
      }, 3000); // Reduced to 3 second timeout
    });
  };

  // Update image orientation after determining it
  const updateImageOrientation = async (imageId: string, imageUrl: string) => {
    if (orientationsLoading.has(imageId)) return; // Already loading

    setOrientationsLoading((prev) => new Set(prev).add(imageId));

    try {
      const dimensions = await loadImageDimensions(imageUrl);
      const orientation =
        dimensions.width > dimensions.height ? "landscape" : "portrait";

      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === imageId ? { ...img, orientation } : img,
        ),
      );
    } catch (error) {
      console.warn(
        `Failed to determine orientation for image ${imageId}:`,
        error,
      );
      // Keep default portrait orientation
    } finally {
      setOrientationsLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchImages = async (): Promise<void> => {
      setLoading(true);

      const { data: images, error } = await supabase.from("images").select(
        `
          id, url, author, title, description, created_at
        `,
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
        const fileName = img.url.split("/").pop()?.toLowerCase();
        return !fileName?.startsWith("000_aaa");
      });

      // Initially set all images as portrait to prevent layout shifts
      const initialImages: ImageWithOrientation[] = filteredImages.map(
        (img) => ({
          ...img,
          orientation: "portrait" as const,
        }),
      );

      setImages(initialImages.sort(() => Math.random() - 0.5)); // Shuffle images
      setLoading(false);

      // Asynchronously determine actual orientations (without blocking initial render)
      initialImages.forEach((img) => {
        setTimeout(
          () => updateImageOrientation(img.id, img.url),
          Math.random() * 1000,
        );
      });
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
        <>
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
                  image.orientation === "landscape"
                    ? styles.landscape
                    : styles.portrait
                }`}
              >
                <ImageWrapper
                  image={image}
                  imgRef={imgRef}
                  onLoginRequired={onLoginRequired}
                />
              </div>
            ))}
          </PhotoSwipeWrapper>
        </>
      )}
    </>
  );
};

export default ImageCard;
