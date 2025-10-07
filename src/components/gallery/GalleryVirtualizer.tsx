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
import Download from "yet-another-react-lightbox/plugins/download";
import { useModal } from "@/context/modalContext/useModal";
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

  const columnCount = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth < 500) return 2;
    if (typeof window !== "undefined" && window.innerWidth < 800) return 3;
    return 4;
  }, []);

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
          plugins={[Zoom, Download]} // <-- Add Download plugin
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
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 20,
                      width: "100%",
                      textAlign: "center",
                      color: "#fff",
                      fontSize: "1.2rem",
                      padding: "16px 24px 24px 24px",
                      background: "rgba(0,0,0,0.2)",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1,
                    }}
                  >
                    {img.author || "Untitled"}
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
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      width: "100%",
                      textAlign: "center",
                      color: "#fff",
                      fontSize: "1.2rem",
                      padding: "16px 24px 24px 24px",
                      background: "rgba(0,0,0,0.2)",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1001,
                    }}
                  >
                    {img.description || ""}
                  </div>
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
        />
      </Suspense>
    </>
  );
};

export default VirtualizedMosaicGallery;
