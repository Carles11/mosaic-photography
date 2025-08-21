"use client";

import React, { useEffect } from "react";
import styles from "./CommentsButton.module.css";
import { useComments } from "@/context/CommentsContext";
// import dynamic from "next/dynamic";

// const Tooltip = dynamic(
//   () => import("react-tooltip").then((mod) => mod.Tooltip),
//   { ssr: false }, // Disable server-side rendering
// );

interface CommentsButtonProps {
  imageId: string;
  className?: string;
  onOpenModal: () => void;
}

const CommentsButton: React.FC<CommentsButtonProps> = ({
  imageId,
  className = "",
  onOpenModal,
}) => {
  const { getCommentCount, loadCommentCount, loadCommentsForImage } =
    useComments();

  // Load lightweight comment count on mount to show badge
  useEffect(() => {
    // Use a small random delay to spread out requests when many buttons mount
    const timeoutId = setTimeout(() => {
      loadCommentCount(imageId);
    }, Math.random() * 200); // Random delay between 0-200ms

    return () => clearTimeout(timeoutId);
  }, [imageId, loadCommentCount]);

  // Get comment count for badge display
  const commentCount = getCommentCount(imageId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering image click/zoom

    // Load full comments when user actually wants to see them
    await loadCommentsForImage(imageId);
    onOpenModal();
  };

  return (
    <button
      id="heart-icon"
      className={`${styles.commentsButton} ${className}`}
      onClick={handleClick}
      aria-label={`View comments${commentCount > 0 ? ` (${commentCount})` : ""}`}
      title={`View comments${commentCount > 0 ? ` (${commentCount})` : ""}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.icon}
      >
        <path
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {commentCount > 0 && <span className={styles.badge}>{commentCount}</span>}
      {/* <Tooltip
        anchorSelect="#heart-icon"
        content={`View comments${commentCount > 0 ? ` (${commentCount})` : ""}`}
      /> */}
    </button>
  );
};

export default CommentsButton;
