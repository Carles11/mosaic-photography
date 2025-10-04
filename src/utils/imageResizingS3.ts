import { ImageWithOrientation } from "@/types";

export const S3_SIZE_WIDTHS = [400, 600, 800, 1200, 1600];

// Centralized file extension conversion utility
export function convertToWebpExtension(filename: string): string {
  return filename.replace(/\.(jpg|jpeg|png|tif|tiff)$/i, ".webp");
}

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
  const filename = convertToWebpExtension(imgFilename);
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
      const filename = convertToWebpExtension(imgFilename);
      return {
        url: `${imgBaseUrl}/${folder}/${filename}`,
        width: w,
      };
    })
    .concat([
      {
        url: `${imgBaseUrl}/originalsWEBP/${convertToWebpExtension(
          imgFilename
        )}`,
        width: imgWidth,
      },
    ]);
}

// Helper for progressive zoom loading - selects best S3 URL based on zoom level and image dimensions
// Uses the same sophisticated algorithm as PhotographerGalleryZoom for optimal resource usage
export function getProgressiveZoomSrc(
  s3Progressive: Array<{ url: string; width: number }>,
  zoomLevel: number,
  imageWidth: number,
  fallbackSrc?: string
): string {
  if (!s3Progressive || s3Progressive.length === 0) {
    return fallbackSrc || "";
  }

  const safeZoom =
    typeof zoomLevel === "number" && zoomLevel > 1 ? zoomLevel : 1;
  const safeWidth = imageWidth ?? 900;

  // Sort available sizes
  const sorted = [...s3Progressive].sort((a, b) => a.width - b.width);

  // Calculate target width based on zoom level
  let targetWidth = safeWidth * safeZoom;
  if (safeZoom === 1) {
    targetWidth = Math.min(safeWidth, 1600); // Never pick originals for normal view
  }

  // Find best fit: largest size <= targetWidth, or smallest size >= targetWidth
  const bestFit = sorted.filter((imgObj) => imgObj.width <= targetWidth);
  const found =
    bestFit.length > 0
      ? bestFit[bestFit.length - 1]
      : sorted.find((imgObj) => imgObj.width >= targetWidth) ??
        sorted[sorted.length - 1];

  return found?.url ?? fallbackSrc ?? "";
}
