"use client";

import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import {
  useCallback,
  useMemo,
  useState,
  lazy,
  Suspense,
  useEffect,
  useRef,
} from "react";
import type { ImageWithOrientation } from "@/types/gallery";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { useModal } from "@/context/modalContext/useModal";
import { useAuthSession } from "@/context/AuthSessionContext";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";
import { getMosaicImageProps } from "@/utils/mosaicLayout";
import styles from "./galleryVirtualizer.module.css";
import { sendGTMEvent } from "@next/third-parties/google";
import DownloadImageButton from "@/components/buttons/DownloadImageButton";

const Lightbox = lazy(() => import("yet-another-react-lightbox"));

/**
 * Accept images that may optionally include photographer_slug.
 */
type ImageWithPhotographerSlug = ImageWithOrientation & {
  photographer_slug?: string;
};

interface VirtualizedMosaicGalleryProps {
  images: ImageWithPhotographerSlug[];
  onLoginRequired?: () => void;
}

const VirtualizedMosaicGallery: React.FC<VirtualizedMosaicGalleryProps> = ({
  images,
  onLoginRequired,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { currentModal } = useModal();
  const lastLightboxIndex = useRef<number | null>(null);
  const prevModal = useRef<unknown>(null);
  const { user } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();

  const columnCount = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth < 500) return 2;
    if (typeof window !== "undefined" && window.innerWidth < 800) return 3;
    return 4;
  }, []);

  const handleLoginRequired = useCallback(() => {
    toast.error("Please log in to download images.");
    setTimeout(() => {
      router.push("/auth/login");
    }, 1200);
  }, [router]);

  const ItemContent = useCallback(
    ({ data, index }: { data: ImageWithPhotographerSlug; index: number }) => {
      if (!data) return null;
      const {
        cssClass: mosaicClass,
        aspectRatio,
        sizes: sizesLocal,
        width: imgWidth,
        height: imgHeight,
      } = getMosaicImageProps(data.mosaicType, data.orientation);

      let cssClass = `${styles.gridItem} ${styles.imageContainer}`;
      if (mosaicClass && styles[mosaicClass]) {
        cssClass += ` ${styles[mosaicClass]}`;
      }

      return (
        <div
          className={cssClass}
          style={{ aspectRatio }}
          onClick={() => {
            setLightboxIndex(index);
            setIsLightboxOpen(true);
          }}
        >
          <ImageWrapper
            image={data}
            onLoginRequired={onLoginRequired}
            sizes={sizesLocal}
            width={imgWidth}
            height={imgHeight}
            imgStyleOverride={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      );
    },
    [onLoginRequired]
  );

  useEffect(() => {
    if (currentModal && isLightboxOpen) {
      lastLightboxIndex.current = lightboxIndex;
      setIsLightboxOpen(false);
    }
  }, [currentModal, isLightboxOpen, lightboxIndex]);

  useEffect(() => {
    if (
      prevModal.current &&
      !currentModal &&
      lastLightboxIndex.current !== null
    ) {
      setLightboxIndex(lastLightboxIndex.current);
      setIsLightboxOpen(true);
      lastLightboxIndex.current = null;
    }
    prevModal.current = currentModal;
  }, [currentModal]);

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

  return (
    <>
      <VirtuosoMasonry
        columnCount={columnCount}
        data={images}
        ItemContent={ItemContent}
        style={{ width: "100%", overflow: "visible" }}
        initialItemCount={50}
      />
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
          slides={images.map((img) => ({
            src:
              img.url || img.base_url || "/favicons/android-chrome-512x512.png",
            ...img,
            photographer_slug: img.photographer_slug,
            download:
              img.filename && img.base_url
                ? {
                    url: `${img.base_url}/originals/${img.filename}`,
                    filename: img.filename,
                  }
                : undefined,
          }))}
          index={lightboxIndex}
          plugins={[Zoom]}
          zoom={{
            maxZoomPixelRatio: 3,
            minZoom: 1,
            zoomInMultiplier: 2,
            scrollToZoom: true,
          }}
          render={{
            slide: (props) => {
              const { slide } = props;
              const slideObj = slide as Partial<ImageWithPhotographerSlug>;
              const img: ImageWithPhotographerSlug = {
                ...slideObj,
                id: slideObj.id ?? "",
                author: slideObj.author ?? "",
                title: slideObj.title ?? "",
                description: slideObj.description ?? "",
                created_at: slideObj.created_at ?? "",
                width: slideObj.width ?? 900,
                height: slideObj.height ?? 900,
                mosaicType: slideObj.mosaicType ?? "normal",
                orientation: slideObj.orientation ?? "vertical",
                s3Progressive: slideObj.s3Progressive ?? [],
                base_url: slideObj.base_url ?? "",
                filename: slideObj.filename ?? "",
                url: slideObj.url ?? "/favicons/android-chrome-512x512.png",
                photographer_slug: slideObj.photographer_slug,
              };

              const slug = img.photographer_slug ?? null;
              const targetPath = slug ? `/photographers/${slug}` : null;
              const isSamePage = targetPath ? pathname === targetPath : false;

              const onAuthorClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (targetPath && !isSamePage) {
                  router.push(targetPath);
                }
              };

              const onAuthorKeyDown = (e: React.KeyboardEvent) => {
                if (e.key === "Enter" && targetPath && !isSamePage) {
                  e.stopPropagation();
                  router.push(targetPath);
                }
              };

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
                    {targetPath && !isSamePage ? (
                      <a
                        role="link"
                        tabIndex={0}
                        onClick={onAuthorClick}
                        onKeyDown={onAuthorKeyDown}
                        style={{
                          color: "#fff",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {(img.author || "Unknown Author") +
                          ", " +
                          (img.year || "Unknown Year")}
                      </a>
                    ) : (
                      <span>
                        {(img.author || "Unknown Author") +
                          ", " +
                          (img.year || "Unknown Year")}
                      </span>
                    )}
                  </div>

                  <ImageWrapper
                    image={img}
                    imgStyleOverride={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    sizes="100vw"
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
                      fontSize: "1.2rem",
                      padding: "11px",
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
                    {img.description || ""}
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
                      imageId={img.id}
                      onLoginRequired={onLoginRequired}
                    />
                    <CommentsLauncher
                      imageId={String(img.id ?? "")}
                      onLoginRequired={onLoginRequired}
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
              (() => {
                const currentSlide = images[lightboxIndex];
                const downloadUrl =
                  currentSlide?.filename && currentSlide?.base_url
                    ? `${currentSlide.base_url}/originals/${currentSlide.filename}`
                    : null;

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

                if (!user) {
                  return (
                    <button
                      key="download"
                      title="Download"
                      className={styles.lightboxDownloadButton}
                      onClick={() => {
                        handleLoginRequired();
                        sendGTMEvent({
                          event: "downloadInGalleryClicked",
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

                return (
                  <DownloadImageButton
                    key="download"
                    url={downloadUrl}
                    filename={currentSlide?.filename}
                    className={styles.lightboxDownloadButton}
                    onStart={() => {
                      sendGTMEvent({
                        event: "downloadInGalleryClicked",
                        value: downloadUrl,
                      });
                    }}
                    onError={(err: Error) => {
                      console.error("Download failed", err);
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
    </>
  );
};

export default VirtualizedMosaicGallery;
