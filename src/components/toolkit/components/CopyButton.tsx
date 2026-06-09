"use client";

import { useState } from "react";

export default function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          color: "#fff",
          fontSize: "2rem",
          fontWeight: 700,
          letterSpacing: "0.15em",
        }}
      >
        {code}
      </div>
      <button
        onClick={handleCopy}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 4,
          padding: "0.3rem 0.5rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          color: "rgba(255,255,255,0.6)",
          fontSize: "0.75rem",
          lineHeight: 1,
        }}
        aria-label="Copy promo code"
      >
        {copied ? (
          "Copied!"
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}
