"use client";

import React, { useEffect, useState } from "react";
import { useComments } from "@/context/CommentsContext";
import styles from "./CommentsButton.module.css";

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
  const { getCommentCount, loadCommentsForImage } = useComments();
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    // Load comments for this image when component mounts
    loadCommentsForImage(imageId);
  }, [imageId, loadCommentsForImage]);

  useEffect(() => {
    // Update comment count when comments change
    setCommentCount(getCommentCount(imageId));
  }, [imageId, getCommentCount]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering image click/zoom
    onOpenModal();
  };

  return (
    <button
      className={`${styles.commentsButton} ${className}`}
      onClick={handleClick}
      aria-label={`View comments (${commentCount})`}
      title={`View comments (${commentCount})`}
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
    </button>
  );
};

export default CommentsButton;
