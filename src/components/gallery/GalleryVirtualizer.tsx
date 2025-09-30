import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { useCallback, useMemo, useState, lazy, Suspense } from "react";
import type { ImageWithOrientation } from "@/types/gallery";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Image from "next/image";
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
            image={data}
            onLoginRequired={onLoginRequired}
            sizes={
              data.orientation === "vertical" && data.mosaicType === "large"
                ? "(max-width: 400px) 90vw, (max-width: 900px) 50vw, (max-width: 1600px) 630px, 875px"
                : data.orientation === "vertical" && data.mosaicType === "tall"
                ? "(max-width: 400px) 90vw, (max-width: 900px) 48vw, (max-width: 1600px) 777px, 912px"
                : data.orientation === "vertical" && data.mosaicType === "wide"
                ? "(max-width: 400px) 90vw, (max-width: 900px) 52vw, (max-width: 1600px) 896px, 896px"
                : data.orientation === "vertical"
                ? "(max-width: 400px) 90vw, (max-width: 900px) 48vw, (max-width: 1600px) 600px, 896px"
                : data.orientation === "horizontal"
                ? "(max-width: 400px) 90vw, (max-width: 900px) 52vw, (max-width: 1600px) 623px, 875px"
                : "(max-width: 400px) 90vw, (max-width: 900px) 48vw, (max-width: 1600px) 600px, 896px"
            }
            width={data.width ?? 600}
            height={data.height ?? 800}
          />
        </div>
      );
    },
    [onLoginRequired]
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
      <Suspense fallback={null}>
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          slides={images.map((img) => {
            // For originalsWEBP, always .webp
            const filename = img.filename.replace(
              /\.(jpg|jpeg|png)$/i,
              ".webp"
            );
            return {
              src: `${img.base_url}/originalsWEBP/${filename}`,
              customId: img.id,
              title: img.title,
              width: img.width ?? 1920,
              height: img.height ?? 1080,
            };
          })}
          index={lightboxIndex}
          plugins={[Zoom]}
          render={{
            slide: (props) => {
              const { slide } = props;
              interface LightboxSlide {
                src: string;
                customId?: number;
                title?: string;
                width?: number;
                height?: number;
              }
              const typedSlide = slide as LightboxSlide;
              const imageId = typedSlide.customId ?? 0;
              const slideWithTitle = slide as { title?: string };

              return (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Image
                    src={typedSlide.src}
                    alt={
                      typeof typedSlide.title === "string"
                        ? typedSlide.title
                        : "Gallery Image"
                    }
                    width={typedSlide.width ?? 1920}
                    height={typedSlide.height ?? 1080}
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
                      background: "rgba(0,0,0,0.6)",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1001,
                    }}
                  >
                    {slideWithTitle.title || "Untitled"}
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
