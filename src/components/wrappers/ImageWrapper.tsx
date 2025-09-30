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

function buildSrcSet(img: {
  base_url: string;
  filename: string;
  width?: number;
}) {
  return sizeFolders
    .map((size) => {
      let filename = img.filename;
      if (size !== "originals") {
        filename = filename.replace(/\.(jpg|jpeg|png)$/i, ".webp");
      }
      const width =
        size === "originalsWEBP" || size === "originals"
          ? img.width ?? 1920
          : Number(size.replace("w", ""));
      return `${img.base_url}/${size}/${filename} ${width}w`;
    })
    .join(", ");
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
    srcSet?: string;
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
    srcSet?: string;
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

  if (images && images.length > 0) {
    images = images.map((img) => {
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
      let srcSet = "";
      let src = img.url;
      if (img.base_url && img.filename) {
        srcSet = buildSrcSet(img);
        // Use .webp for non-originals folders
        const filename = img.filename.replace(/\.(jpg|jpeg|png)$/i, ".webp");
        src = `${img.base_url}/w800/${filename}`;
      }
      return { ...img, imgWidth, imgHeight, sizes: sizesLocal, srcSet, src };
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

  if (images && images.length > 0) {
    return (
      <>
        <JsonLdSchema
          type="ImageGallery"
          name="Mosaic Photography Gallery"
          description="A curated collection of high-quality vintage photography from our archives"
          images={images.map((img) => ({
            contentUrl: img.src ?? img.url,
            name: img.title || "Untitled Image",
            description:
              img.description || "Vintage photography from Mosaic's archives",
            creditText: img.author || "Unknown Photographer",
            width: typeof img.width === "number" ? img.width : 1200,
            height: typeof img.height === "number" ? img.height : 800,
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
                src={img.src ?? img.url}
                alt={img.title || "Gallery Image"}
                className={`${styles.imageItem} ${styles.image} ${styles.zoomInCursor}`}
                width={img.imgWidth}
                height={img.imgHeight}
                sizes={img.sizes}
                srcSet={img.srcSet}
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
    let srcSet = "";
    let src = image.url;
    const imgWidth = image.width ?? defaultImgWidth;
    const imgHeight = image.height ?? defaultImgHeight;
    if (image.base_url && image.filename) {
      srcSet = buildSrcSet(image);
      const filename = image.filename.replace(/\.(jpg|jpeg|png)$/i, ".webp");
      src = `${image.base_url}/w800/${filename}`;
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
          width={imgWidth}
          height={imgHeight}
          sizes={sizes}
          srcSet={srcSet}
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
