import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import GallerySkeletonCard from "@/components/cards/GallerySkeletonCard";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import styles from "./image.module.css";
import HeartButton from "@/components/buttons/HeartButton";
import { ImageWrapperProps } from "@/types/gallery";
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

function getAvailableSizes(img: { width?: number }) {
  return sizeFolders
    .filter((size) => size.startsWith("w"))
    .map((folder) => ({
      folder,
      width: Number(folder.replace("w", "")),
    }))
    .filter((obj) => (img.width ? obj.width <= img.width : true))
    .concat(img.width ? [{ folder: "originalsWEBP", width: img.width }] : []);
}

function getBestSizeFolder(
  renderedWidth: number,
  availableSizes: Array<{ folder: string; width: number }>
) {
  // Find the smallest size that's >= renderedWidth, else use the largest available
  const sorted = availableSizes.sort((a, b) => a.width - b.width);
  for (const size of sorted) {
    if (size.width >= renderedWidth) return size.folder;
  }
  return sorted[sorted.length - 1].folder;
}

function buildSrc(img: {
  base_url: string;
  filename: string;
  width?: number;
  height?: number;
  renderedWidth: number;
}) {
  const availableSizes = getAvailableSizes(img);
  const bestFolder = getBestSizeFolder(img.renderedWidth, availableSizes);
  const filename =
    bestFolder === "originals"
      ? img.filename
      : img.filename.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  return `${img.base_url}/${bestFolder}/${filename}`;
}

