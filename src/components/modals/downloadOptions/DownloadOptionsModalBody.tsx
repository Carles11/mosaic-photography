"use client";

import React from "react";
import {
  getAvailableDownloadOptionsForImage,
  type DownloadOption,
  type DownloadOptionsImageInput,
} from "@/utils/getAvailableDownloadOptionsForImage";
import styles from "./DownloadOptionsModalBody.module.css";

interface DownloadOptionsModalBodyProps {
  image: DownloadOptionsImageInput;
  onClose: () => void;
  onDownloadOption: (option: DownloadOption) => void | Promise<void>;
  title?: string;
}

const DownloadOptionsModalBody: React.FC<DownloadOptionsModalBodyProps> = ({
  image,
  onClose,
  onDownloadOption,
  title = "Download image",
}) => {
  const options = getAvailableDownloadOptionsForImage(image);
  const webpOptions = options.filter((o) => !o.isOriginal);
  const originalOption = options.find((o) => o.isOriginal) ?? null;

  const printQuality = image.print_quality?.toLowerCase() ?? "";
  const isPrintQuality = ["excellent", "professional"].includes(printQuality);

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
            {isPrintQuality && (
              <div className={styles.qualityBadge}>
                ★ {printQuality.charAt(0).toUpperCase() + printQuality.slice(1)}{" "}
                quality — great for print
              </div>
            )}

            {webpOptions.length > 0 && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Fast and Free (WebP)</h3>
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

            {originalOption && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>For Print</h3>
                <button
                  className={`${styles.optionButton} ${styles.optionButtonOriginal}`}
                  onClick={() => onDownloadOption(originalOption)}
                >
                  {originalOption.label}
                </button>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DownloadOptionsModalBody;
