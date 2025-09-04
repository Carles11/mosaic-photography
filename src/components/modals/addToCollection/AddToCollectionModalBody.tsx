"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import styles from "./AddToCollectionModal.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useAuthSession } from "@/context/AuthSessionContext";

import { Collection as CollectionType } from "@/types";

interface AddToCollectionModalBodyProps {
  imageId: string;
  imageTitle: string;
  onClose: () => void;
  onAddToCollection?: (collectionId: string) => void;
}

export default function AddToCollectionModalBody({
  imageId,
  imageTitle,
  onClose,
  onAddToCollection,
}: AddToCollectionModalBodyProps) {
  const { user } = useAuthSession();
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [alreadyInCollections, setAlreadyInCollections] = useState<Set<string>>(
    new Set(),
  );

  const loadCollections = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) {
        console.error("Error loading collections:", error);
        return;
      }

      setCollections(data || []);
    } catch (error) {
      console.error("Error loading collections:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkExistingAssociations = useCallback(async () => {
    if (!user) return;

    try {
      const { data: favoriteData, error: favoriteError } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("image_id", imageId)
        .single();

      if (favoriteError || !favoriteData) {
        setAlreadyInCollections(new Set());
        return;
      }

      const { data, error } = await supabase
        .from("collection_favorites")
        .select("collection_id")
        .eq("favorite_id", favoriteData.id);

      if (error) {
        console.error("Error checking existing associations:", error);
        return;
      }

      const existingCollections = new Set(
        data?.map((item: { collection_id: string }) => item.collection_id) ||
          [],
      );
      setAlreadyInCollections(existingCollections);
    } catch (error) {
      console.error("Error checking existing associations:", error);
    }
  }, [user, imageId]);

  useEffect(() => {
    checkExistingAssociations();
    loadCollections();
  }, [checkExistingAssociations, loadCollections]);

  const handleAddToCollection = async (collectionId: string) => {
    if (!user || adding) return;

    setAdding(collectionId);

    try {
      const { data: favoriteData, error: favoriteError } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("image_id", imageId)
        .single();

      if (favoriteError || !favoriteData) {
        console.error("Error finding favorite:", favoriteError);
        toast.error(
          "You must favorite this image first before adding it to a collection!",
        );
        return;
      }

      const { data: existing } = await supabase
        .from("collection_favorites")
        .select("id")
        .eq("collection_id", collectionId)
        .eq("favorite_id", favoriteData.id)
        .single();

      if (existing) {
        toast("Image is already in this collection!", { icon: "⚠️" });
        return;
      }

      const { error } = await supabase.from("collection_favorites").insert({
        collection_id: collectionId,
        favorite_id: favoriteData.id,
      });

      if (error) {
        console.error("Error adding to collection:", error);
        toast.error("Failed to add image to collection. Please try again.");
        return;
      }

      setAlreadyInCollections((prev) => new Set([...prev, collectionId]));

      if (onAddToCollection) {
        onAddToCollection(collectionId);
      }
    } catch (error) {
      console.error("Error adding to collection:", error);
      toast.error("Failed to add image to collection. Please try again.");
    } finally {
      setAdding(null);
    }
  };

  const handleRemoveFromCollection = async (collectionId: string) => {
    if (!user || adding) return;

    setAdding(collectionId);

    try {
      const { data: favoriteData, error: favoriteError } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("image_id", imageId)
        .single();

      if (favoriteError || !favoriteData) {
        console.error("Error finding favorite:", favoriteError);
        return;
      }

      const { error } = await supabase
        .from("collection_favorites")
        .delete()
        .eq("collection_id", collectionId)
        .eq("favorite_id", favoriteData.id);

      if (error) {
        console.error("Error removing from collection:", error);
        toast.error(
          "Failed to remove image from collection. Please try again.",
        );
        return;
      }

      setAlreadyInCollections((prev) => {
        const newSet = new Set(prev);
        newSet.delete(collectionId);
        return newSet;
      });

      const collection = collections.find((c) => c.id === collectionId);
      toast.success(`Removed "${imageTitle}" from "${collection?.name}"`);
    } catch (error) {
      console.error("Error removing from collection:", error);
      toast.error("Failed to remove image from collection. Please try again.");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Add to Collection</h2>
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div className={styles.content}>
        <p className={styles.imageTitle}>
          <strong>&quot;{imageTitle}&quot;</strong>
        </p>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className={styles.empty}>
            <p>You haven&apos;t created any collections yet</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/photo-curations?tab=collections";
              }}
            >
              Create new collection
            </button>
          </div>
        ) : (
          <div className={styles.collectionsList}>
            {collections.map((collection) => {
              const isInCollection = alreadyInCollections.has(collection.id);
              const isProcessing = adding === collection.id;

              return (
                <div key={collection.id} className={styles.collectionItem}>
                  <div className={styles.collectionInfo}>
                    <h4 className={styles.collectionName}>{collection.name}</h4>
                    {collection.description && (
                      <p className={styles.collectionDescription}>
                        {collection.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      isInCollection
                        ? handleRemoveFromCollection(collection.id)
                        : handleAddToCollection(collection.id)
                    }
                    disabled={isProcessing}
                    className={`${styles.actionButton} ${isInCollection ? styles.removeButton : styles.addButton}`}
                  >
                    {isProcessing ? (
                      <span className={styles.loadingText}>
                        <span className={styles.buttonSpinner}></span>
                        {isInCollection ? "Removing..." : "Adding..."}
                      </span>
                    ) : isInCollection ? (
                      <>
                        <span className={styles.buttonIcon}>✓</span>
                        Added
                      </>
                    ) : (
                      <>
                        <span className={styles.buttonIcon}>+</span>
                        Add
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
