"use client";

import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import CreateCollectionModal from "./CreateCollectionModal";
import EditCollectionModal from "./EditCollectionModal";
import styles from "./CollectionsList.module.css";
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
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
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
      await supabase
        .from("collections")
        .select("*")
        .in("id", [
          "1de09a36-8180-496e-823a-e2ce80b6cf45",
          "960305af-8088-4254-86f3-0f88a06edd34",
        ]);
      const { data: collectionsData } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (collectionsData && collectionsData.length > 0) {
        const collectionsWithCounts = await Promise.all(
          collectionsData.map(async (collection) => {
            const { count: imageCount } = await supabase
              .from("collection_favorites")
              .select("*", { count: "exact", head: true })
              .eq("collection_id", collection.id);
            const { data: previewData } = await supabase
              .from("collection_favorites")
              .select("favorites!inner(images!inner(url))")
              .eq("collection_id", collection.id)
              .limit(4);
            const preview_images = Array.isArray(previewData)
              ? previewData.flatMap(
                  (item: { favorites: { images: { url: string }[] }[] }) =>
                    Array.isArray(item.favorites)
                      ? item.favorites.flatMap((fav) =>
                          Array.isArray(fav.images)
                            ? fav.images.map((img) => img.url)
                            : [],
                        )
                      : [],
                )
              : [];
            return {
              ...collection,
              image_count: imageCount || 0,
              preview_images,
            };
          }),
        );
        setCollections(collectionsWithCounts);
      } else {
        setCollections([]);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useImperativeHandle(
    ref,
    () => ({
      refreshCollections: loadCollections,
    }),
    [loadCollections],
  );

  useEffect(() => {
    loadCollections();
  }, [user, loadCollections]);

  const handleCreateCollection = (newCollection: Collection) => {
    setCollections((prev) => [
      { ...newCollection, image_count: 0, preview_images: [] },
      ...prev,
    ]);
    setShowCreateModal(false);

    setTimeout(() => {
      loadCollections();
    }, 1000);
  };

  const handleEditCollection = (updatedCollection: Collection) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === updatedCollection.id
          ? { ...col, ...updatedCollection }
          : col,
      ),
    );
    setEditingCollection(null);
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this collection? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionId);

      if (error) {
        alert("Failed to delete collection. Please try again.");
      } else {
        setCollections((prev) => prev.filter((col) => col.id !== collectionId));
      }
    } catch (error) {
      alert("Failed to delete collection. Please try again.");
    }
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
        <button
          onClick={() => setShowCreateModal(true)}
          className={`${styles.createButton} ${isMobile ? styles.mobile : ""}`}
        >
          <span className={styles.plusIcon}>+</span>
          New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h3>No collections yet</h3>
          <p>Create your first collection to organize your favorite images</p>
          <button
            onClick={() => {
              setShowCreateModal(true);
            }}
            className={styles.emptyCreateButton}
          >
            Create Collection
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {collections.map((collection) => (
            <div
              key={collection.id}
              className={`${styles.collectionCard} ${isMobile ? styles.mobile : ""}`}
            >
              <div className={styles.cardHeader}>
                <h4 className={styles.collectionName}>{collection.name}</h4>
                <div className={styles.cardActions}>
                  <button
                    onClick={() =>
                      router.push(`/profile/collections/${collection.id}`)
                    }
                    className={styles.viewButton}
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
                    className={styles.editButton}
                    title="Edit collection"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className={styles.deleteButton}
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
                      To add images to this collection, go to your favorites
                      above and click the yellow folder icon over the image.
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

      {/* Modals */}
      {showCreateModal && (
        <CreateCollectionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateCollection={handleCreateCollection}
        />
      )}

      {editingCollection && (
        <EditCollectionModal
          isOpen={!!editingCollection}
          collection={editingCollection}
          onClose={() => setEditingCollection(null)}
          onUpdateCollection={handleEditCollection}
        />
      )}
    </div>
  );
});

CollectionsList.displayName = "CollectionsList";

export default CollectionsList;