const ImageWrapper: React.FC<ImageWrapperProps> = ({
  image,
  images,
  loading,
  onLoginRequired,
  imgStyleOverride,
  photographer,
  sizes: sizesProp,
  showOverlayButtons = true, // Default to true for backward compatibility
}) => {
  const defaultImgWidth = 600;
  const defaultImgHeight = 750;
  const sizes =
    sizesProp ||
    `
    (max-width: 400px) 90vw,
    (max-width: 600px) 95vw,
    (max-width: 900px) 800px,
    (max-width: 1200px) 1200px,
    1600px
  `.replace(/\s+/g, " ");

  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedWidth, setRenderedWidth] = useState<number>(defaultImgWidth);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new window.ResizeObserver(([entry]) => {
      setRenderedWidth(Math.round(entry.contentRect.width));
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Gallery skeleton logic untouched
  if (loading) {
    return (
      <div style={{ display: "contents" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <GallerySkeletonCard key={i} imageHeight={220} textLines={1} />
        ))}
      </div>
    );
  }

  // Multiple images logic untouched
  if (images && images.length > 0) {
    // Existing logic as before (could be adapted for per-image responsiveness if needed)
    const processedImages = images.map((img) => {
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
      let src;
      let imgWidthFinal = imgWidth;
      let imgHeightFinal = imgHeight;
      if (img.base_url && img.filename) {
        // Use the fallback logic (choose best available <= img.width)
        const availableSizes = getAvailableSizes(img);
        const bestFolder = getBestSizeFolder(imgWidth, availableSizes);
        const filename =
          bestFolder === "originals"
            ? img.filename
            : img.filename.replace(/\.(jpg|jpeg|png)$/i, ".webp");
        src = `${img.base_url}/${bestFolder}/${filename}`;
        imgWidthFinal =
          availableSizes.find((s) => s.folder === bestFolder)?.width ??
          imgWidth;
        // scale height to maintain aspect ratio
        if (img.width && img.height) {
          imgHeightFinal = Math.round(img.height * (imgWidthFinal / img.width));
        }
      }
      return {
        ...img,
        imgWidth: imgWidthFinal,
        imgHeight: imgHeightFinal,
        sizes: sizesLocal,
        src,
      };
    });

    return (
      <>
        <JsonLdSchema
          type="ImageGallery"
          name="Mosaic Photography Gallery"
          description="A curated collection of high-quality vintage photography from our archives"
          images={processedImages.map((img) => ({
            contentUrl: img.src ?? img.url ?? "",
            name: img.title || "Untitled Image",
            description:
              img.description || "Vintage photography from Mosaic's archives",
            creditText: img.author || "Unknown Photographer",
            width: typeof img.imgWidth === "number" ? img.imgWidth : 1200,
            height: typeof img.imgHeight === "number" ? img.imgHeight : 800,
            encodingFormat: (img.src ?? img.url ?? "").endsWith(".webp")
              ? "image/webp"
              : (img.src ?? img.url ?? "").endsWith(".png")
              ? "image/png"
              : (img.src ?? img.url ?? "").endsWith(".jpg") ||
                (img.src ?? img.url ?? "").endsWith(".jpeg")
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
              {showOverlayButtons && (
                <>
                  <HeartButton
                    imageId={imageIdString ?? ""}
                    onLoginRequired={onLoginRequired}
                  />
                  <CommentsLauncher
                    imageId={imageIdString ?? ""}
                    onLoginRequired={onLoginRequired}
                    className={styles.commentsButton}
                  />
                </>
              )}
              <Image
                src={
                  img.src ?? img.url ?? "/favicons/android-chrome-512x512.png"
                }
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
                  typeof imgStyleOverride === "object"
                    ? imgStyleOverride
                    : undefined
                }
                unoptimized
              />
            </div>
          );
        })}
      </>
    );
  }

  // Single image: responsive S3 selection based on container width
  if (image) {
    let imgWidthFinal = image.width ?? defaultImgWidth;
    let imgHeightFinal = image.height ?? defaultImgHeight;
    let src = image.url ?? "";

    if (image.base_url && image.filename) {
      src = buildSrc({
        base_url: image.base_url,
        filename: image.filename,
        width: image.width,
        height: image.height,
        renderedWidth,
      });

      // scale height to maintain aspect ratio
      if (image.width && image.height) {
        imgHeightFinal = Math.round(
          image.height * (renderedWidth / image.width)
        );
        imgWidthFinal = renderedWidth;
      } else {
        imgWidthFinal = renderedWidth;
        imgHeightFinal = Math.round(
          defaultImgHeight * (renderedWidth / defaultImgWidth)
        );
      }
    }

    if (!src) {
      src = "/favicons/android-chrome-512x512.png";
    }

    const imageIdString = image ? String(image.id) : undefined;
    const styleOverride = imgStyleOverride;

    return (
      <div
        ref={containerRef}
        className={`${styles.imageCard} ${styles.imageContainer}`}
      >
        {showOverlayButtons && (
          <>
            <HeartButton
              imageId={imageIdString ?? ""}
              onLoginRequired={onLoginRequired}
            />
            <CommentsLauncher
              imageId={imageIdString ?? ""}
              onLoginRequired={onLoginRequired}
              className={styles.commentsButton}
            />
          </>
        )}
        <JsonLdSchema
          type="ImageObject"
          name={image.title || "Untitled Image"}
          description={
            image.description || "Vintage photography from Mosaic's archives"
          }
          images={[
            {
              contentUrl: src ?? "/favicons/android-chrome-512x512.png",
              name: image.title || "Untitled Image",
              description:
                image.description ||
                "Vintage photography from Mosaic's archives",
              creditText: image.author || "Unknown Photographer",
              width: imgWidthFinal,
              height: imgHeightFinal,
              encodingFormat:
                src && src.endsWith(".webp")
                  ? "image/webp"
                  : src && src.endsWith(".png")
                  ? "image/png"
                  : src && (src.endsWith(".jpg") || src.endsWith(".jpeg"))
                  ? "image/jpeg"
                  : "image/webp",
              license: "https://creativecommons.org/publicdomain/mark/1.0/",
              acquireLicensePage: "https://www.mosaic.photography/license",
            },
          ]}
        />
        <Image
          src={src ?? "/favicons/android-chrome-512x512.png"}
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
