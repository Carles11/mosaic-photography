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
}: HandleDownloadOptionClickParams): void {
  if (!user) {
    onRequireLogin();
    trackEvent(eventName, option.url);
    return;
  }

  const suggestedFilename = buildSuggestedFilename(originalFilename, option);

  try {
    triggerBrowserDownload(option.url, suggestedFilename);
    trackEvent(eventName, option.url);
  } catch (error) {
    onErrorFallback?.(error);
    triggerBrowserDownload(option.url);
  }
}
