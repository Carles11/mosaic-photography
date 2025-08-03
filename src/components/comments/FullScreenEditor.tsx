"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface FullScreenEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const FullScreenEditor: React.FC<FullScreenEditorProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  isLoading,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the textarea when the component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Prevent the main document from scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      // Restore original scroll behavior
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();

    // Ctrl+Enter to save
    if (e.ctrlKey && e.key === "Enter") {
      onSave();
    }

    // Escape to cancel
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const editorContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999999,
        padding: "1rem",
      }}
      onClick={(e) => {
        // Close if clicking the backdrop
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          padding: "1rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 1rem 0" }}>Edit Comment</h3>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            minHeight: "150px",
            padding: "0.75rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            resize: "vertical",
            marginBottom: "1rem",
            fontSize: "1rem",
          }}
          disabled={isLoading}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isLoading || !value.trim()}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#0070f3",
              color: "white",
              cursor: isLoading || !value.trim() ? "not-allowed" : "pointer",
              opacity: isLoading || !value.trim() ? 0.7 : 1,
            }}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(editorContent, document.body)
    : null;
};

export default FullScreenEditor;
