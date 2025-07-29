"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useFavorites } from "@/context/FavoritesContext";
import { ImageData } from "@/types";
import AddToCollectionModal from "./AddToCollectionModal";
import styles from "./FavoritesList.module.css";

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

  const loadFavoriteImages = async () => {
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
          favoriteId: image.id, // Use image.id as the favorite identifier
        }));

        setFavoriteImages(favoriteImagesData);
      }
    } catch (error) {
      console.error("Error loading favorite images:", error);
    } finally {
      setImagesLoading(false);
    }
  };

  useEffect(() => {
    loadFavoriteImages();
  }, [favorites]);

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
                  <img
                    src={image.url}
                    alt={image.title}
                    className={styles.image}
                    loading="lazy"
                  />
                  <div className={styles.imageOverlay}>
                    <div className={styles.imageInfo}>
                      <h4 className={styles.imageTitle}>{image.title}</h4>
                      <p className={styles.imageAuthor}>by {image.author}</p>
                    </div>
                    <div className={styles.imageActions}>
                      <button
                        onClick={() =>
                          handleAddToCollectionClick(image.id, image.title)
                        }
                        className={styles.addToCollectionButton}
                        title="Add to collection"
                      >
                        <span className={styles.collectionIcon}>📁</span>
                      </button>
                      <button
                        onClick={() => handleUnlikeClick(image.id)}
                        className={styles.unlikeButton}
                        title="Remove from favorites"
                      >
                        <span className={styles.heartIcon}>💔</span>
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
