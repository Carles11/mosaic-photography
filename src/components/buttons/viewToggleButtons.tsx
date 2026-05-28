import React from "react";
import styles from "./viewToggleButtons.module.css";

type ViewMode = "list" | "grid";

interface ViewToggleButtonsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewToggleButtons: React.FC<ViewToggleButtonsProps> = ({
  viewMode,
  setViewMode,
}) => (
  <div className={styles.viewToggle}>
    <button
      className={
        viewMode === "list" ? styles.viewToggleBtnActive : styles.viewToggleBtn
      }
      onClick={() => setViewMode("list")}
      aria-label="List view"
      type="button"
    >
      {/* List icon SVG */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="5" width="14" height="2" rx="1" fill="currentColor" />
        <rect x="4" y="10" width="14" height="2" rx="1" fill="currentColor" />
        <rect x="4" y="15" width="14" height="2" rx="1" fill="currentColor" />
      </svg>
    </button>
    <button
      className={
        viewMode === "grid" ? styles.viewToggleBtnActive : styles.viewToggleBtn
      }
      onClick={() => setViewMode("grid")}
      aria-label="Grid view"
      type="button"
    >
      {/* Grid icon SVG */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="4" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="13" y="4" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="4" y="13" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="13" y="13" width="5" height="5" rx="1" fill="currentColor" />
      </svg>
    </button>
  </div>
);

export default ViewToggleButtons;
