import { ImageWithOrientation } from "@/types";

export const S3_SIZE_WIDTHS = [400, 600, 800, 1200, 1600];

// Helper for best image size for zoomed view
export function getBestS3FolderForWidth(
  image: ImageWithOrientation,
  renderedWidth: number
) {
  // Defensive
  const imgWidth = image.width ?? 1920;
  const imgFilename = image.filename ?? "";
  const imgBaseUrl = image.base_url ?? "";
  // Find the smallest available S3 size >= renderedWidth, or largest available
  const availableSizes = S3_SIZE_WIDTHS.filter(
    (w) => w >= renderedWidth && w <= imgWidth
  );
  const bestSize =
    availableSizes.length > 0
      ? availableSizes[0]
      : S3_SIZE_WIDTHS.filter((w) => w <= imgWidth).slice(-1)[0] ?? imgWidth;

  const folder = bestSize === imgWidth ? "originalsWEBP" : `w${bestSize}`;
  const filename = imgFilename.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  return {
    url:
      imgBaseUrl && filename
        ? `${imgBaseUrl}/${folder}/${filename}`
        : image.url ?? "",
    width: bestSize,
    folder,
    filename,
  };
}

// Helper to mount all S3 URLs for progressive loading
export function getAllS3Urls(image: ImageWithOrientation) {
  const imgWidth = image.width ?? 1920;
  const imgFilename = image.filename ?? "";
  const imgBaseUrl = image.base_url ?? "";
  if (!imgBaseUrl || !imgFilename) return [];
  return S3_SIZE_WIDTHS.filter((w) => w <= imgWidth)
    .map((w) => {
      const folder = `w${w}`;
      const filename = imgFilename.replace(/\.(jpg|jpeg|png)$/i, ".webp");
      return {
        url: `${imgBaseUrl}/${folder}/${filename}`,
        width: w,
      };
    })
    .concat([
      {
        url: `${imgBaseUrl}/originalsWEBP/${imgFilename.replace(
          /\.(jpg|jpeg|png)$/i,
          ".webp"
        )}`,
        width: imgWidth,
      },
    ]);
}
