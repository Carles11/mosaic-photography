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
  const [imageOrientations, setImageOrientations] = useState<
    Record<string, string>
  >({});
  const [offset, setOffset] = useState<number>(0); // Tracks the current offset for pagination
  const [hasMore, setHasMore] = useState<boolean>(true); // Tracks if there are more images to load

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoad = (imgElement: HTMLImageElement, imageId: string) => {
    const { naturalWidth, naturalHeight } = imgElement;
    const isLandscape = naturalWidth > naturalHeight;
    const orientation = isLandscape ? styles.landscape : styles.portrait;

    setImageOrientations((prev) => ({
      ...prev,
      [imageId]: orientation,
    }));
  };

  const fetchImages = async (newOffset: number): Promise<void> => {
    setLoading(true);

    const { data: images, error } = await supabase
      .from("images")
      .select(
        `
          id, url, author, title, description, created_at
        `
      )
      .range(newOffset, newOffset + 49); // Fetch 50 images at a time

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!images || images.length === 0) {
      setHasMore(false); // No more images to load
      setLoading(false);
      setError("No images found.");
      return;
    }

    // Replace images on initial load, append on subsequent loads
    setImages((prevImages) =>
      newOffset === 0 ? images : [...prevImages, ...images]
    );
    setOffset(newOffset + 50); // Update the offset for the next batch
    setLoading(false);
  };

  useEffect(() => {
    fetchImages(0); // Load the first 50 images on initial render
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {loading && offset === 0 ? (
        ClimbBoxLoaderContainer("var(--text-color)", 16, loading)
      ) : (
        <>
          <PhotoSwipeWrapper
            galleryOptions={{
              zoom: true,
              initialZoomLevel: "fill",
              secondaryZoomLevel: 1,
              maxZoomLevel: 2,
              fullscreenEl: true,
              bgOpacity: 1,
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
                />
              </div>
            ))}
          </PhotoSwipeWrapper>
          {hasMore && (
            <button
              className={styles.loadMoreButton}
              onClick={() => fetchImages(offset)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          )}
        </>
      )}
    </>
  );
};

export default ImageCard;
