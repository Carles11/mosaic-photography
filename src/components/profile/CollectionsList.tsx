"use client";

import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import CreateCollectionLauncher from "../modals/createCollection/CreateCollectionLauncher";
import EditCollectionLauncher from "../modals/editCollection/EditCollectionLauncher";
import styles from "./CollectionsList.module.css";
import buttonStyles from "../shared/ButtonStyles.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useAuthSession } from "@/context/AuthSessionContext";
import { Collection } from "@/types";
import Image from "next/image";

export interface CollectionsListRef {
  refreshCollections: () => void;
}

const CollectionsList = forwardRef<CollectionsListRef>((props, ref) => {
  const { user } = useAuthSession();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pendingCollections, setPendingCollections] = useState<Collection[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const loadCollections = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await supabase.auth.getSession();
      const { data: collectionsData } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      let collectionsWithCounts: Collection[] = [];
      if (collectionsData && collectionsData.length > 0) {
        collectionsWithCounts = await Promise.all(
          collectionsData.map(async (collection) => {
            // Get image count
            const { count: imageCount } = await supabase
              .from("collection_favorites")
              .select("*", { count: "exact", head: true })
              .eq("collection_id", collection.id);

            // Get up to 4 favorite_ids for preview
            const { data: collectionFavorites } = await supabase
              .from("collection_favorites")
              .select("favorite_id")
              .eq("collection_id", collection.id)
              .order("display_order", { ascending: true })
              .limit(4);

            const favoriteIds =
              collectionFavorites?.map((fav) => fav.favorite_id) || [];
            let preview_images: string[] = [];
            if (favoriteIds.length > 0) {
              // Get favorites to get image_ids
              const { data: favorites } = await supabase
                .from("favorites")
                .select("id, image_id")
                .in("id", favoriteIds);
              const imageIds = favorites?.map((fav) => fav.image_id) || [];
              if (imageIds.length > 0) {
                const { data: images } = await supabase
                  .from("images_resize")
                  .select("id, base_url, filename")
                  .in("id", imageIds);
                preview_images =
                  images?.map((img) =>
                    img.base_url && img.filename
                      ? `${img.base_url}/w400/${img.filename}`
                      : "/favicons/android-chrome-512x512.png"
                  ) || [];
              }
            }
            return {
              ...collection,
              image_count: imageCount || 0,
              preview_images,
            };
          })
        );
      }
      // Merge pendingCollections (optimistic) with backend, remove dups by id
      const backendIds = new Set(collectionsWithCounts.map((c) => c.id));
      const merged = [
        ...pendingCollections.filter((c) => !backendIds.has(c.id)),
        ...collectionsWithCounts,
      ];
      setCollections(merged);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user, pendingCollections]);

  useImperativeHandle(
    ref,
    () => ({
      refreshCollections: loadCollections,
    }),
    [loadCollections]
  );

  useEffect(() => {
    loadCollections();
  }, [user, loadCollections]);

  const handleCreateCollection = (newCollection: Collection) => {
    // Optimistically add to UI
    setPendingCollections((prev) => [
      { ...newCollection, image_count: 0, preview_images: [] },
      ...prev,
    ]);
    loadCollections();
  };

  const handleEditCollection = (updatedCollection: Collection) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === updatedCollection.id ? { ...col, ...updatedCollection } : col
      )
    );
    setEditingCollection(null);
  };

  const handleDeleteCollection = async (collectionId: string) => {
    toast(
      (t) => (
        <span>
          Are you sure you want to delete this collection? This action cannot be
          undone.
          <br />
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase
                  .from("collections")
                  .delete()
                  .eq("id", collectionId);
                if (error) {
                  toast.error("Failed to delete collection. Please try again.");
                } else {
                  setCollections((prev) =>
                    prev.filter((col) => col.id !== collectionId)
                  );
                  toast.success("Collection deleted.");
                }
              } catch {
                toast.error("Failed to delete collection. Please try again.");
              }
            }}
            style={{
              marginRight: 8,
              background: "#e53e3e",
              color: "#fff",
              border: "none",
              padding: "4px 10px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              background: "#eee",
              color: "#333",
              border: "none",
              padding: "4px 10px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </span>
      ),
      { duration: 8000 }
    );
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading collections...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.title}>
            My Collections ({collections.length})
          </h3>
          <p className={styles.subtitle}>
            Organize your favorite images into themed collections
          </p>
        </div>
        <CreateCollectionLauncher onCreateCollection={handleCreateCollection}>
          <button
            className={`${styles.createButton} ${
              isMobile ? styles.mobile : ""
            }`}
          >
            <span className={styles.plusIcon}>+</span>
            New Collection
          </button>
        </CreateCollectionLauncher>
      </div>

      {collections.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h3>No collections yet</h3>
          <p>Create your first collection to organize your favorite images</p>
          <CreateCollectionLauncher onCreateCollection={handleCreateCollection}>
            <button className={styles.emptyCreateButton}>
              Create Collection
            </button>
          </CreateCollectionLauncher>
        </div>
      ) : (
        <div className={styles.grid}>
          {collections.map((collection) => (
            <div
              key={collection.id}
              className={`${styles.collectionCard} ${
                isMobile ? styles.mobile : ""
              }`}
            >
              <div className={styles.cardHeader}>
                <h4 className={styles.collectionName}>{collection.name}</h4>
                <div className={styles.cardActions}>
                  <button
                    onClick={() =>
                      router.push(`/profile/collections/${collection.id}`)
                    }
                    className={`${buttonStyles.buttonBase} ${buttonStyles.viewButton}`}
                    title="Share collection"
                  >
                    {/* Options for share icon similar in style to ⌂: */}
                    {/* 1. ⎋ (Escape) */}
                    {/* 2. ⎙ (Print) */}
                    {/* 3. ⎘ (Insert) */}
                    {/* 4. ⎗ (Copy) */}
                    {/* 5. ⎌ (Return) */}Share
                  </button>
                  <button
                    onClick={() => setEditingCollection(collection)}
                    className={`${buttonStyles.buttonBase} ${buttonStyles.editButton}`}
                    title="Edit collection"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className={`${buttonStyles.buttonBase} ${buttonStyles.deleteButton}`}
                    title="Delete collection"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className={styles.previewContainer}>
                {collection.preview_images &&
                collection.preview_images.length > 0 ? (
                  <div className={styles.imageGrid}>
                    {collection.preview_images
                      .slice(0, 4)
                      .map((imageUrl, index) => (
                        <div key={index} className={styles.previewImage}>
                          <Image
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            width={80}
                            height={80}
                            loading="lazy"
                          />
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className={styles.emptyPreview}>
                    <span className={styles.emptyPreviewIcon}>📷</span>
                    <p>No images yet</p>
                    <p>
                      To add images to this collection, go to{" "}
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href =
                            "/photo-curations?tab=favorites";
                        }}
                      >
                        your favorites tab
                      </button>{" "}
                      and click the &apos;+&apos; folders icon over the image.
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.collectionInfo}>
                  <span className={styles.imageCount}>
                    {collection.image_count}{" "}
                    {collection.image_count === 1 ? "image" : "images"}
                  </span>
                </div>
                {collection.description && (
                  <p className={styles.description}>{collection.description}</p>
                )}
                <span className={styles.createdDate}>
                  Created {new Date(collection.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingCollection && (
        <EditCollectionLauncher
          collection={editingCollection}
          onUpdateCollection={handleEditCollection}
        >
          {/* This can be a hidden span, since the launcher just needs to trigger the modal */}
          <span style={{ display: "none" }} />
        </EditCollectionLauncher>
      )}
    </div>
  );
});

CollectionsList.displayName = "CollectionsList";

export default CollectionsList;
