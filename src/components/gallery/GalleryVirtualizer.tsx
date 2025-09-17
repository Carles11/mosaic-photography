import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { useCallback, useMemo, useState } from "react";
import type { ImageWithOrientation } from "@/types/gallery";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import styles from "../cards/ImageCard.module.css";

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
          <ImageWrapper image={data} onLoginRequired={onLoginRequired} />
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
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={images.map((img) => ({
          src: img.url,
          title: img.title,
          id: img.id,
        }))}
        index={lightboxIndex}
        plugins={[Zoom]}
        render={{
          slide: (props) => {
            const { slide } = props;
            const imageId = slide.id ?? 0;
            return (
              <div
                style={{ position: "relative", width: "100%", height: "100%" }}
              >
                <img
                  src={slide.src}
                  alt={
                    typeof slide.title === "string"
                      ? slide.title
                      : "Gallery Image"
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
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
                  {slide.title || "Untitled"}
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
    </>
  );
};

export default VirtualizedMosaicGallery;
