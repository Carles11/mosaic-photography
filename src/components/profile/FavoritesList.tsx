"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useModal } from "@/context/modalContext/useModal";
import styles from "./FavoritesList.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useFavorites } from "@/context/FavoritesContext";
import { ImageData } from "@/types";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import { getAllS3Urls, getProgressiveZoomSrc } from "@/utils/imageResizingS3";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

const Lightbox = lazy(() => import("yet-another-react-lightbox"));

interface FavoriteImageData extends ImageData {
  favoriteId: string; // To track the favorite relationship
}

interface FavoritesListProps {
  onCollectionUpdate?: () => void;
  onLoginRequired?: () => void;
}

export default function FavoritesList({
  onCollectionUpdate,
  onLoginRequired,
}: FavoritesListProps) {
  const { favorites, loading, isUserLoggedIn, toggleFavorite } = useFavorites();
  const [favoriteImages, setFavoriteImages] = useState<FavoriteImageData[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [confirmUnlike, setConfirmUnlike] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { open, currentModal } = useModal();
  const router = useRouter();

  const loadFavoriteImages = useCallback(async () => {
    if (favorites.size === 0) {
      setFavoriteImages([]);
      return;
    }

    setImagesLoading(true);
    try {
      const imageIds = Array.from(favorites);

      const { data: images, error } = await supabase
        .from("images_resize")
        .select(
          "id, base_url, filename, author, title, description, created_at"
        )
        .in("id", imageIds);

      if (error) {
        console.error("Error loading favorite images:", error);
        return;
      }

      if (images) {
        // Map images and preserve the favorite relationship
        const favoriteImagesData: FavoriteImageData[] = images.map((image) => {
          const s3Progressive = getAllS3Urls(image);
          return {
            ...image,
            url:
              s3Progressive?.[0]?.url ?? "/favicons/android-chrome-512x512.png",
            s3Progressive,
            favoriteId: image.id,
          };
        });

        setFavoriteImages(favoriteImagesData);
      }
    } catch (error) {
      console.error("Error loading favorite images:", error);
    } finally {
      setImagesLoading(false);
    }
  }, [favorites]);

  // Close lightbox automatically if a modal opens
  useEffect(() => {
    if (currentModal && isLightboxOpen) {
      setIsLightboxOpen(false);
    }
  }, [currentModal, isLightboxOpen]);

  // Fix useEffect dependencies
  useEffect(() => {
    loadFavoriteImages();
  }, [loadFavoriteImages]);

  const handleUnlikeClick = (imageId: string) => {
    setConfirmUnlike(imageId);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
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
    open("addToCollection", {
      imageId,
      imageTitle,
      onClose: () => {},
      onAddToCollection: () => {
        if (onCollectionUpdate) onCollectionUpdate();
        console.log("Image added to collection successfully");
      },
    });
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
            {favoriteImages.map((image, index) => (
              <div key={image.id} className={styles.favoriteItem}>
                <div
                  className={styles.imageContainer}
                  onClick={() => openLightbox(index)}
                  style={{ cursor: "pointer" }}
                >
                  <ImageWrapper
                    image={image}
                    onLoginRequired={() => {}}
                    imgStyleOverride={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                    }}
                    sizes="
                      (max-width: 480px) 160px,
                      (max-width: 768px) 180px,
                      200px
                    "
                    width={200}
                    height={200}
                    showOverlayButtons={false}
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
                      </button>
                      <button
                        onClick={() => handleUnlikeClick(image.id)}
                        className={styles.unlikeButton}
                        id="unlike-icon"
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

      {/* Add to Collection modal is provided by ModalProvider and opened via useModal().open */}

      {/* Lightbox for zooming */}
      <Suspense fallback={<div>Loading lightbox...</div>}>
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          index={lightboxIndex}
          slides={favoriteImages.map((image) => {
            const s3Progressive = getAllS3Urls(image);
            return {
              src:
                s3Progressive[s3Progressive.length - 1]?.url || image.url || "",
              alt: image.title,
              width: image.width,
              height: image.height,
              id: image.id,
              title: image.title,
              author: image.author,
              s3Progressive: s3Progressive,
            };
          })}
          plugins={[Zoom]}
          zoom={{
            maxZoomPixelRatio: 3,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
            doubleClickDelay: 300,
            doubleClickMaxStops: 2,
            keyboardMoveDistance: 50,
            wheelZoomDistanceFactor: 100,
            pinchZoomDistanceFactor: 100,
            scrollToZoom: true,
          }}
          render={{
            slide: ({ slide, rect }) => {
              const typedSlide = slide as {
                src: string;
                alt?: string;
                width?: number;
                height?: number;
                id?: string;
                title?: string;
                author?: string;
                s3Progressive?: Array<{ url: string; width: number }>;
              };
              const s3Progressive = typedSlide.s3Progressive || [];
              const getImageSrc = () => {
                if (!rect || s3Progressive.length === 0) {
                  return typedSlide.src;
                }
                const zoomLevel = Math.max(
                  rect.width / (slide.width || 1),
                  rect.height / (slide.height || 1)
                );
                return getProgressiveZoomSrc(
                  s3Progressive,
                  zoomLevel,
                  typedSlide.width ?? 900,
                  typedSlide.src
                );
              };
              return (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <ImageWrapper
                    image={{
                      ...typedSlide,
                      id: String(typedSlide.id ?? ""),
                      url: getImageSrc(),
                      width: typedSlide.width ?? 1920,
                      height: typedSlide.height ?? 1080,
                      title: typedSlide.title ?? "",
                      author: typedSlide.author ?? "",
                      created_at: "",
                      description: "",
                    }}
                    imgStyleOverride={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    sizes="100vw"
                    width={typedSlide.width ?? 1920}
                    height={typedSlide.height ?? 1080}
                    showOverlayButtons={false}
                  />
                  <div
                    style={{
                      position: "fixed",
                      bottom: 20,
                      right: 20,
                      zIndex: 9999,
                      display: "flex",
                      gap: "10px",
                      pointerEvents: "auto",
                    }}
                  >
                    <HeartButton
                      imageId={String(typedSlide.id ?? "")}
                      onLoginRequired={
                        onLoginRequired || (() => router.push("/auth/login"))
                      }
                    />
                    <CommentsLauncher
                      imageId={String(typedSlide.id ?? "")}
                      onLoginRequired={
                        onLoginRequired || (() => router.push("/auth/login"))
                      }
                    />
                  </div>
                </div>
              );
            },
          }}
          on={{
            view: ({ index }) => setLightboxIndex(index),
          }}
        />
      </Suspense>
    </div>
  );
}
