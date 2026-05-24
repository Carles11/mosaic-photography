import React from "react";

interface ToolkitEditorialProps {
  advertiser?: { editorial_note?: Record<string, string | null> };
  locale?: string;
}

export default function ToolkitEditorial({
  advertiser,
  locale = "en",
}: ToolkitEditorialProps) {
  const note =
    advertiser?.editorial_note?.[locale] ||
    advertiser?.editorial_note?.en ||
    "";
  const hasContent = Boolean(note && note.trim());
  return (
    <section
      style={{
        margin: "2.5rem 0",
        paddingLeft: "1.5rem",
        borderLeft: "2px solid rgba(255,255,255,0.15)",
        maxWidth: "90%",
      }}
    >
      <div
        style={{
          fontSize: "0.65rem",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.6)",
          marginBottom: "0.7rem",
          letterSpacing: "0.08em",
        }}
      >
        WHY I RECOMMEND THIS
      </div>
      {hasContent ? (
        <div style={{ color: "#fff", lineHeight: 1.7 }}>{note}</div>
      ) : (
        <div
          style={{
            border: "1.5px dashed rgba(255,255,255,0.13)",
            color: "rgba(255,255,255,0.3)",
            padding: "1.2rem 1rem",
            fontStyle: "italic",
            fontSize: "1rem",
          }}
        >
          Editorial note coming soon
        </div>
      )}
    </section>
  );
}
