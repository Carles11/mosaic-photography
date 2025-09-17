import { useState, useEffect } from "react";
import styles from "./ImageCard.module.css";
import GallerySkeletonCard from "./GallerySkeletonCard";
import { ImageWithOrientation } from "@/types/gallery";
// import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import { useComments } from "@/context/CommentsContext";
// ImageCard: All images are loaded exclusively via Next.js <Image /> (via ImageWrapper) with lazy loading.
// Dev log: props.images will be logged inside the component for correct scope
// No manual preloading, pre-caching, or window.Image() logic is used anywhere in the codebase.
// This ensures optimal SEO, accessibility, and performance. See README for details.
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import JsonLdSchema from "@/components/seo/JsonLdSchema";

interface ImageCardProps {
  images?: ImageWithOrientation[];
  onLoginRequired?: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  images: imagesProp,
  onLoginRequired,
}) => {
  if (!imagesProp) {
    // imagesProp is undefined or null
  } else if (Array.isArray(imagesProp) && imagesProp.length === 0) {
    // imagesProp is an empty array
  }
  const [images] = useState<ImageWithOrientation[]>(imagesProp || []);

  const { loadCommentCountsBatch } = useComments();

  useEffect(() => {
    if (!images || images.length === 0) {
      return;
    }
    // Collect all image IDs as strings
    const imageIds = images.map((img) => String(img.id));
    loadCommentCountsBatch(imageIds);
  }, [images, loadCommentCountsBatch]);

  const loading = !imagesProp;
  const error = null;

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {loading ? (
        <div style={{ display: "contents" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <GallerySkeletonCard key={i} imageHeight={220} textLines={1} />
          ))}
        </div>
      ) : (
        <>
          {/* Add structured data for the image gallery */}
          <JsonLdSchema
            type="ImageGallery"
            name="Mosaic Photography Gallery"
            description="A curated collection of high-quality vintage photography from our archives"
            images={images.map((image) => ({
              contentUrl: image.url,
              name: image.title || "Untitled Image",
              description:
                image.description ||
                "Vintage photography from Mosaic's archives",
              creditText: image.author || "Unknown Photographer",
              width: typeof image.width === "number" ? image.width : 1200,
              height: typeof image.height === "number" ? image.height : 800,
              encodingFormat:
                image.url.endsWith(".jpg") || image.url.endsWith(".jpeg")
                  ? "image/jpeg"
                  : image.url.endsWith(".png")
                  ? "image/png"
                  : "image/jpeg",
              license: "https://creativecommons.org/publicdomain/mark/1.0/",
              acquireLicensePage: "https://www.mosaic.photography/license",
            }))}
          />

          {images.map((image) => {
            // ...existing code...
            // Determine CSS class based on orientation and mosaic type
            let cssClass = styles.gridItem;

            if (image.orientation === "horizontal") {
              cssClass += ` ${styles.landscape}`;
            } else if (image.orientation === "vertical") {
              // Vertical image - check for mosaic type (only for vertical images)
              switch (image.mosaicType) {
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
            } else if (image.orientation === "square") {
              cssClass += ` ${styles.portrait}`; // For now, use portrait style for square
            }

            return (
              <div key={image.id} className={cssClass}>
                <ImageWrapper image={image} onLoginRequired={onLoginRequired} />
              </div>
            );
          })}
        </>
      )}
    </>
  );
};
export default ImageCard;
