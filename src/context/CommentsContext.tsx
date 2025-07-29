"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Comment } from "@/types";
import { useAuthSession } from "./AuthSessionContext";

interface CommentsContextType {
  comments: Record<string, Comment[]>; // imageId -> Comment[]
  loading: Record<string, boolean>; // imageId -> boolean
  getCommentsForImage: (imageId: string) => Comment[];
  getCommentCount: (imageId: string) => number;
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

  const isUserLoggedIn = () => !!user;

  const getCommentsForImage = (imageId: string): Comment[] => {
    return comments[imageId] || [];
  };

  const getCommentCount = (imageId: string): number => {
    return getCommentsForImage(imageId).length;
  };

  const loadCommentsForImage = async (imageId: string) => {
    if (loading[imageId]) return; // Already loading
    if (!imageId || imageId === "unknown") {
      // Set empty array for invalid IDs to prevent loading state
      setComments((prev) => ({ ...prev, [imageId]: [] }));
      return;
    }

    // If comments are already loaded for this image, don't reload
    if (comments[imageId] !== undefined) {
      return;
    }

    setLoading((prev) => ({ ...prev, [imageId]: true }));

    try {
      // Convert imageId to number for database query (since image_id is int8)
      const numericImageId =
        typeof imageId === "string" ? parseInt(imageId, 10) : imageId;

      // Check if imageId is a valid number
      if (isNaN(numericImageId)) {
        console.warn("Invalid imageId:", imageId, "- not a valid number");
        setComments((prev) => ({ ...prev, [imageId]: [] }));
        return;
      }

      // Fetch comments with user email for display
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
        console.error("Error loading comments for image", imageId, ":", error);

        // If it's a schema error (table doesn't exist or wrong column type), don't retry
        if (error.code === "42P01" || error.code === "22P02") {
          console.warn(
            "Comments table schema issue. Please run the database migration.",
          );
          setComments((prev) => ({ ...prev, [imageId]: [] }));
          return;
        }
        setComments((prev) => ({ ...prev, [imageId]: [] }));
        return;
      }

      if (commentsData) {
        // For now, we'll just use user_id as display name
        // Later we can enhance this to fetch user profiles
        const transformedComments: Comment[] = commentsData.map((comment) => ({
          id: comment.id,
          user_id: comment.user_id,
          image_id: String(comment.image_id), // Convert back to string for consistency
          content: comment.content,
          created_at: comment.created_at,
          user_email: `User ${comment.user_id.slice(0, 8)}...`, // Abbreviated user ID for now
        }));

        setComments((prev) => ({
          ...prev,
          [imageId]: transformedComments,
        }));
      }
    } catch (error) {
      console.error("Error loading comments for image", imageId, ":", error);
    } finally {
      setLoading((prev) => ({ ...prev, [imageId]: false }));
    }
  };

  const addComment = async (imageId: string, content: string) => {
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
        // Add to local state with optimistic update
        const commentWithUserInfo: Comment = {
          ...newComment,
          image_id: String(newComment.image_id), // Convert back to string for consistency
          user_email: user.email || "You",
        };

        setComments((prev) => ({
          ...prev,
          [imageId]: [...(prev[imageId] || []), commentWithUserInfo],
        }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
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
  };

  const deleteComment = async (commentId: string, imageId: string) => {
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
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  return (
    <CommentsContext.Provider
      value={{
        comments,
        loading,
        getCommentsForImage,
        getCommentCount,
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
