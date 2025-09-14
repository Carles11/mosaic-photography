// ImageWrapper: All images are loaded exclusively via Next.js <Image /> with lazy loading.
// No manual preloading, pre-caching, or window.Image() logic is used anywhere in the codebase.
// This ensures optimal SEO, accessibility, and performance. See README for details.
import React from "react";
import Image from "next/image";
import { Item } from "./PhotoSwipeWrapper";
import styles from "./image.module.css";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";

interface ImageWrapperProps {
  image: {
    id: string;
    url: string;
    author: string;
    orientation?: string;
    title?: string;
    mosaicType?: string;
  };
  imgRef?: React.RefObject<HTMLImageElement | null>;
  onLoginRequired?: () => void;
  imgStyleOverride?: React.CSSProperties;
  photographer?: boolean;
}

const ImageWrapper: React.FC<ImageWrapperProps> = ({
  image,
  imgRef,
  onLoginRequired,
  imgStyleOverride,
  photographer,
}) => {
  // Default: photographers gallery
  let imgWidth = 600; // largest desktop width you see
  let imgHeight = 750; // keep aspect ratio
  let sizes = `
    (max-width: 400px) 90vw, 
    (max-width: 600px) 95vw, 
    (max-width: 900px) 48vw, 
    (max-width: 1200px) 450px, 
    600px
  `.replace(/\s+/g, " ");

  // Mosaic gallery logic
  if (typeof image.mosaicType === "string") {
    if (
      image.mosaicType === "large" ||
      image.mosaicType === "wide" ||
      image.orientation === "horizontal"
    ) {
      imgWidth = 471;
      imgHeight = 300; // or whatever is correct for your grid
      sizes = "(max-width: 600px) 100vw, 471px";
    } else if (
      image.mosaicType === "normal" ||
      image.mosaicType === "tall" ||
      image.orientation === "vertical"
    ) {
      imgWidth = 231;
      imgHeight = 300;
      sizes = "(max-width: 600px) 100vw, 231px";
    } else if (image.orientation === "square") {
      imgWidth = 231;
      imgHeight = 231;
      sizes = "(max-width: 600px) 100vw, 231px";
    }
  }

  // Ensure ID is always a string (database might return number)
  const imageIdString = String(image.id);

  const styleOverride = imgStyleOverride;
  return (
    <>
      <div className={`${styles.imageCard} ${styles.imageContainer}`}>
        <HeartButton
          imageId={imageIdString}
          onLoginRequired={onLoginRequired}
        />
        <CommentsLauncher
          imageId={imageIdString}
          onLoginRequired={onLoginRequired}
          className={styles.commentsButton}
        />
        {!photographer ? (
          <Item
            original={image.url}
            thumbnail={image.url}
            caption={`${image.title}`}
            width={imgRef?.current?.naturalWidth}
            height={imgRef?.current?.naturalHeight}
            id={imageIdString}
            alt={imageIdString}
          >
            {(props) => (
              <Image
                ref={(node) => {
                  if (typeof props.ref === "function") {
                    props.ref(node);
                  } else if (props.ref) {
                    (
                      props.ref as React.MutableRefObject<HTMLImageElement | null>
                    ).current = node;
                  }
                }}
                src={image.url}
                alt={image.title || "Gallery Image"}
                className={`${styles.imageItem} ${styles.image}`}
                width={imgWidth}
                height={imgHeight}
                sizes={sizes}
                quality={60}
                placeholder="blur"
                blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
                loading="lazy"
                data-image-id={imageIdString}
                onClick={props.open}
                style={
                  props && "style" in props && props.style
                    ? {
                        ...props.style,
                        ...(typeof styleOverride === "object"
                          ? styleOverride
                          : {}),
                      }
                    : typeof styleOverride === "object"
                    ? styleOverride
                    : undefined
                }
              />
            )}
          </Item>
        ) : (
          <Image
            src={image.url}
            alt={image.title || "Gallery Image"}
            className={`${styles.imageItem} ${styles.image}`}
            width={imgWidth}
            height={imgHeight}
            sizes={sizes}
            quality={60}
            placeholder="blur"
            blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
            loading="lazy"
            data-image-id={imageIdString}
          />
        )}
      </div>
      {/* Comments Modal is now handled by modal context system */}
    </>
  );
};

export default ImageWrapper;
