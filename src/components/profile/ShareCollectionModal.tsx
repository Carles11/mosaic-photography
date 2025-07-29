"use client";

import { useState } from "react";
import { Collection } from "@/types";
import styles from "./ShareCollectionModal.module.css";

interface ShareCollectionModalProps {
  isOpen: boolean;
  collection: Collection;
  onClose: () => void;
}

export default function ShareCollectionModal({
  isOpen,
  collection,
  onClose,
}: ShareCollectionModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/profile/collections/${collection.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Share Collection</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.collectionInfo}>
            <h4>{collection.name}</h4>
            {collection.description && <p>{collection.description}</p>}
            <span className={styles.privacy}>
              {collection.privacy === "public" ? "🌐 Public" : "🔒 Private"}
            </span>
          </div>

          {collection.privacy === "public" ? (
            <div className={styles.urlSection}>
              <label className={styles.label}>Collection URL:</label>
              <div className={styles.urlContainer}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className={styles.urlInput}
                />
                <button
                  onClick={handleCopyLink}
                  className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.privateMessage}>
              <p>
                This collection is private and cannot be shared. Change it to
                public in collection settings to enable sharing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
