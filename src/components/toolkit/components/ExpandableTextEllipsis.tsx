"use client";

import { useState } from "react";

export function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginBottom: "2rem", flex: 1 }}>
      <p
        style={{
          color: "var(--foreground-muted, #aaa)",
          fontSize: "0.9rem",
          lineHeight: "1.5",
          margin: 0,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: expanded ? 999 : 6,
          overflow: "hidden",
        }}
      >
        {text}
      </p>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--foreground-muted, #aaa)",
          fontSize: "0.85rem",
          padding: "0.25rem 0",
          marginTop: "0.25rem",
        }}
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
