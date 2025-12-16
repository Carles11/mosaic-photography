"use client";

import React, { useState } from "react";

type Props = {
  url: string;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (err: Error) => void;
};

/**
 * DownloadImageButton
 * - Fetches the image URL as a blob, creates an object URL and triggers a download.
 * - Falls back to opening the URL in a new tab if fetch fails (CORS or network errors).
 */
export default function DownloadImageButton({
  url,
  filename,
  className,
  children = "Download",
  onStart,
  onComplete,
  onError,
}: Props) {
  const [loading, setLoading] = useState(false);

  const getFilenameFromUrl = (u: string) => {
    try {
      const p = new URL(u).pathname;
      const name = p.substring(p.lastIndexOf("/") + 1);
      return name || null;
    } catch {
      return null;
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    onStart?.();

    try {
      // Try to fetch the resource as a blob
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`Failed to fetch resource: ${res.status}`);

      const blob = await res.blob();
      const inferredExt = blob.type?.split("/")?.[1] ?? "";
      const inferredName =
        filename ??
        getFilenameFromUrl(url) ??
        `download${inferredExt ? "." + inferredExt : ""}`;

      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = inferredName;
      // ensure anchor isn't visible
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();

      // release memory
      URL.revokeObjectURL(blobUrl);

      onComplete?.();
    } catch (err) {
      // fallback: open in new tab if fetch fails (CORS or other issues)
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("DownloadImageButton error:", error);
      onError?.(error);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      disabled={loading}
      type="button"
    >
      {loading ? "Downloading…" : children}
    </button>
  );
}
