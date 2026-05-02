import {
  convertToWebpExtension,
  S3_SIZE_WIDTHS,
} from "@/utils/imageResizingS3";

export type DownloadOptionsImageInput = {
  base_url?: string | null;
  filename?: string | null;
  width?: number | null;
  height?: number | null;
  print_quality?: string | null;
};

export type DownloadOption = {
  label: string;
  url: string;
  folder: string;
  width: number;
  format: string;
  isOriginal: boolean;
};

const DEFAULT_IMAGE_WIDTH = 1920;

function getSafeImageWidth(width?: number | null): number {
  if (typeof width === "number" && Number.isFinite(width) && width > 0) {
    return Math.round(width);
  }
  return DEFAULT_IMAGE_WIDTH;
}
function getSafeImageHeight(height?: number | null): number {
  if (typeof height === "number" && Number.isFinite(height) && height > 0) {
    return Math.round(height);
  }
  return DEFAULT_IMAGE_WIDTH;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export function getAvailableDownloadOptionsForImage(
  image: DownloadOptionsImageInput,
): DownloadOption[] {
  const rawBaseUrl = image.base_url?.trim() ?? "";
  const filename = image.filename?.trim() ?? "";

  if (!rawBaseUrl || !filename) {
    return [];
  }

  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  const width = getSafeImageWidth(image.width);
  const height = getSafeImageHeight(image.height);
  const printQuality = image.print_quality?.toLowerCase() ?? "";
  const availableSizes = S3_SIZE_WIDTHS.filter((size) => size <= width);

  const options: DownloadOption[] = [];

  for (const size of availableSizes) {
    options.push({
      label: `Download ${size}px (webp)`,
      url: `${baseUrl}/w${size}/${convertToWebpExtension(filename)}`,
      folder: `w${size}`,
      width: size,
      format: "webp",
      isOriginal: false,
    });
  }

  options.push({
    label: "Download original size (webp)",
    url: `${baseUrl}/originalsWEBP/${convertToWebpExtension(filename)}`,
    folder: "originalsWEBP",
    width,
    format: "webp",
    isOriginal: false,
  });

  const originalExt =
    filename.includes(".") && filename.split(".").pop()
      ? filename.split(".").pop()!.toLowerCase()
      : "jpg";
  let originalLabel = `Best available quality is ${width}x${height} px`;

  if (["excellent", "professional"].includes(printQuality)) {
    originalLabel += " - This image is optimal for print";
  }

  options.push({
    label: originalLabel,
    url: `${baseUrl}/originals/${filename}`,
    folder: "originals",
    width,
    format: originalExt,
    isOriginal: true,
  });

  return options;
}
