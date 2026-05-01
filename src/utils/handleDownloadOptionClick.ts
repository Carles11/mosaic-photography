import type { DownloadOption } from "@/utils/getAvailableDownloadOptionsForImage";

type TrackDownloadEvent = (eventName: string, value: string) => void;

export type HandleDownloadOptionClickParams = {
  option: DownloadOption;
  user: unknown | null;
  originalFilename?: string | null;
  eventName: string;
  onRequireLogin: () => void;
  trackEvent: TrackDownloadEvent;
  onErrorFallback?: (error: unknown) => void;
};

export function triggerBrowserDownload(url: string, filename?: string): void {
  const link = document.createElement("a");
  link.href = url;

  if (filename) {
    link.download = filename;
  } else {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function triggerBlobDownload(
  url: string,
  filename: string,
): Promise<void> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not fetch download URL: ${response.status}`);
  }

  const blob = await response.blob();

  if (!blob || blob.size === 0) {
    throw new Error("Downloaded blob is empty");
  }

  const objectUrl = URL.createObjectURL(blob);

  try {
    triggerBrowserDownload(objectUrl, filename);
  } finally {
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  }
}

function buildSuggestedFilename(
  originalFilename: string | null | undefined,
  option: DownloadOption,
): string {
  const safeOriginal = (originalFilename ?? "image").trim() || "image";
  const dotIndex = safeOriginal.lastIndexOf(".");
  const baseName =
    dotIndex > 0 ? safeOriginal.slice(0, dotIndex) : safeOriginal;
  const extension = (option.format || "jpg").toLowerCase();

  return `${baseName}_${option.folder}.${extension}`;
}

export function handleDownloadOptionClick({
  option,
  user,
  originalFilename,
  eventName,
  onRequireLogin,
  trackEvent,
  onErrorFallback,
}: HandleDownloadOptionClickParams): Promise<void> {
  if (!user) {
    onRequireLogin();
    trackEvent(eventName, option.url);
    return Promise.resolve();
  }

  const suggestedFilename = buildSuggestedFilename(originalFilename, option);

  return triggerBlobDownload(option.url, suggestedFilename)
    .then(() => {
      trackEvent(eventName, option.url);
    })
    .catch((error) => {
      onErrorFallback?.(error);
      // Fallback always opens in a new tab, never replacing the app tab.
      triggerBrowserDownload(option.url);
    });
}
