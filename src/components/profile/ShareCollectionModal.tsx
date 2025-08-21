"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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

  // Email subject and body state
  const [emailSubject, setEmailSubject] = useState(
    `Check out this collection: ${collection.name}`,
  );
  const [emailBody, setEmailBody] = useState(
    `I wanted to share this amazing image collection with you!\n\n` +
      `Collection: ${collection.name}\n` +
      `${collection.description ? `Description: ${collection.description}\n` : ""}` +
      `Images: ${collection.image_count || 0}\n\n` +
      `View it here: ${typeof window !== "undefined" ? window.location.origin : ""}/profile/collections/${collection.id}\n\n` +
      `Shared from Mosaic Photography`,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_emailSending, _setEmailSending] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/profile/collections/${collection.id}`;

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
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailBody);
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
                    <Image
                      src={qrCodeDataUrl}
                      alt="QR Code for collection"
                      className={styles.qrCode}
                      width={180}
                      height={180}
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
                    <label className={styles.label} htmlFor="emailSubjectInput">
                      <strong>Subject:</strong>
                    </label>
                    <input
                      id="emailSubjectInput"
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className={styles.urlInput}
                    />
                    <br />
                    <br />
                    <label className={styles.label} htmlFor="emailBodyTextarea">
                      <strong>Message:</strong>
                    </label>
                    <textarea
                      id="emailBodyTextarea"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className={styles.embedTextarea}
                      rows={8}
                    />
                  </div>
                </div>
                <button
                  onClick={handleEmailShare}
                  className={styles.emailButton}
                >
                  📧 Open in Email App
                </button>
                <p className={styles.hint}>
                  This will open your default email app with your custom
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
