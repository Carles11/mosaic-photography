import Image from "next/image";
import GallerySkeletonCard from "@/components/cards/GallerySkeletonCard";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import styles from "./image.module.css";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";

const sizeFolders = [
  "w400",
  "w600",
  "w800",
  "w1200",
  "w1600",
  "originalsWEBP",
  "originals",
];

// Helper type for processed images
type ProcessedImage = {
  id: string;
  url: string;
  base_url?: string;
  filename?: string;
  author: string;
  orientation?: string;
  title?: string;
  mosaicType?: string;
  description?: string;
  width?: number;
  height?: number;
  src: string;
  imgWidth: number;
  imgHeight: number;
  sizes: string;
};

function buildSrcSet(img: {
  base_url: string;
  filename: string;
  width?: number;
  height?: number;
}) {
  return sizeFolders
    .filter((size) => {
      if (size === "originalsWEBP" || size === "originals") return true;
      const targetWidth = Number(size.replace("w", ""));
      return img.width ? targetWidth <= img.width : true;
    })
    .map((size) => {
      let filename = img.filename;
      if (size !== "originals") {
        filename = filename.replace(/\.(jpg|jpeg|png)$/i, ".webp");
      }
      let targetWidth: number;
      let targetHeight: number;
      if (size === "originalsWEBP" || size === "originals") {
        targetWidth = img.width ?? 1920;
        targetHeight = img.height ?? 1080;
      } else {
        targetWidth = Number(size.replace("w", ""));
        // scale height to maintain aspect ratio
        if (img.width && img.height) {
          targetHeight = Math.round(img.height * (targetWidth / img.width));
        } else {
          targetHeight = Math.round(1080 * (targetWidth / 1920)); // fallback
        }
      }
      const url = `${img.base_url}/${size}/${filename}`;
      return { url, width: targetWidth, height: targetHeight };
    });
}

interface ImageWrapperProps {
  image?: {
    id: string;
    url: string;
    base_url?: string;
    filename?: string;
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
    base_url?: string;
    filename?: string;
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
  width?: number;
  height?: number;
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
  const defaultImgWidth = 600;
  const defaultImgHeight = 750;
  const sizes =
    sizesProp ||
    `
    (max-width: 400px) 90vw, 
    (max-width: 600px) 95vw, 
    (max-width: 900px) 48vw, 
    (max-width: 1200px) 450px, 
    600px
  `.replace(/\s+/g, " ");

  let processedImages: ProcessedImage[] = [];

  if (images && images.length > 0) {
    processedImages = images.map((img) => {
      let imgWidth = img.width ?? defaultImgWidth;
      let imgHeight = img.height ?? defaultImgHeight;
      let sizesLocal = sizes;
      if (typeof img.mosaicType === "string") {
        if (
          img.mosaicType === "large" ||
          img.mosaicType === "wide" ||
          img.orientation === "horizontal"
        ) {
          imgWidth = 471;
          imgHeight = 300;
          sizesLocal = "(max-width: 600px) 100vw, 471px";
        } else if (
          img.mosaicType === "normal" ||
          img.mosaicType === "tall" ||
          img.orientation === "vertical"
        ) {
          imgWidth = 231;
          imgHeight = 300;
          sizesLocal = "(max-width: 600px) 100vw, 231px";
        } else if (img.orientation === "square") {
          imgWidth = 231;
          imgHeight = 231;
          sizesLocal = "(max-width: 600px) 100vw, 231px";
        }
      }
      let srcSetArray: Array<{ url: string; width: number; height: number }> =
        [];
      let src = img.url;
      let imgWidthFinal = imgWidth;
      let imgHeightFinal = imgHeight;

      if (img.base_url && img.filename) {
        srcSetArray = buildSrcSet({
          base_url: img.base_url,
          filename: img.filename,
          width: img.width,
          height: img.height,
        });

        // Choose the largest available width (closest to original, but not exceeding it)
        const bestOption =
          srcSetArray
            .filter((obj) => obj.width <= (img.width ?? defaultImgWidth))
            .sort((a, b) => b.width - a.width)[0] || srcSetArray[0];

        src = bestOption.url;
        imgWidthFinal = bestOption.width;
        imgHeightFinal = bestOption.height;
      }
      return {
        ...img,
        imgWidth: imgWidthFinal,
        imgHeight: imgHeightFinal,
        sizes: sizesLocal,
        src,
      };
    });
  }

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

  if (processedImages.length > 0) {
    return (
      <>
        <JsonLdSchema
          type="ImageGallery"
          name="Mosaic Photography Gallery"
          description="A curated collection of high-quality vintage photography from our archives"
          images={processedImages.map((img) => ({
            contentUrl: img.src ?? img.url,
            name: img.title || "Untitled Image",
            description:
              img.description || "Vintage photography from Mosaic's archives",
            creditText: img.author || "Unknown Photographer",
            width: typeof img.imgWidth === "number" ? img.imgWidth : 1200,
            height: typeof img.imgHeight === "number" ? img.imgHeight : 800,
            encodingFormat: (img.src ?? img.url).endsWith(".webp")
              ? "image/webp"
              : (img.src ?? img.url).endsWith(".png")
              ? "image/png"
              : (img.src ?? img.url).endsWith(".jpg") ||
                (img.src ?? img.url).endsWith(".jpeg")
              ? "image/jpeg"
              : "image/webp",
            license: "https://creativecommons.org/publicdomain/mark/1.0/",
            acquireLicensePage: "https://www.mosaic.photography/license",
          }))}
        />
        {processedImages.map((img) => {
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
                src={img.src ?? img.url}
                alt={img.title || "Gallery Image"}
                className={`${styles.imageItem} ${styles.image} ${styles.zoomInCursor}`}
                width={img.imgWidth}
                height={img.imgHeight}
                sizes={img.sizes}
                quality={60}
                placeholder="blur"
                blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
                loading={photographer ? "eager" : "lazy"}
                fetchPriority={photographer ? "high" : "auto"}
                data-image-id={imageIdString}
                style={
                  typeof styleOverride === "object" ? styleOverride : undefined
                }
                unoptimized
              />
            </div>
          );
        })}
      </>
    );
  }

  if (image) {
    let srcSetArray: Array<{ url: string; width: number; height: number }> = [];
    let src = image.url;
    let imgWidthFinal = image.width ?? defaultImgWidth;
    let imgHeightFinal = image.height ?? defaultImgHeight;

    if (image.base_url && image.filename) {
      srcSetArray = buildSrcSet({
        base_url: image.base_url,
        filename: image.filename,
        width: image.width,
        height: image.height,
      });

      // Choose the largest available width (closest to original, but not exceeding it)
      const bestOption =
        srcSetArray
          .filter((obj) => obj.width <= (image.width ?? defaultImgWidth))
          .sort((a, b) => b.width - a.width)[0] || srcSetArray[0];

      src = bestOption.url;
      imgWidthFinal = bestOption.width;
      imgHeightFinal = bestOption.height;
    }
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
          src={src}
          alt={image.title || "Gallery Image"}
          className={`${styles.imageItem} ${styles.image} ${styles.zoomInCursor}`}
          width={imgWidthFinal}
          height={imgHeightFinal}
          sizes={sizes}
          quality={60}
          placeholder="blur"
          blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
          loading={photographer ? "eager" : "lazy"}
          fetchPriority={photographer ? "high" : "auto"}
          data-image-id={imageIdString}
          style={typeof styleOverride === "object" ? styleOverride : undefined}
          unoptimized
        />
      </div>
    );
  }

  return null;
};

export default ImageWrapper;
