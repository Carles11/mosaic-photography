"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import {
  getAvailableDownloadOptionsForImage,
  type DownloadOption,
  type DownloadOptionsImageInput,
} from "@/utils/getAvailableDownloadOptionsForImage";

import styles from "./DownloadOptionsModalBody.module.css";
import { qualityConfig } from "@/lib/images/quality/qualityConfig";
import { QualityLevel } from "@/types/gallery";

interface DownloadOptionsModalBodyProps {
  image: DownloadOptionsImageInput;
  onClose: () => void;
  onDownloadOption: (option: DownloadOption) => void | Promise<void>;
  title?: string;
}

const Tooltip = dynamic(
  () => import("react-tooltip").then((mod) => mod.Tooltip),
  { ssr: false },
);

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "size unavailable";

  const units = ["B", "KB", "MB", "GB"];
  const power = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, power);
  const decimals = power === 0 ? 0 : value >= 10 ? 1 : 2;

  return `${value.toFixed(decimals)} ${units[power]}`;
}

const DownloadOptionsModalBody: React.FC<DownloadOptionsModalBodyProps> = ({
  image,
  onClose,
  onDownloadOption,
  title = "Choose your option",
}) => {
  const options = getAvailableDownloadOptionsForImage(image);
  const webpOptions = options.filter((o) => !o.isOriginal);
  const originalOption = options.find((o) => o.isOriginal) ?? null;
  const [originalFileSize, setOriginalFileSize] =
    useState<string>("checking size...");

  const printQuality = image.print_quality?.toLowerCase() ?? "";
  const quality =
    qualityConfig[printQuality as QualityLevel] ?? qualityConfig[""];
  const resolutionLabel =
    typeof image.width === "number" && typeof image.height === "number"
      ? `(${image.width} x ${image.height} px)`
      : "resolution unavailable";
  const originalSizeTooltip =
    originalFileSize === "size unavailable"
      ? "File size is unavailable for this image."
      : originalFileSize === "checking size..."
        ? "Checking file size..."
        : `Estimated size: ${originalFileSize}`;

  useEffect(() => {
    let isActive = true;

    if (!originalOption?.url) {
      setOriginalFileSize("size unavailable");
      return;
    }

    setOriginalFileSize("checking size...");

    fetch(originalOption.url, { method: "HEAD" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HEAD request failed: ${response.status}`);
        }

        const headerValue = response.headers.get("content-length");
        const bytes = headerValue ? Number(headerValue) : NaN;

        if (!Number.isFinite(bytes) || bytes <= 0) {
          throw new Error("Missing or invalid content-length header");
        }

        if (isActive) {
          setOriginalFileSize(formatBytes(bytes));
        }
      })
      .catch(() => {
        if (isActive) {
          setOriginalFileSize("size unavailable");
        }
      });

    return () => {
      isActive = false;
    };
  }, [originalOption?.url]);

  return (
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close download options"
        >
          ×
        </button>
      </div>

      <div className={styles.modalBody}>
        {options.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No download options are available for this image.</p>
          </div>
        ) : (
          <>
            <div className={`${styles.qualityBadge} ${quality.badge}`}>
              {quality.stars} {quality.label} quality - {resolutionLabel}
            </div>

            {originalOption && (
              <section className={styles.section}>
                <h3
                  className={`${styles.sectionTitle} ${styles.sectionTitlePrint}`}
                >
                  For Print
                </h3>
                <p className={styles.sectionDescription}>
                  {quality.printDescription}
                </p>
                <div className={styles.downloadActionRow}>
                  <button
                    className={`${styles.optionButton} ${styles.optionButtonOriginal}`}
                    onClick={() => onDownloadOption(originalOption)}
                  >
                    Download original ({originalOption.format.toUpperCase()})
                  </button>
                  <button
                    id="download-size-tooltip-anchor"
                    type="button"
                    className={styles.downloadSizeHint}
                    aria-label="About file size"
                  >
                    i
                  </button>
                </div>
                <Tooltip
                  anchorSelect="#download-size-tooltip-anchor"
                  content={originalSizeTooltip}
                  className={styles.downloadSizeTooltip}
                />
              </section>
            )}

            {webpOptions.length > 0 && originalOption && (
              <hr className={styles.sectionDivider} aria-hidden="true" />
            )}

            {webpOptions.length > 0 && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Fast and Free (WebP)</h3>
                <p className={styles.sectionDescription}>
                  Smaller file size, perfect for sharing and web use.
                </p>
                <div className={styles.optionsGrid}>
                  {webpOptions.map((option) => (
                    <button
                      key={option.folder}
                      className={styles.optionButton}
                      onClick={() => onDownloadOption(option)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DownloadOptionsModalBody;
