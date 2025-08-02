"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { Comment } from "@/types";
import { useAuthSession } from "./AuthSessionContext";

interface CommentsContextType {
  comments: Record<string, Comment[]>; // imageId -> Comment[]
  loading: Record<string, boolean>; // imageId -> boolean
  commentCounts: Record<string, number>; // imageId -> count (lightweight cache)
  getCommentsForImage: (imageId: string) => Comment[];
  getCommentCount: (imageId: string) => number;
  loadCommentCount: (imageId: string) => Promise<void>; // New lightweight function
  addComment: (imageId: string, content: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string, imageId: string) => Promise<void>;
  loadCommentsForImage: (imageId: string) => Promise<void>;
  isUserLoggedIn: () => boolean;
}

const CommentsContext = createContext<CommentsContextType | null>(null);

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error("useComments must be used within a CommentsProvider");
  }
  return context;
};

export function CommentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthSession();
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );

  // Use refs to maintain current state for callbacks
  const commentsRef = useRef(comments);
  const loadingRef = useRef(loading);
  const commentCountsRef = useRef(commentCounts);

  // Track active requests to prevent duplicates
  const activeRequestsRef = useRef(new Set<string>());
  const activeCountRequestsRef = useRef(new Set<string>());

  // Update refs when state changes
  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    commentCountsRef.current = commentCounts;
  }, [commentCounts]);

  const isUserLoggedIn = useCallback(() => !!user, [user]);

  const getCommentsForImage = useCallback(
    (imageId: string): Comment[] => {
      return comments[imageId] || [];
    },
    [comments],
  );

  const getCommentCount = useCallback(
    (imageId: string): number => {
      // First try to get from full comments if loaded
      const fullComments = comments[imageId];
      if (fullComments !== undefined) {
        return fullComments.length;
      }

      // Otherwise use the lightweight count cache
      return commentCounts[imageId] || 0;
    },
    [comments, commentCounts],
  );

  // Lightweight function to load just the comment count (not full comments)
  const loadCommentCount = useCallback(async (imageId: string) => {
    if (!imageId || imageId === "unknown") {
      return;
    }

    // If we already have a count or full comments, don't reload
    if (
      commentCountsRef.current[imageId] !== undefined ||
      commentsRef.current[imageId] !== undefined ||
      activeCountRequestsRef.current.has(imageId)
    ) {
      return;
    }

    activeCountRequestsRef.current.add(imageId);

    try {
      const numericImageId =
        typeof imageId === "string" ? parseInt(imageId, 10) : imageId;

      if (isNaN(numericImageId)) {
        setCommentCounts((prev) => ({ ...prev, [imageId]: 0 }));
        return;
      }

      // Just count the comments, don't fetch full data
      const { count, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("image_id", numericImageId);

      if (error) {
        console.warn(
          "Error loading comment count for image",
          imageId,
          ":",
          error,
        );
        setCommentCounts((prev) => ({ ...prev, [imageId]: 0 }));
        return;
      }

      setCommentCounts((prev) => ({ ...prev, [imageId]: count || 0 }));
    } catch (error) {
      console.warn(
        "Error loading comment count for image",
        imageId,
        ":",
        error,
      );
      setCommentCounts((prev) => ({ ...prev, [imageId]: 0 }));
    } finally {
      activeCountRequestsRef.current.delete(imageId);
    }
  }, []);

  const loadCommentsForImage = useCallback(
    async (imageId: string) => {
      // More aggressive early exits to prevent duplicate requests
      if (!imageId || imageId === "unknown") {
        return; // Don't even set state for invalid IDs
      }

      // Check if already loading, loaded, or has an active request
      if (
        loadingRef.current[imageId] ||
        commentsRef.current[imageId] !== undefined ||
        activeRequestsRef.current.has(imageId)
      ) {
        return; // Already loading, loaded, or request in progress
      }

      // Mark this imageId as having an active request
      activeRequestsRef.current.add(imageId);
      setLoading((prev) => ({ ...prev, [imageId]: true }));

      try {
        // Convert imageId to number for database query (since image_id is int8)
        const numericImageId =
          typeof imageId === "string" ? parseInt(imageId, 10) : imageId;

        // Check if imageId is a valid number
        if (isNaN(numericImageId)) {
          console.warn("Invalid imageId:", imageId, "- not a valid number");
          setComments((prev) => ({ ...prev, [imageId]: [] }));
          activeRequestsRef.current.delete(imageId);
          setLoading((prev) => ({ ...prev, [imageId]: false }));
          return;
        }

        // Fetch comments with user profiles for display names
        const { data: commentsData, error } = await supabase
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
          .eq("image_id", numericImageId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error(
            "Error loading comments for image",
            imageId,
            ":",
            error,
          );

          // Always set empty array for errors to prevent retrying
          setComments((prev) => ({ ...prev, [imageId]: [] }));
          activeRequestsRef.current.delete(imageId);
          setLoading((prev) => ({ ...prev, [imageId]: false }));
          return;
        }

        if (commentsData) {
          // If no comments, just set empty array and exit early
          if (commentsData.length === 0) {
            setComments((prev) => ({ ...prev, [imageId]: [] }));
            setCommentCounts((prev) => ({ ...prev, [imageId]: 0 }));
            activeRequestsRef.current.delete(imageId);
            setLoading((prev) => ({ ...prev, [imageId]: false }));
            return;
          }

          // Fetch user profiles to get display names only if we have comments
          const userIds = [
            ...new Set(commentsData.map((comment) => comment.user_id)),
          ];

          // Try to fetch user profiles for display names
          const { data: profilesData } = await supabase
            .from("user_profiles")
            .select("id, name")
            .in("id", userIds);

          // Create a map of user_id to display name
          const userProfiles = new Map(
            profilesData?.map((profile) => [
              profile.id,
              profile.name || `User ${profile.id.slice(0, 8)}...`,
            ]) || [],
          );

          // console.log({ userProfiles });

          const transformedComments: Comment[] = commentsData.map((comment) => {
            // Get display name from profile, fallback to abbreviated user ID
            const displayName =
              userProfiles.get(comment.user_id) ||
              `User ${comment.user_id.slice(0, 8)}...`;

            return {
              id: comment.id,
              user_id: comment.user_id,
              image_id: String(comment.image_id), // Convert back to string for consistency
              content: comment.content,
              created_at: comment.created_at,
              user_email: displayName, // Using display name instead of email for privacy
            };
          });

          setComments((prev) => ({
            ...prev,
            [imageId]: transformedComments,
          }));

          // Also update the count cache
          setCommentCounts((prev) => ({
            ...prev,
            [imageId]: transformedComments.length,
          }));
        } else {
          // No data returned, set empty array
          setComments((prev) => ({ ...prev, [imageId]: [] }));
        }
      } catch (error) {
        console.error("Error loading comments for image", imageId, ":", error);
        // Always set empty array for errors to prevent retrying
        setComments((prev) => ({ ...prev, [imageId]: [] }));
      } finally {
        // Remove from active requests and set loading to false
        activeRequestsRef.current.delete(imageId);
        setLoading((prev) => ({ ...prev, [imageId]: false }));
      }
    },
    [], // Remove comments and loading from dependencies to prevent infinite loops
  );

  const addComment = useCallback(
    async (imageId: string, content: string) => {
      if (!user) {
        throw new Error("User must be logged in to add comments");
      }

      if (!content.trim()) {
        throw new Error("Comment content cannot be empty");
      }

      try {
        // Convert imageId to number for database insertion (since image_id is int8)
        const numericImageId =
          typeof imageId === "string" ? parseInt(imageId, 10) : imageId;

        const { data: newComment, error } = await supabase
          .from("comments")
          .insert([
            {
              user_id: user.id,
              image_id: numericImageId,
              content: content.trim(),
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Error adding comment:", error);
          throw error;
        }

        if (newComment) {
          // Try to get user's display name from profile
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("name")
            .eq("id", user.id)
            .single();

          const displayName =
            profileData?.name || user.email?.split("@")[0] || "You";

          // Add to local state with optimistic update
          const commentWithUserInfo: Comment = {
            ...newComment,
            image_id: String(newComment.image_id), // Convert back to string for consistency
            user_email: displayName,
          };

          setComments((prev) => ({
            ...prev,
            [imageId]: [...(prev[imageId] || []), commentWithUserInfo],
          }));

          // Update the count cache
          setCommentCounts((prev) => ({
            ...prev,
            [imageId]: (prev[imageId] || 0) + 1,
          }));
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
      }
    },
    [user],
  );

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      if (!user) {
        throw new Error("User must be logged in to update comments");
      }

      if (!content.trim()) {
        throw new Error("Comment content cannot be empty");
      }

      try {
        const { data: updatedComment, error } = await supabase
          .from("comments")
          .update({ content: content.trim() })
          .eq("id", commentId)
          .eq("user_id", user.id) // Ensure user can only update their own comments
          .select()
          .single();

        if (error) {
          console.error("Error updating comment:", error);
          throw error;
        }

        if (updatedComment) {
          // Update local state
          setComments((prev) => {
            const newComments = { ...prev };
            Object.keys(newComments).forEach((imageId) => {
              newComments[imageId] = newComments[imageId].map((comment) =>
                comment.id === commentId
                  ? { ...comment, content: updatedComment.content }
                  : comment,
              );
            });
            return newComments;
          });
        }
      } catch (error) {
        console.error("Error updating comment:", error);
        throw error;
      }
    },
    [user],
  );

  const deleteComment = useCallback(
    async (commentId: string, imageId: string) => {
      if (!user) {
        throw new Error("User must be logged in to delete comments");
      }

      try {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("id", commentId)
          .eq("user_id", user.id); // Ensure user can only delete their own comments

        if (error) {
          console.error("Error deleting comment:", error);
          throw error;
        }

        // Remove from local state
        setComments((prev) => ({
          ...prev,
          [imageId]: (prev[imageId] || []).filter(
            (comment) => comment.id !== commentId,
          ),
        }));

        // Update the count cache
        setCommentCounts((prev) => ({
          ...prev,
          [imageId]: Math.max((prev[imageId] || 1) - 1, 0),
        }));
      } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
      }
    },
    [user],
  );

  return (
    <CommentsContext.Provider
      value={{
        comments,
        loading,
        commentCounts,
        getCommentsForImage,
        getCommentCount,
        loadCommentCount,
        addComment,
        updateComment,
        deleteComment,
        loadCommentsForImage,
        isUserLoggedIn,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}
