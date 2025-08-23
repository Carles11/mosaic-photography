import { ImageWithOrientation } from "@/types/gallery";

// This function is PURE: no window, no sessionStorage, no image preloading!
export function transformGalleryImages(
  images: ImageWithOrientation[],
): ImageWithOrientation[] {
  // Remove images whose fileName starts with "000_aaa"
  const filteredImages = images.filter((img) => {
    const fileName = img.url?.split("/").pop()?.toLowerCase();
    return !fileName?.startsWith("000_aaa");
  });

  // Add mosaicType and fallback orientation
  return filteredImages.map((img, index) => {
    let mosaicType: "normal" | "large" | "wide" | "tall" = "normal";
    const isLargeMosaic = index > 0 && index % 11 === 0;
    const isWideMosaic = index > 0 && index % 13 === 7;
    const isTallMosaic = index > 0 && index % 17 === 5;

    if (isLargeMosaic) mosaicType = "large";
    else if (isWideMosaic) mosaicType = "wide";
    else if (isTallMosaic) mosaicType = "tall";

    return {
      ...img,
      orientation: img.orientation || "vertical",
      mosaicType,
    };
  });
}
