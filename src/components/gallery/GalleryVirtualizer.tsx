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
import { useRouter } from "next/navigation";
import { getMosaicImageProps } from "@/utils/mosaicLayout";
import styles from "./galleryVirtualizer.module.css";

const Lightbox = lazy(() => import("yet-another-react-lightbox"));

interface VirtualizedMosaicGalleryProps {
  images: ImageWithOrientation[];
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
    ({ data, index }: { data: ImageWithOrientation; index: number }) => {
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

  // SVG Download icon for toolbar button (Material Rounded)
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

  const onDownloadClick = (slide: {
    download?: { url: string; filename?: string };
  }) => {
    if (!user) {
      handleLoginRequired();
      return;
    }
    if (slide.download?.url) {
      const a = document.createElement("a");
      a.href = slide.download.url;
      a.download = slide.download.filename || "download.jpg";
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

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
            download:
              img.filename && img.base_url
                ? {
                    url: `${img.base_url}/originals/${img.filename}`,
                    filename: img.filename,
                  }
                : undefined,
          }))}
          index={lightboxIndex}
          plugins={[Zoom]} // Don't use Download plugin!
          zoom={{
            maxZoomPixelRatio: 3,
            minZoom: 1,
            zoomInMultiplier: 2,
            scrollToZoom: true,
          }}
          render={{
            slide: (props) => {
              const { slide } = props;
              // TypeScript-safe mapping
              const slideObj = slide as Partial<ImageWithOrientation>;
              const img: ImageWithOrientation = {
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
                    <span>
                      {(img.author || "Unknown Author") +
                        ", " +
                        (img.year || "Unknown Year")}
                    </span>
                  </div>

                  <ImageWrapper
                    image={img}
                    imgStyleOverride={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain", // For lightbox!
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
                      maxHeight: "28vh", // or "30vh"
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
                      zIndex: 2000, // make sure it's above description
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
                      imageId={img.id.toString()}
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
              <button
                key="download"
                title="Download"
                className={styles.lightboxDownloadButton}
                onClick={() => {
                  if (!user) {
                    handleLoginRequired();
                    return;
                  }
                  const currentSlide = images[lightboxIndex];
                  if (currentSlide?.filename && currentSlide?.base_url) {
                    const a = document.createElement("a");
                    a.href = `${currentSlide.base_url}/originals/${currentSlide.filename}`;
                    a.download = currentSlide.filename || "download.jpg";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    if (currentSlide) {
                      onDownloadClick({
                        download:
                          currentSlide.filename && currentSlide.base_url
                            ? {
                                url: `${currentSlide.base_url}/originals/${currentSlide.filename}`,
                                filename: currentSlide.filename,
                              }
                            : undefined,
                      });
                    }
                  }
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
              </button>,
              "close",
            ],
          }}
        />
      </Suspense>
    </>
  );
};

export default VirtualizedMosaicGallery;
