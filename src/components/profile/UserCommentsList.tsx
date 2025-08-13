"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./UserCommentsList.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useAuthSession } from "@/context/AuthSessionContext";
import { UserCommentWithImage } from "@/types";

const COMMENTS_PER_PAGE = 10;

export default function UserCommentsList() {
  const { user } = useAuthSession();
  const [comments, setComments] = useState<UserCommentWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadUserComments = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const offset = (pageNum - 1) * COMMENTS_PER_PAGE;

        // First, get the user's comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(
            `
            id,
            user_id,
            image_id,
            content,
            created_at
          `,
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(offset, offset + COMMENTS_PER_PAGE - 1);

        if (commentsError) {
          console.error("Error loading user comments:", commentsError);
          if (commentsError.code === "42P01") {
            console.warn("comments table doesn't exist yet");
          }
          return;
        }

        if (!commentsData || commentsData.length === 0) {
          if (reset) {
            setComments([]);
          }
          setHasMore(false);
          return;
        }

        // Get unique image IDs to fetch image details
        const imageIds = [
          ...new Set(commentsData.map((comment) => comment.image_id)),
        ];

        // Fetch image details for these IDs
        const { data: imagesData, error: imagesError } = await supabase
          .from("images")
          .select("id, title, url, author")
          .in("id", imageIds);

        if (imagesError) {
          console.error("Error loading image details:", imagesError);
        }

        // Create a map of image_id -> image details for quick lookup
        const imageMap = new Map();
        if (imagesData) {
          imagesData.forEach((image) => {
            imageMap.set(image.id, image);
          });
        }

        // Transform the data to match our interface
        const transformedComments: UserCommentWithImage[] = commentsData.map(
          (comment: UserCommentWithImage) => {
            const imageDetails = imageMap.get(comment.image_id);
            return {
              id: comment.id,
              user_id: comment.user_id,
              image_id: comment.image_id,
              content: comment.content,
              created_at: comment.created_at,
              updated_at: comment.updated_at, // This might be undefined, which is fine
              user_email: undefined, // Not available in current schema
              image_title: imageDetails?.title,
              image_url: imageDetails?.url,
              image_author: imageDetails?.author,
            };
          },
        );

        if (reset) {
          setComments(transformedComments);
        } else {
          setComments((prev) => [...prev, ...transformedComments]);
        }

        setHasMore(transformedComments.length === COMMENTS_PER_PAGE);
      } catch (error) {
        console.error("Error loading user comments:", error);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    loadUserComments(1, true);
  }, [user, loadUserComments]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadUserComments(nextPage, false);
  };

  const handleEditStart = (comment: UserCommentWithImage) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const handleEditSave = async (commentId: string) => {
    if (!editContent.trim()) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("comments")
        .update({
          content: editContent.trim(),
        })
        .eq("id", commentId);

      if (error) {
        console.error("Error updating comment:", error);
      } else {
        // Update local state
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  content: editContent.trim(),
                }
              : comment,
          ),
        );
        setEditingComment(null);
        setEditContent("");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        console.error("Error deleting comment:", error);
      } else {
        // Remove from local state
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId),
        );
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return null;
  }

  if (loading && comments.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your comments...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>💬</div>
        <h3>No comments yet</h3>
        <p>Start commenting on images in the gallery!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Your Comments ({comments.length}
          {hasMore ? "+" : ""})
        </h3>
        <p className={styles.subtitle}>
          Comments you&apos;ve made on gallery images
        </p>
      </div>

      <div className={styles.commentsList}>
        {comments.map((comment) => (
          <div key={comment.id} className={styles.commentItem}>
            <div className={styles.imageInfo}>
              {comment.image_url ? (
                <div className={styles.imageThumbnail}>
                  <Image
                    src={comment.image_url}
                    alt={comment.image_title || "Mosaic Gallery image"}
                    width={80}
                    height={80}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span className={styles.placeholderText}>📷</span>
                </div>
              )}
              <div className={styles.imageDetails}>
                <h4 className={styles.imageTitle}>
                  {comment.image_title || "Image Not Found"}
                </h4>
                <p className={styles.imageAuthor}>
                  by {comment.image_author || "Unknown"}
                </p>
                {!comment.image_url && (
                  <p className={styles.imageNotFound}>
                    Image ID: {comment.image_id}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.commentContent}>
              {editingComment === comment.id ? (
                <div className={styles.editForm}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className={styles.editTextarea}
                    rows={3}
                    maxLength={500}
                  />
                  <div className={styles.editActions}>
                    <button
                      onClick={() => handleEditSave(comment.id)}
                      disabled={updating || !editContent.trim()}
                      className={styles.saveButton}
                    >
                      {updating ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleEditCancel}
                      disabled={updating}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={styles.commentText}>{comment.content}</p>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentDate}>
                      {formatDate(comment.created_at)}
                      {comment.updated_at &&
                        comment.updated_at !== comment.created_at && (
                          <span className={styles.editedIndicator}>
                            {" "}
                            (edited)
                          </span>
                        )}
                    </span>
                    <div className={styles.commentActions}>
                      <button
                        onClick={() => handleEditStart(comment)}
                        className={styles.editButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className={styles.loadMore}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className={styles.loadMoreButton}
          >
            {loading ? "Loading..." : "Load More Comments"}
          </button>
        </div>
      )}
    </div>
  );
}
