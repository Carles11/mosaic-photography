// ImageWrapper: All images are loaded exclusively via Next.js <Image /> with lazy loading.
// No manual preloading, pre-caching, or window.Image() logic is used anywhere in the codebase.
// This ensures optimal SEO, accessibility, and performance. See README for details.
import Image from "next/image";
import GallerySkeletonCard from "@/components/cards/GallerySkeletonCard";
import JsonLdSchema from "@/components/seo/JsonLdSchema";

import styles from "./image.module.css";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";

interface ImageWrapperProps {
  image?: {
    id: string;
    url: string;
    author: string;
    orientation?: string;
    title?: string;
    mosaicType?: string;
    description?: string;
    width?: number;
    height?: number;
  };
  images?: Array<{
    id: string;
    url: string;
    author: string;
    orientation?: string;
    title?: string;
    mosaicType?: string;
    description?: string;
    width?: number;
    height?: number;
  }>;
  loading?: boolean;
  onLoginRequired?: () => void;
  imgStyleOverride?: React.CSSProperties;
  photographer?: boolean;
  sizes?: string;
  onLoad?: () => void;
}

const ImageWrapper: React.FC<ImageWrapperProps> = ({
  image,
  images,
  loading,
  onLoginRequired,
  imgStyleOverride,
  photographer,
  sizes: sizesProp,
}) => {
  // Default: photographers gallery
  const imgWidth = 600; // largest desktop width you see
  const imgHeight = 750; // keep aspect ratio
  const sizes =
    sizesProp ||
    `
    (max-width: 400px) 90vw, 
    (max-width: 600px) 95vw, 
    (max-width: 900px) 48vw, 
    (max-width: 1200px) 450px, 
    600px
  `.replace(/\s+/g, " ");

  // Mosaic gallery logic for multiple images
  if (images && images.length > 0) {
    images = images.map((img) => {
      let imgWidth = 600;
      let imgHeight = 750;
      let sizes =
        sizesProp ||
        `
        (max-width: 400px) 90vw, 
        (max-width: 600px) 95vw, 
        (max-width: 900px) 48vw, 
        (max-width: 1200px) 450px, 
        600px
      `.replace(/\s+/g, " ");
      if (typeof img.mosaicType === "string") {
        if (
          img.mosaicType === "large" ||
          img.mosaicType === "wide" ||
          img.orientation === "horizontal"
        ) {
          imgWidth = 471;
          imgHeight = 300;
          sizes = "(max-width: 600px) 100vw, 471px";
        } else if (
          img.mosaicType === "normal" ||
          img.mosaicType === "tall" ||
          img.orientation === "vertical"
        ) {
          imgWidth = 231;
          imgHeight = 300;
          sizes = "(max-width: 600px) 100vw, 231px";
        } else if (img.orientation === "square") {
          imgWidth = 231;
          imgHeight = 231;
          sizes = "(max-width: 600px) 100vw, 231px";
        }
      }
      return { ...img, imgWidth, imgHeight, sizes };
    });
  }

  // Ensure ID is always a string (database might return number)
  const imageIdString = image ? String(image.id) : undefined;
  const styleOverride = imgStyleOverride;

  if (loading) {
    return (
      <div style={{ display: "contents" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <GallerySkeletonCard key={i} imageHeight={220} textLines={1} />
        ))}
      </div>
    );
  }

  // Add structured data for the image gallery
  if (images && images.length > 0) {
    return (
      <>
        <JsonLdSchema
          type="ImageGallery"
          name="Mosaic Photography Gallery"
          description="A curated collection of high-quality vintage photography from our archives"
          images={images.map((img) => ({
            contentUrl: img.url,
            name: img.title || "Untitled Image",
            description:
              img.description || "Vintage photography from Mosaic's archives",
            creditText: img.author || "Unknown Photographer",
            width: typeof img.width === "number" ? img.width : 1200,
            height: typeof img.height === "number" ? img.height : 800,
            encodingFormat:
              img.url.endsWith(".jpg") || img.url.endsWith(".jpeg")
                ? "image/jpeg"
                : img.url.endsWith(".png")
                ? "image/png"
                : "image/jpeg",
            license: "https://creativecommons.org/publicdomain/mark/1.0/",
            acquireLicensePage: "https://www.mosaic.photography/license",
          }))}
        />
        {images.map((img) => {
          const imageIdString = String(img.id);
          return (
            <div
              key={img.id}
              className={`${styles.imageCard} ${styles.imageContainer}`}
            >
              <HeartButton
                imageId={imageIdString ?? ""}
                onLoginRequired={onLoginRequired}
              />
              <CommentsLauncher
                imageId={imageIdString ?? ""}
                onLoginRequired={onLoginRequired}
                className={styles.commentsButton}
              />
              <Image
                src={img.url}
                alt={img.title || "Gallery Image"}
                className={`${styles.imageItem} ${styles.image} ${styles.zoomInCursor}`}
                width={imgWidth}
                height={imgHeight}
                sizes={sizes}
                quality={60}
                placeholder="blur"
                blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
                loading={photographer ? "eager" : "lazy"}
                fetchPriority={photographer ? "high" : "auto"}
                data-image-id={imageIdString}
                style={
                  typeof styleOverride === "object" ? styleOverride : undefined
                }
              />
            </div>
          );
        })}
      </>
    );
  }

  // Fallback: single image
  if (image) {
    return (
      <div className={`${styles.imageCard} ${styles.imageContainer}`}>
        <HeartButton
          imageId={imageIdString ?? ""}
          onLoginRequired={onLoginRequired}
        />
        <CommentsLauncher
          imageId={imageIdString ?? ""}
          onLoginRequired={onLoginRequired}
          className={styles.commentsButton}
        />
        <Image
          src={image.url}
          alt={image.title || "Gallery Image"}
          className={`${styles.imageItem} ${styles.image} ${styles.zoomInCursor}`}
          width={imgWidth}
          height={imgHeight}
          sizes={sizes}
          quality={60}
          placeholder="blur"
          blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
          loading={photographer ? "eager" : "lazy"}
          fetchPriority={photographer ? "high" : "auto"}
          data-image-id={imageIdString}
          style={typeof styleOverride === "object" ? styleOverride : undefined}
        />
      </div>
    );
  }

  return null;
};

export default ImageWrapper;
