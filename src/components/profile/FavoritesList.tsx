"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import AddToCollectionModal from "./AddToCollectionModal";
import styles from "./FavoritesList.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useFavorites } from "@/context/FavoritesContext";
import { ImageData } from "@/types";

// const Tooltip = dynamic(
//   () => import("react-tooltip").then((mod) => mod.Tooltip),
//   { ssr: false }, // Disable server-side rendering
// );

interface FavoriteImageData extends ImageData {
  favoriteId: string; // To track the favorite relationship
}

interface FavoritesListProps {
  onCollectionUpdate?: () => void;
}

export default function FavoritesList({
  onCollectionUpdate,
}: FavoritesListProps) {
  const { favorites, loading, isUserLoggedIn, toggleFavorite } = useFavorites();
  const [favoriteImages, setFavoriteImages] = useState<FavoriteImageData[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [confirmUnlike, setConfirmUnlike] = useState<string | null>(null);
  const [addToCollectionModal, setAddToCollectionModal] = useState<{
    isOpen: boolean;
    imageId: string;
    imageTitle: string;
  } | null>(null);

  const loadFavoriteImages = useCallback(async () => {
    if (favorites.size === 0) {
      setFavoriteImages([]);
      return;
    }

    setImagesLoading(true);
    try {
      const imageIds = Array.from(favorites);

      const { data: images, error } = await supabase
        .from("images")
        .select("id, url, author, title, description, created_at")
        .in("id", imageIds);

      if (error) {
        console.error("Error loading favorite images:", error);
        return;
      }

      if (images) {
        // Map images and preserve the favorite relationship
        const favoriteImagesData: FavoriteImageData[] = images.map((image) => ({
          ...image,
          favoriteId: image.id,
        }));

        setFavoriteImages(favoriteImagesData);
      }
    } catch (error) {
      console.error("Error loading favorite images:", error);
    } finally {
      setImagesLoading(false);
    }
  }, [favorites]);

  // Fix useEffect dependencies
  useEffect(() => {
    loadFavoriteImages();
  }, [loadFavoriteImages]);

  const handleUnlikeClick = (imageId: string) => {
    setConfirmUnlike(imageId);
  };

  const handleConfirmUnlike = async (imageId: string) => {
    await toggleFavorite(imageId);
    setConfirmUnlike(null);
    // Remove from local state immediately for better UX
    setFavoriteImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleCancelUnlike = () => {
    setConfirmUnlike(null);
  };

  const handleAddToCollectionClick = (imageId: string, imageTitle: string) => {
    setAddToCollectionModal({
      isOpen: true,
      imageId,
      imageTitle,
    });
  };

  const handleCloseCollectionModal = () => {
    setAddToCollectionModal(null);
  };

  if (!isUserLoggedIn()) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading favorites...</p>
      </div>
    );
  }

  if (favoriteImages.length === 0 && !imagesLoading) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>♡</div>
        <h3>No favorites yet</h3>
        <p>Start exploring the gallery and heart the images you love!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Your Favorites ({favoriteImages.length})
        </h3>
        <p className={styles.subtitle}>
          Images you&apos;ve saved to your collection
        </p>
      </div>

      {imagesLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading images...</p>
        </div>
      ) : (
        <div className={styles.scrollContainer}>
          <div className={styles.grid}>
            {favoriteImages.map((image) => (
              <div key={image.id} className={styles.favoriteItem}>
                <div className={styles.imageContainer}>
                  <Image
                    src={image.url}
                    alt={image.title}
                    className={styles.image}
                    loading="lazy"
                    width={500}
                    height={300}
                    layout="responsive"
                  />
                  <div className={styles.imageOverlay}>
                    <div className={styles.imageInfo}>
                      <h4 className={styles.imageTitle}>{image.title}</h4>
                      <p className={styles.imageAuthor}>by {image.author}</p>
                    </div>
                    <div className={styles.imageActions}>
                      <button
                        id="collection-icon"
                        onClick={() =>
                          handleAddToCollectionClick(image.id, image.title)
                        }
                        className={styles.addToCollectionButton}
                        title="Add to collection"
                      >
                        <span className={styles.collectionIcon}>
                          <Image
                            src="/icons/collection-add.png"
                            width={24}
                            height={24}
                            alt="add to collection icon"
                            priority={false} // Set to true for critical images
                            loading="lazy"
                          />
                        </span>
                        {/* <Tooltip
                          anchorSelect="#collection-icon"
                          content="Add to collection"
                        /> */}
                      </button>
                      <button
                        onClick={() => handleUnlikeClick(image.id)}
                        className={styles.unlikeButton}
                        id="unlike-icon"
                        title="Remove from favorites"
                      >
                        <span className={styles.heartIcon}>💔</span>
                        {/* <Tooltip
                          anchorSelect="#unlike-icon"
                          content="Remove from favorites"
                        /> */}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirmation Modal */}
                {confirmUnlike === image.id && (
                  <div className={styles.confirmModal}>
                    <div className={styles.confirmContent}>
                      <p>Remove from favorites?</p>
                      <div className={styles.confirmActions}>
                        <button
                          onClick={() => handleConfirmUnlike(image.id)}
                          className={styles.confirmButton}
                        >
                          Yes
                        </button>
                        <button
                          onClick={handleCancelUnlike}
                          className={styles.cancelButton}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add to Collection Modal */}
      {addToCollectionModal && (
        <AddToCollectionModal
          isOpen={addToCollectionModal.isOpen}
          imageId={addToCollectionModal.imageId}
          imageTitle={addToCollectionModal.imageTitle}
          onClose={handleCloseCollectionModal}
          onAddToCollection={() => {
            // Refresh collections to show updated previews and counts
            if (onCollectionUpdate) {
              onCollectionUpdate();
            }
            console.log("Image added to collection successfully");
          }}
        />
      )}
    </div>
  );
}
