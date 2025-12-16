"use client";

import {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
  useRef,
  useMemo,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useModal } from "@/context/modalContext/useModal";
import styles from "./FavoritesList.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuthSession } from "@/context/AuthSessionContext";
import toast from "react-hot-toast";
import { ImageData } from "@/types";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import { getAllS3Urls, getProgressiveZoomSrc } from "@/utils/imageResizingS3";
import { getMosaicImageProps } from "@/utils/mosaicLayout";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { sendGTMEvent } from "@next/third-parties/google";
import DownloadImageButton from "@/components/buttons/DownloadImageButton";

const Lightbox = lazy(() => import("yet-another-react-lightbox"));

interface FavoriteImageData extends ImageData {
  favoriteId: string;
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
  const lastLightboxIndex = useRef<number | null>(null);
  const prevModal = useRef<string | null>(null);
  const { user } = useAuthSession();

  // SVG Download icon (Material style)
  const DownloadIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="11" fill="rgba(244,211,94,0.10)" />
      <path
        d="M11 6.5v5m0 0-2.5-2.5m2.5 2.5 2.5-2.5M5.833 15.5h10.334"
        stroke="#F4D35E"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Memoize mapped favorite images for performance
  const mappedFavoriteImages = useMemo(() => {
    return favoriteImages.map((image) => ({
      ...image,
      ...getMosaicImageProps(image.mosaicType, image.orientation),
    }));
  }, [favoriteImages]);

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
          "id, base_url, filename, author, title, description, orientation,created_at, width, height, year"
        )
        .in("id", imageIds);

      if (error) {
        console.error("Error loading favorite images:", error);
        setImagesLoading(false);
        return;
      }

      if (images) {
        const favoriteImagesData: FavoriteImageData[] = images.map((image) => ({
          ...image,
          favoriteId: image.id,
          width: image.width ?? 1920,
          height: image.height ?? 1080,
        }));

        setFavoriteImages(favoriteImagesData);
      }
    } catch (error) {
      console.error("Error loading favorite images:", error);
    } finally {
      setImagesLoading(false);
    }
  }, [favorites]);

  const openLightbox = useCallback((index?: number) => {
    setLightboxIndex(
      lastLightboxIndex.current !== null
        ? lastLightboxIndex.current
        : index ?? 0
    );
    setIsLightboxOpen(true);
    lastLightboxIndex.current = null;
  }, []);

  useEffect(() => {
    if (currentModal && isLightboxOpen) {
      lastLightboxIndex.current = lightboxIndex;
      setIsLightboxOpen(false);
    }
  }, [currentModal, isLightboxOpen, lightboxIndex]);

  useEffect(() => {
    loadFavoriteImages();
  }, [loadFavoriteImages]);

  useEffect(() => {
    if (
      prevModal.current &&
      prevModal.current !== "addToCollection" &&
      !currentModal &&
      lastLightboxIndex.current !== null
    ) {
      openLightbox();
    }
    prevModal.current = currentModal;
  }, [currentModal, openLightbox]);

  const handleUnlikeClick = (imageId: string) => {
    setConfirmUnlike(imageId);
  };

  const handleConfirmUnlike = async (imageId: string) => {
    await toggleFavorite(imageId);
    setConfirmUnlike(null);
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

  if (mappedFavoriteImages.length === 0 && !imagesLoading) {
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
          Your Favorites ({mappedFavoriteImages.length})
        </h3>
        <p className={styles.subtitle}>
          Images you&apos;ve saved to your favorites list.
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
            {mappedFavoriteImages.map((image, index) => (
              <div key={image.id} className={styles.favoriteItem}>
                <div
                  className={`${styles.imageContainer} ${
                    image.cssClass ? styles[image.cssClass] : ""
                  }`}
                  onClick={() => openLightbox(index)}
                  style={{ cursor: "pointer", aspectRatio: image.aspectRatio }}
                >
                  <ImageWrapper
                    image={{
                      ...image,
                      year:
                        typeof image.year === "number" ? image.year : undefined,
                    }}
                    onLoginRequired={() => {}}
                    sizes={image.sizes}
                    width={image.width}
                    height={image.height}
                    imgStyleOverride={
                      image.orientation === "horizontal"
                        ? {
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                          }
                        : {
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                          }
                    }
                    showOverlayButtons={false}
                  />
                  <div className={styles.imageOverlay}>
                    <div className={styles.imageInfo}>
                      <p className={styles.imageAuthor}>by {image.author}</p>
                      <h4 className={styles.imageTitle}>{image.title}</h4>
                    </div>
                    <div className={styles.imageActions}>
                      <button
                        id="collection-icon"
                        onClick={() =>
                          handleAddToCollectionClick(image.id, image.title)
                        }
                        className={styles.addToCollectionButton}
                        title="Add to collection"
                        aria-label="Add to collection"
                      >
                        <span className={styles.collectionIcon}>
                          <Image
                            src="/icons/collection-add.png"
                            width={24}
                            height={24}
                            alt="add to collection icon"
                            priority={false}
                            loading="lazy"
                          />
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlikeClick(image.id);
                        }}
                        className={styles.unlikeButton}
                        id="unlike-icon"
                        title="Remove from favorites"
                        aria-label="Remove from favorites"
                      >
                        <span className={styles.heartIcon}>💔</span>
                      </button>
                    </div>
                  </div>
                </div>

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

      <Suspense
        fallback={
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading lightbox...</p>
          </div>
        }
      >
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          index={lightboxIndex}
          slides={mappedFavoriteImages.map((image) => {
            const s3Progressive = getAllS3Urls(image);
            return {
              src: getProgressiveZoomSrc(
                s3Progressive,
                1,
                image.width,
                image.url ?? ""
              ),
              alt: image.title,
              width: image.width,
              height: image.height,
              id: image.id,
              title: image.title,
              author: image.author,
              description: image.description,
              s3Progressive,
              year: image.year ?? "",
              download:
                image.filename && image.base_url
                  ? {
                      url: `${image.base_url}/originals/${image.filename}`,
                      filename: image.filename,
                    }
                  : undefined,
            };
          })}
          plugins={[Zoom]} // No Download plugin, use toolbar!
          zoom={{
            maxZoomPixelRatio: 3,
            minZoom: 1,
            zoomInMultiplier: 2,
            scrollToZoom: true,
          }}
          render={{
            slide: ({ slide, zoom }) => {
              const typedSlide = slide as {
                src: string;
                alt?: string;
                year?: string | number;
                width?: number;
                height?: number;
                id?: string;
                title?: string;
                author?: string;
                description?: string;
                s3Progressive?: Array<{ url: string; width: number }>;
              };
              const s3Progressive = typedSlide.s3Progressive || [];
              const safeZoom = typeof zoom === "number" && zoom > 1 ? zoom : 1;
              const safeWidth = typedSlide.width ?? 900;
              const imgSrc = getProgressiveZoomSrc(
                s3Progressive,
                safeZoom,
                safeWidth,
                typedSlide.src
              );
              const selectedImgObj = s3Progressive.find(
                (imgObj) => imgObj.url === imgSrc
              );
              const imgWidth = selectedImgObj?.width ?? safeWidth;
              const imgHeight = typedSlide.height
                ? Math.round(
                    typedSlide.height *
                      (imgWidth / (typedSlide.width ?? imgWidth))
                  )
                : 1080;
              return (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div
                    className={styles.lightboxAuthor}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "22px",
                      textAlign: "center",
                      color: "#fff",
                      fontSize: "1.2rem",
                      padding: "11px",
                      background: "rgba(0,0,0,0.2)",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span>
                      {(typedSlide.author || "Unknown Author") +
                        ", " +
                        (typedSlide.year || "Unknown Year")}
                    </span>
                  </div>
                  <ImageWrapper
                    image={{
                      ...typedSlide,
                      id: String(typedSlide.id ?? ""),
                      url: imgSrc,
                      width: imgWidth,
                      height: imgHeight,
                      title: typedSlide.title ?? "",
                      author: typedSlide.author ?? "",
                      created_at: "",
                      description: typedSlide.description ?? "",
                      year:
                        typeof typedSlide.year === "number"
                          ? typedSlide.year
                          : typeof typedSlide.year === "string"
                          ? Number(typedSlide.year) || undefined
                          : undefined,
                    }}
                    imgStyleOverride={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    sizes="100vw"
                    width={imgWidth}
                    height={imgHeight}
                    showOverlayButtons={false}
                  />
                  <div
                    className={styles.lightboxDescription}
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      width: "100%",
                      textAlign: "center",
                      color: "#fff",
                      fontSize: "1.04rem",
                      padding: "16px 24px 64px 24px",
                      background: "rgba(0,0,0,0.4)",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1001,
                      maxHeight: "28vh",
                      overflowY: "auto",
                      boxSizing: "border-box",
                      pointerEvents: "auto",
                      marginBottom: "0",
                    }}
                  >
                    {typedSlide.description || ""}
                  </div>
                  <div
                    className={styles.lightboxButtonRow}
                    style={{
                      position: "fixed",
                      bottom: 20,
                      right: 20,
                      zIndex: 2000,
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
          toolbar={{
            buttons: [
              // Use DownloadImageButton in the toolbar for consistent behavior.
              (() => {
                const currentSlide = mappedFavoriteImages[lightboxIndex];
                const downloadUrl =
                  currentSlide?.filename && currentSlide?.base_url
                    ? `${currentSlide.base_url}/originals/${currentSlide.filename}`
                    : null;

                // No download available -> disabled icon
                if (!downloadUrl) {
                  return (
                    <button
                      key="download"
                      title="Download"
                      aria-label="Download"
                      className={styles.lightboxDownloadButton}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fff",
                        marginRight: 8,
                        fontSize: 14,
                        cursor: "not-allowed",
                        opacity: 0.5,
                      }}
                      disabled
                    >
                      <DownloadIcon />
                    </button>
                  );
                }

                // Not logged in -> prompt login and record attempted download
                if (!user) {
                  return (
                    <button
                      key="download"
                      title="Download"
                      className={styles.lightboxDownloadButton}
                      onClick={() => {
                        toast.error("Please log in to download images.");
                        setTimeout(() => {
                          router.push("/auth/login");
                        }, 1200);
                        sendGTMEvent({
                          event: "downloadInFavoritesClicked",
                          value: downloadUrl,
                        });
                      }}
                      aria-label="Download"
                      tabIndex={0}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fff",
                        marginRight: 8,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      <DownloadIcon />
                    </button>
                  );
                }

                // Logged in -> use fetch-based downloader component
                return (
                  <DownloadImageButton
                    key="download"
                    url={downloadUrl}
                    filename={currentSlide?.filename}
                    className={styles.lightboxDownloadButton}
                    onStart={() => {
                      sendGTMEvent({
                        event: "downloadInFavoritesClicked",
                        value: downloadUrl,
                      });
                    }}
                    onError={(err: Error) => {
                      console.error(
                        "Download failed, fallback will open in new tab",
                        err
                      );
                      toast.error(
                        "Could not download file directly — opening in a new tab."
                      );
                    }}
                  >
                    <DownloadIcon />
                  </DownloadImageButton>
                );
              })(),
              "close",
            ],
          }}
        />
      </Suspense>
    </div>
  );
}
