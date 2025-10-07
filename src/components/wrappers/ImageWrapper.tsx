import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import GallerySkeletonCard from "@/components/cards/GallerySkeletonCard";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import styles from "./image.module.css";
import HeartButton from "@/components/buttons/HeartButton";
import { ImageWrapperProps } from "@/types/gallery";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import { getMosaicImageProps } from "@/utils/mosaicLayout";
import {
  getBestS3FolderForWidth,
  getAllS3Urls,
  getImageStyle,
} from "@/utils/imageResizingS3";

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

  // Multiple images logic (gallery thumbnails)
  if (images && images.length > 0) {
    const processedImages = images.map((img) => {
      // DRY: Use central utility for mosaic sizing/layout info
      const {
        width: imgWidth,
        height: imgHeight,
        sizes: sizesLocal,
        cssClass: mosaicClass,
        aspectRatio,
      } = getMosaicImageProps(img.mosaicType, img.orientation);

      // Use shared S3 utility for best URL and dimensions
      const s3Result =
        img.base_url && img.filename
          ? getBestS3FolderForWidth(img, imgWidth)
          : { url: img.url ?? "", width: imgWidth, folder: "", filename: "" };

      // Calculate height to maintain aspect ratio
      let imgHeightFinal = imgHeight;
      if (img.width && img.height) {
        imgHeightFinal = Math.round(img.height * (s3Result.width / img.width));
      }

      return {
        ...img,
        imgWidth: s3Result.width,
        imgHeight: imgHeightFinal,
        sizes: sizesLocal,
        src: s3Result.url,
        mosaicClass,
        aspectRatio,
        s3Progressive: getAllS3Urls(img), // for zoom/gallery use
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
              className={
                `${styles.imageCard} ${styles.imageContainer} ` +
                (img.mosaicClass ? styles[img.mosaicClass] : "")
              }
              style={{ aspectRatio: img.aspectRatio }}
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
                alt={img.title || "Gallery Image in Mosaic.photography"}
                className={
                  `${styles.imageItem} ${styles.image} ` +
                  (photographer
                    ? ` ${styles.goToLinkCursor}`
                    : `${styles.zoomInCursor}`)
                }
                width={img.imgWidth}
                height={img.imgHeight}
                sizes={img.sizes}
                quality={60}
                placeholder="blur"
                blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
                loading={photographer ? "eager" : "lazy"}
                fetchPriority={photographer ? "high" : "auto"}
                data-image-id={imageIdString}
                style={getImageStyle(
                  img.orientation ?? "vertical",
                  imgStyleOverride
                )}
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
      // Use shared S3 utility for responsive picking
      const s3Result = getBestS3FolderForWidth(image, renderedWidth);

      src = s3Result.url;
      imgWidthFinal = s3Result.width;

      // scale height to maintain aspect ratio
      if (image.width && image.height) {
        imgHeightFinal = Math.round(
          image.height * (imgWidthFinal / image.width)
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
          alt={image.title || "Gallery Image in Mosaic.photography"}
          width={imgWidthFinal}
          height={imgHeightFinal}
          sizes={sizes}
          quality={60}
          placeholder="blur"
          blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
          loading={photographer ? "eager" : "lazy"}
          fetchPriority={photographer ? "high" : "auto"}
          data-image-id={imageIdString}
          style={getImageStyle(image.orientation ?? "vertical", styleOverride)}
          unoptimized
        />
      </div>
    );
  }

  return null;
};

export default ImageWrapper;
