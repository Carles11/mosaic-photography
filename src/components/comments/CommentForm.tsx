"use client";

import React, { useState } from "react";
import styles from "./CommentForm.module.css";
import { useComments } from "@/context/CommentsContext";

interface CommentFormProps {
  imageId: string;
  onLoginRequired?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  imageId,
  onLoginRequired,
}) => {
  const { addComment, isUserLoggedIn } = useComments();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isUserLoggedIn()) {
      onLoginRequired?.();
      return;
    }

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addComment(imageId, content);
      setContent(""); // Clear form on success
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (error) setError(null); // Clear error when user starts typing
  };

  return (
    <form onSubmit={handleSubmit} className={styles.commentForm}>
      <div className={styles.inputGroup}>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder={
            isUserLoggedIn()
              ? "Share your thoughts about this image..."
              : "Please log in to leave a comment"
          }
          className={styles.textarea}
          rows={3}
          onClick={(e) => e.stopPropagation()} // Stop click from propagating to potential overlays
          onFocus={(e) => e.stopPropagation()} // Ensure focus events don't propagate
          style={{ position: "relative", zIndex: 10 }} // Ensure higher z-index
        />
        {error && <div className={styles.error}>{error}</div>}
      </div>

      <div className={styles.actions}>
        {!isUserLoggedIn() ? (
          <button
            type="button"
            onClick={onLoginRequired}
            className={styles.loginButton}
          >
            Log in to comment
          </button>
        ) : (
          <div className={styles.submitSection}>
            <button
              type="button"
              onClick={() => setContent("")}
              disabled={isSubmitting || !content.trim()}
              className={styles.clearButton}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className={styles.submitButton}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default CommentForm;
