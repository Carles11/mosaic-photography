"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { CommentsModalProps } from "@/types";
import { useComments } from "@/context/CommentsContext";
import { useAuthSession } from "@/context/AuthSessionContext";
import CommentForm from "@/components/comments/CommentForm";
import CommentItem from "@/components/comments/CommentItem";
import styles from "./CommentsModal.module.css";

const CommentsModal: React.FC<CommentsModalProps> = ({
  imageId,
  isOpen,
  onClose,
  onLoginRequired,
}) => {
  const { user } = useAuthSession();
  const { getCommentsForImage, loadCommentsForImage, loading } = useComments();
  const comments = getCommentsForImage(imageId);
  const isLoading = loading[imageId] || false;

  // Load comments when modal opens
  useEffect(() => {
    if (isOpen && imageId) {
      loadCommentsForImage(imageId);
    }
  }, [isOpen, imageId, loadCommentsForImage]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Comments ({comments.length})</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close comments"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Comment Form */}
          <CommentForm imageId={imageId} onLoginRequired={onLoginRequired} />

          {/* Comments List */}
          <div className={styles.commentsList}>
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              <>
                <div className={styles.commentsHeader}>
                  <h3>
                    {comments.length}{" "}
                    {comments.length === 1 ? "Comment" : "Comments"}
                  </h3>
                </div>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={user?.id}
                  />
                ))}
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💬</div>
                <h3>No comments yet</h3>
                <p>Be the first to share your thoughts about this image!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level to avoid container overflow issues
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default CommentsModal;
