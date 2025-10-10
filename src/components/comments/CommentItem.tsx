"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import styles from "./CommentItem.module.css";
import buttonStyles from "../shared/ButtonStyles.module.css";
import { Comment } from "@/types";
import { useComments } from "@/context/CommentsContext";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
}) => {
  const { updateComment, deleteComment } = useComments();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = currentUserId === comment.user_id;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    setIsLoading(true);
    try {
      await updateComment(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
      // Optionally show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    setIsLoading(true);
    try {
      await deleteComment(comment.id, comment.image_id);
      toast.success("Comment deleted.", {
        duration: 5000,
        id: `comment-deleted-${comment.id}`,
      });
    } catch (error) {
      toast.error("Error deleting comment.", {
        duration: 5000,
        id: `comment-delete-error-${comment.id}`,
      });
      console.error("Error deleting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.commentItem}>
      <div className={styles.commentHeader}>
        <span className={styles.author}>
          {comment.user_email || "Anonymous"}
        </span>
        <span className={styles.date}>{formatDate(comment.created_at)}</span>
        {isOwner && (
          <div className={styles.actions}>
            {!isEditing && (
              <>
                <button
                  className={buttonStyles.buttonBase}
                  onClick={handleEdit}
                  disabled={isLoading}
                  title="Edit comment"
                >
                  ✏️
                </button>
                <button
                  className={buttonStyles.buttonBase}
                  onClick={handleDelete}
                  disabled={isLoading}
                  title="Delete comment"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className={styles.commentContent}>
        {isEditing ? (
          <div className={styles.editForm}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={styles.editTextarea}
              disabled={isLoading}
              autoFocus
            />
            <div className={styles.editActions}>
              <button
                onClick={handleSaveEdit}
                disabled={isLoading || !editContent.trim()}
                className={styles.saveButton}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isLoading}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className={styles.content}>{comment.content}</p>
        )}
      </div>{" "}
      <Toaster />
    </div>
  );
};

export default CommentItem;
