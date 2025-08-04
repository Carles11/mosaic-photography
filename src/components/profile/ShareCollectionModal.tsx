"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import styles from "./ShareCollectionModal.module.css";
import { Collection } from "@/types";

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
  const [activeTab, setActiveTab] = useState<"link" | "qr" | "email" | "embed">(
    "link",
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_emailSending, _setEmailSending] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const shareUrl = `${window.location.origin}/profile/collections/${collection.id}`;

  // Generate QR Code when needed
  useEffect(() => {
    if (activeTab === "qr" && !qrCodeDataUrl && isOpen) {
      QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then(setQrCodeDataUrl)
        .catch(console.error);
    }
  }, [activeTab, shareUrl, qrCodeDataUrl, isOpen]);

  if (!isOpen) return null;

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

  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      `Check out this collection: ${collection.name}`,
    );
    const body = encodeURIComponent(
      `I wanted to share this amazing image collection with you!\n\n` +
        `Collection: ${collection.name}\n` +
        `${collection.description ? `Description: ${collection.description}\n` : ""}` +
        `Images: ${collection.image_count || 0}\n\n` +
        `View it here: ${shareUrl}\n\n` +
        `Shared from Mosaic Photography`,
    );

    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl);
  };

  const embedCode = `<iframe src="${shareUrl}?embed=true" width="800" height="600" frameborder="0" style="border-radius: 8px;"></iframe>`;

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy embed code:", error);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement("a");
      link.download = `${collection.name.replace(/[^a-z0-9]/gi, "_")}_qr_code.png`;
      link.href = qrCodeDataUrl;
      link.click();
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
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "link" ? styles.active : ""}`}
              onClick={() => setActiveTab("link")}
            >
              🔗 Link
            </button>
            <button
              className={`${styles.tab} ${activeTab === "qr" ? styles.active : ""}`}
              onClick={() => setActiveTab("qr")}
            >
              📱 QR Code
            </button>
            <button
              className={`${styles.tab} ${activeTab === "email" ? styles.active : ""}`}
              onClick={() => setActiveTab("email")}
            >
              📧 Email
            </button>
            <button
              className={`${styles.tab} ${activeTab === "embed" ? styles.active : ""}`}
              onClick={() => setActiveTab("embed")}
            >
              🔗 Embed
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === "link" && (
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
                <p className={styles.hint}>
                  Share this link with anyone to let them view your collection.
                </p>
              </div>
            )}

            {activeTab === "qr" && (
              <div className={styles.qrSection}>
                <div className={styles.qrContainer}>
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code for collection"
                      className={styles.qrCode}
                    />
                  ) : (
                    <div className={styles.qrLoading}>
                      Generating QR Code...
                    </div>
                  )}
                </div>
                <div className={styles.qrActions}>
                  <button
                    onClick={handleDownloadQR}
                    className={styles.downloadButton}
                    disabled={!qrCodeDataUrl}
                  >
                    📥 Download QR Code
                  </button>
                </div>
                <p className={styles.hint}>
                  Scan this QR code with any smartphone camera to open the
                  collection.
                </p>
              </div>
            )}

            {activeTab === "email" && (
              <div className={styles.emailSection}>
                <div className={styles.emailPreview}>
                  <h5>Email Preview:</h5>
                  <div className={styles.emailContent}>
                    <strong>Subject:</strong> Check out this collection:{" "}
                    {collection.name}
                    <br />
                    <br />
                    <strong>Message:</strong>
                    <br />
                    I wanted to share this amazing image collection with you!
                    <br />
                    <br />
                    Collection: {collection.name}
                    <br />
                    {collection.description && (
                      <>
                        Description: {collection.description}
                        <br />
                      </>
                    )}
                    Images: {collection.image_count || 0}
                    <br />
                    <br />
                    View it here: {shareUrl}
                  </div>
                </div>
                <button
                  onClick={handleEmailShare}
                  className={styles.emailButton}
                >
                  📧 Open in Email App
                </button>
                <p className={styles.hint}>
                  This will open your default email app with a pre-written
                  message.
                </p>
              </div>
            )}

            {activeTab === "embed" && (
              <div className={styles.embedSection}>
                <label className={styles.label}>Embed Code:</label>
                <div className={styles.embedContainer}>
                  <textarea
                    value={embedCode}
                    readOnly
                    className={styles.embedTextarea}
                    rows={3}
                  />
                  <button
                    onClick={handleCopyEmbed}
                    className={`${styles.copyButton} ${embedCopied ? styles.copied : ""}`}
                  >
                    {embedCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className={styles.embedPreview}>
                  <h5>Preview:</h5>
                  <div className={styles.embedFrame}>
                    <span>📷 {collection.name}</span>
                    <small>{collection.image_count || 0} images</small>
                  </div>
                </div>
                <p className={styles.hint}>
                  Paste this code into any website to embed your collection.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
