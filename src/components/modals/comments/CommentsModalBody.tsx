"use client";

import React, { useEffect } from "react";
import styles from "./CommentsModal.module.css";
import { useComments } from "@/context/CommentsContext";
import { useAuthSession } from "@/context/AuthSessionContext";
import CommentForm from "@/components/comments/CommentForm";
import { useLoginAndCloseModal } from "@/hooks/useLoginAndCloseModal";
import CommentItem from "@/components/comments/CommentItem";

interface CommentsModalBodyProps {
  imageId: string;
  onClose: () => void;
}

const CommentsModalBody: React.FC<CommentsModalBodyProps> = ({
  imageId,
  onClose,
}) => {
  // Compose a handler that closes the modal and redirects to login
  const handleLoginRequired = useLoginAndCloseModal(onClose);
  const { user } = useAuthSession();
  const { getCommentsForImage, loadCommentsForImage, loading } = useComments();
  const comments = getCommentsForImage(imageId);
  const isLoading = loading[imageId] || false;

  useEffect(() => {
    if (imageId) {
      loadCommentsForImage(imageId);
    }
  }, [imageId, loadCommentsForImage]);

  return (
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
        <CommentForm imageId={imageId} onLoginRequired={handleLoginRequired} />

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
  );
};

export default CommentsModalBody;
