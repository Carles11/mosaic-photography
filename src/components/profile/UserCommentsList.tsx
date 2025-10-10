"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import styles from "./UserCommentsList.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useAuthSession } from "@/context/AuthSessionContext";
import { ImageData } from "@/types";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import Link from "next/link";

// Comment type reflecting your schema
type Comment = {
  id: string;
  user_id?: string;
  content: string;
  created_at: string;
  image_id?: string | number;
};

type UserCommentWithImage = Comment & {
  image_title?: string;
  image_url?: string;
  image_author?: string;
  imageData?: ImageData;
};

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

  // Fetch user comments + images
  const loadUserComments = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const offset = (pageNum - 1) * COMMENTS_PER_PAGE;

        // 1. Get the user's comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("id, user_id, image_id, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(offset, offset + COMMENTS_PER_PAGE - 1);

        if (commentsError) {
          console.error("Error loading user comments:", commentsError);
          return;
        }

        if (!commentsData || commentsData.length === 0) {
          if (reset) setComments([]);
          setHasMore(false);
          setLoading(false);
          return;
        }

        // 2. Get image details for referenced images
        const imageIds = [
          ...new Set(
            commentsData
              .map((c) => c.image_id)
              .filter(Boolean)
              .map((id) => String(id))
          ),
        ];

        const imageMap = new Map<string, ImageData>();
        if (imageIds.length > 0) {
          const { data: imagesData, error: imagesError } = await supabase
            .from("images_resize")
            .select(
              "id, title, base_url, filename, author, description, created_at, width, height, orientation"
            )
            .in("id", imageIds);

          if (imagesError) {
            console.error("Error loading image details:", imagesError);
          } else if (imagesData) {
            imagesData.forEach((image) => {
              imageMap.set(String(image.id), {
                id: String(image.id),
                url:
                  image.base_url && image.filename
                    ? `${image.base_url}/w800/${image.filename}`
                    : "/favicons/android-chrome-512x512.png",
                base_url: image.base_url,
                filename: image.filename,
                author: image.author || "Unknown",
                title: image.title || "",
                description: image.description || "",
                created_at: image.created_at || "",
                width: image.width,
                height: image.height,
                orientation: image.orientation,
              });
            });
          }
        }

        // 3. Attach image info to comments
        const transformedComments: UserCommentWithImage[] = commentsData.map(
          (comment) => {
            const imageDetails = comment.image_id
              ? imageMap.get(String(comment.image_id))
              : undefined;
            return {
              ...comment,
              image_title: imageDetails?.title,
              image_url: imageDetails?.url,
              image_author: imageDetails?.author,
              imageData: imageDetails,
            };
          }
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
    [user]
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
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, content: editContent.trim() }
              : comment
          )
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

  const handleDelete = (commentId: string) => {
    toast((t) => (
      <span>
        Are you sure you want to delete this comment?
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button
            style={{
              background: "var(--tertiary-color, #fd6c6c)",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "4px 12px",
              cursor: "pointer",
            }}
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase
                  .from("comments")
                  .delete()
                  .eq("id", commentId);
                if (error) {
                  toast.error("Error deleting comment.");
                  console.error("Error deleting comment:", error);
                } else {
                  setComments((prev) =>
                    prev.filter((comment) => comment.id !== commentId)
                  );
                  toast.success("Comment deleted.");
                }
              } catch (error) {
                toast.error("Error deleting comment.");
                console.error("Error deleting comment:", error);
              }
            }}
          >
            Delete
          </button>
          <button
            style={{
              background: "#eee",
              color: "#333",
              border: "none",
              borderRadius: 4,
              padding: "4px 12px",
              cursor: "pointer",
            }}
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </span>
    ));
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
        <p>
          Start commenting on images{" "}
          <Link href="/#gallery-section" className="fancy-link">
            in the gallery!
          </Link>
        </p>
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
              {comment.imageData ? (
                <div className={styles.imageThumbnail}>
                  <ImageWrapper
                    image={comment.imageData}
                    width={200}
                    height={200}
                    showOverlayButtons={false}
                    imgStyleOverride={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    sizes="200px"
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
                {!comment.imageData && (
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
