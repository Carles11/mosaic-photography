import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { useCallback, useMemo, useState, lazy, Suspense } from "react";
import type { ImageWithOrientation } from "@/types/gallery";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Image from "next/image";
import { getBestS3FolderForWidth, getAllS3Urls } from "@/utils/imageResizingS3";
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

  const columnCount = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth < 500) return 2;
    if (typeof window !== "undefined" && window.innerWidth < 800) return 3;
    return 4;
  }, []);

  const sizesForMosaic = (data: ImageWithOrientation) => {
    if (data.orientation === "vertical" && data.mosaicType === "large")
      return "(max-width: 400px) 90vw, (max-width: 900px) 800px, (max-width: 1200px) 1200px, 1600px";
    if (data.orientation === "vertical" && data.mosaicType === "tall")
      return "(max-width: 400px) 90vw, (max-width: 900px) 800px, (max-width: 1200px) 1200px, 1600px";
    if (data.orientation === "vertical" && data.mosaicType === "wide")
      return "(max-width: 400px) 90vw, (max-width: 900px) 1200px, 1600px";
    if (data.orientation === "vertical")
      return "(max-width: 400px) 90vw, (max-width: 900px) 600px, 800px";
    if (data.orientation === "horizontal")
      return "(max-width: 400px) 90vw, (max-width: 900px) 800px, (max-width: 1200px) 1200px, 1600px";
    return "(max-width: 400px) 90vw, (max-width: 900px) 600px, 800px";
  };

  const ItemContent = useCallback(
    ({ data, index }: { data: ImageWithOrientation; index: number }) => {
      let cssClass = styles.gridItem;
      if (data.orientation === "horizontal") {
        cssClass += ` ${styles.landscape}`;
      } else if (data.orientation === "vertical") {
        switch (data.mosaicType) {
          case "large":
            cssClass += ` ${styles.mosaicLarge}`;
            break;
          case "wide":
            cssClass += ` ${styles.mosaicWide}`;
            break;
          case "tall":
            cssClass += ` ${styles.mosaicTall}`;
            break;
          default:
            cssClass += ` ${styles.portrait}`;
        }
      } else if (data.orientation === "square") {
        cssClass += ` ${styles.portrait}`;
      }

      return (
        <div
          className={cssClass}
          onClick={() => {
            setLightboxIndex(index);
            setIsLightboxOpen(true);
          }}
        >
          <ImageWrapper
            image={{
              ...data,
              url:
                data.s3Progressive?.[0]?.url ??
                "/favicons/android-chrome-512x512.png",
            }}
            onLoginRequired={onLoginRequired}
            sizes={sizesForMosaic(data)}
            width={data.width ?? 600}
            height={data.height ?? 800}
          />
        </div>
      );
    },
    [onLoginRequired]
  );

  // Get progressive image srcs for lightbox slides
  const progressiveSlides = images.map((img) => ({
    src: getBestS3FolderForWidth(
      img,
      typeof window !== "undefined"
        ? Math.min(window.innerWidth * 0.9, 1600)
        : 900
    ).url,
    customId: img.id,
    author: img.author,
    description: img.description,
    width: img.width ?? 1920,
    height: img.height ?? 1080,
    s3Progressive: getAllS3Urls(img), // all available S3 urls for zoom steps
  }));

  return (
    <>
      <VirtuosoMasonry
        columnCount={columnCount}
        data={images}
        ItemContent={ItemContent}
        style={{ width: "100%", overflow: "visible" }}
        initialItemCount={50}
      />
      <Suspense fallback={null}>
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          slides={progressiveSlides}
          index={lightboxIndex}
          plugins={[Zoom]}
          zoom={{
            maxZoomPixelRatio: 3, // or 3 for even further zoom
            minZoom: 1,
            zoomInMultiplier: 2,
            scrollToZoom: true, // optional for mouse/trackpad users
          }}
          render={{
            slide: (props) => {
              const { slide, offset, zoom } = props;
              // For progressive zoom, we pick the best S3 image for the current zoom scale
              interface LightboxSlide {
                src: string;
                customId?: number;
                author?: string;
                description?: string;
                width?: number;
                height?: number;
                s3Progressive?: Array<{ url: string; width: number }>;
              }
              const typedSlide = slide as LightboxSlide;
              const imageId = typedSlide.customId ?? 0;
              const slideWithAuthor = slide as { author?: string };
              const slideWithDescription = slide as { description?: string };

              // Defensive: fallback for zoom
              const safeZoom = typeof zoom === "number" && zoom > 1 ? zoom : 1;
              const safeWidth = typedSlide.width ?? 900;

              // Find best progressive image for zoom (only if s3Progressive exists)
              let bestZoomImg = undefined;
              if (Array.isArray(typedSlide.s3Progressive)) {
                bestZoomImg =
                  typedSlide.s3Progressive.find(
                    (imgObj) => imgObj.width >= safeWidth * safeZoom
                  ) ||
                  typedSlide.s3Progressive[typedSlide.s3Progressive.length - 1];
              }

              const imgSrc = bestZoomImg?.url ?? typedSlide.src;
              const imgWidth = bestZoomImg?.width ?? safeWidth;
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
                      zIndex: 1001,
                    }}
                  >
                    {slideWithAuthor.author || "Untitled"}
                  </div>
                  <Image
                    src={imgSrc}
                    alt={
                      typeof slideWithDescription.description === "string"
                        ? slideWithDescription.description
                        : "Gallery Image"
                    }
                    width={imgWidth}
                    height={imgHeight}
                    sizes="100vw"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    priority
                    unoptimized
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
                    {slideWithDescription.description || ""}
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
                      imageId={imageId}
                      onLoginRequired={onLoginRequired}
                    />
                    <CommentsLauncher
                      imageId={imageId.toString()}
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
