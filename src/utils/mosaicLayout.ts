export type MosaicType = "large" | "wide" | "tall" | "normal";
export type Orientation = "vertical" | "horizontal" | "square" | undefined;

interface MosaicImageProps {
  width: number;
  height: number;
  aspectRatio: string;
  sizes: string;
  cssClass: string;
}

// Returns standardized props for a mosaic image given type & orientation
export function getMosaicImageProps(
  mosaicType: MosaicType | undefined,
  orientation: Orientation
): MosaicImageProps {
  // Defaults
  let width = 231;
  let height = 300;
  let aspectRatio = "3 / 4";
  let sizes = "(max-width: 600px) 100vw, 231px";
  let cssClass = "portrait";

  // Horizontal
  if ((orientation ?? "vertical") === "horizontal") {
    width = 471;
    height = 300;
    aspectRatio = "16 / 9";
    sizes = "(max-width: 600px) 100vw, 471px";
    cssClass = "landscape";
  } else if ((orientation ?? "square") === "square") {
    width = 231;
    height = 231;
    aspectRatio = "1 / 1";
    sizes = "(max-width: 600px) 100vw, 231px";
    cssClass = "portrait";
  }

  // Mosaic type overrides for vertical images
  if ((orientation ?? "vertical") === "vertical") {
    switch (mosaicType) {
      case "large":
        width = 471;
        height = 300;
        aspectRatio = "3 / 4";
        sizes = "(max-width: 600px) 100vw, 471px";
        cssClass = "mosaicLarge";
        break;
      case "wide":
        width = 471;
        height = 300;
        aspectRatio = "16 / 9";
        sizes = "(max-width: 600px) 100vw, 471px";
        cssClass = "mosaicWide";
        break;
      case "tall":
        width = 231;
        height = 300;
        aspectRatio = "2 / 3";
        sizes = "(max-width: 600px) 100vw, 231px";
        cssClass = "mosaicTall";
        break;
      case "normal":
        width = 231;
        height = 300;
        aspectRatio = "3 / 4";
        sizes = "(max-width: 600px) 100vw, 231px";
        cssClass = "portrait";
        break;
      default:
        // already set defaults above
        break;
    }
  }

  return { width, height, aspectRatio, sizes, cssClass };
}
