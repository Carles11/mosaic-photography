"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Collection } from "@/types";
import { useNonCriticalCssLoaded } from "@/hooks/useNonCriticalCssLoaded";

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
  const nonCriticalCssLoaded = useNonCriticalCssLoaded();

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

  if (!nonCriticalCssLoaded) {
    return null; // TODO: add a loader or placeholder if needed
  }

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
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="header">
          <h3>Share Collection</h3>
          <button onClick={onClose} className="closeButton">
            ×
          </button>
        </div>

        <div className="content">
          <div className="collectionInfo">
            <h4>{collection.name}</h4>
            {collection.description && <p>{collection.description}</p>}
          </div>

          {/* Tab Navigation */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "link" ? "active" : ""}`}
              onClick={() => setActiveTab("link")}
            >
              🔗 Link
            </button>
            <button
              className={`tab ${activeTab === "qr" ? "active" : ""}`}
              onClick={() => setActiveTab("qr")}
            >
              📱 QR Code
            </button>
            <button
              className={`tab ${activeTab === "email" ? "active" : ""}`}
              onClick={() => setActiveTab("email")}
            >
              📧 Email
            </button>
            <button
              className={`tab ${activeTab === "embed" ? "active" : ""}`}
              onClick={() => setActiveTab("embed")}
            >
              🔗 Embed
            </button>
          </div>

          {/* Tab Content */}
          <div className="tabContent">
            {activeTab === "link" && (
              <div className="urlSection">
                <label className="label">Collection URL:</label>
                <div className="urlContainer">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="urlInput"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`copyButton ${copied ? "copied" : ""}`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="hint">
                  Share this link with anyone to let them view your collection.
                </p>
              </div>
            )}

            {activeTab === "qr" && (
              <div className="qrSection">
                <div className="qrContainer">
                  {qrCodeDataUrl ? (
                    <Image
                      src={qrCodeDataUrl}
                      alt="QR Code for collection"
                      className="qrCode"
                      width={180}
                      height={180}
                    />
                  ) : (
                    <div className="qrLoading">Generating QR Code...</div>
                  )}
                </div>
                <div className="qrActions">
                  <button
                    onClick={handleDownloadQR}
                    className="downloadButton"
                    disabled={!qrCodeDataUrl}
                  >
                    📥 Download QR Code
                  </button>
                </div>
                <p className="hint">
                  Scan this QR code with any smartphone camera to open the
                  collection.
                </p>
              </div>
            )}

            {activeTab === "email" && (
              <div className="emailSection">
                <div className="emailPreview">
                  <h5>Email Preview:</h5>
                  <div className="emailContent">
                    <label className="label" htmlFor="emailSubjectInput">
                      <strong>Subject:</strong>
                    </label>
                    <input
                      id="emailSubjectInput"
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="urlInput"
                    />
                    <br />
                    <br />
                    <label className="label" htmlFor="emailBodyTextarea">
                      <strong>Message:</strong>
                    </label>
                    <textarea
                      id="emailBodyTextarea"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="embedTextarea"
                      rows={8}
                    />
                  </div>
                </div>
                <button onClick={handleEmailShare} className="emailButton">
                  📧 Open in Email App
                </button>
                <p className="hint">
                  This will open your default email app with your custom
                  message.
                </p>
              </div>
            )}

            {activeTab === "embed" && (
              <div className="embedSection">
                <label className="label">Embed Code:</label>
                <div className="embedContainer">
                  <textarea
                    value={embedCode}
                    readOnly
                    className="embedTextarea"
                    rows={3}
                  />
                  <button
                    onClick={handleCopyEmbed}
                    className={`copyButton ${embedCopied ? "copied" : ""}`}
                  >
                    {embedCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="embedPreview">
                  <h5>Preview:</h5>
                  <div className="embedFrame">
                    <span>📷 {collection.name}</span>
                    <small>{collection.image_count || 0} images</small>
                  </div>
                </div>
                <p className="hint">
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
