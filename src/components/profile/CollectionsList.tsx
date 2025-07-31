"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthSession } from "@/context/AuthSessionContext";
import { Collection } from "@/types";
import CreateCollectionModal from "./CreateCollectionModal";
import EditCollectionModal from "./EditCollectionModal";
import styles from "./CollectionsList.module.css";

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

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refreshCollections: loadCollections,
  }));

  const loadCollections = async () => {
    console.log("🔍 [DEBUG] loadCollections called");
    console.log("🔍 [DEBUG] User ID:", user?.id);

    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Check current session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      console.log("🔍 [DEBUG] Session user ID:", sessionData.session?.user?.id);
      console.log("🔍 [DEBUG] Context user ID:", user.id);
      console.log(
        "🔍 [DEBUG] IDs match:",
        sessionData.session?.user?.id === user.id,
      );

      // Try the known collection IDs directly
      console.log("🔍 [DEBUG] Testing known collection IDs...");
      const { data: knownCollections, error: knownError } = await supabase
        .from("collections")
        .select("*")
        .in("id", [
          "1de09a36-8180-496e-823a-e2ce80b6cf45",
          "960305af-8088-4254-86f3-0f88a06edd34",
        ]);

      console.log("🔍 [DEBUG] Known collections result:", {
        data: knownCollections,
        error: knownError,
        count: knownCollections?.length || 0,
      });

      if (knownError) {
        console.error("❌ [DEBUG] RLS Policy Error:", knownError);
        console.error("❌ [DEBUG] This confirms RLS is blocking access");
        console.error(
          "❌ [DEBUG] Check your collections table RLS policies in Supabase dashboard",
        );
        alert(
          "Database access blocked by security policies. Check Supabase RLS settings for collections table.",
        );
        return;
      }

      // If known collections work, try the regular query
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      console.log("🔍 [DEBUG] Regular query result:", {
        data: collectionsData,
        error: collectionsError,
        count: collectionsData?.length || 0,
      });

      if (collectionsError) {
        console.error(
          "❌ [DEBUG] Error loading collections:",
          collectionsError,
        );
        return;
      }

      if (collectionsData && collectionsData.length > 0) {
        // Process collections for image counts and previews
        const collectionsWithCounts = await Promise.all(
          collectionsData.map(async (collection) => {
            // Get image count
            const { count, error: countError } = await supabase
              .from("collection_favorites")
              .select("*", { count: "exact", head: true })
              .eq("collection_id", collection.id);

            // Get preview images (first 4)
            const { data: previewData, error: previewError } = await supabase
              .from("collection_favorites")
              .select("favorites!inner(images!inner(url))")
              .eq("collection_id", collection.id)
              .order("added_at", { ascending: false })
              .limit(4);

            const preview_images =
              previewData?.map((item: any) => item.favorites.images.url) || [];

            return {
              ...collection,
              image_count: count || 0,
              preview_images,
            };
          }),
        );

        console.log(
          "✅ [DEBUG] Found",
          collectionsWithCounts.length,
          "collections",
        );
        setCollections(collectionsWithCounts);
      } else {
        console.log("⚠️ [DEBUG] No collections found");
        setCollections([]);
      }
    } catch (error) {
      console.error("❌ [DEBUG] Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔍 [DEBUG] useEffect triggered - loadCollections");
    console.log(
      "🔍 [DEBUG] User in useEffect:",
      user ? "User exists" : "No user",
    );
    loadCollections();
  }, [user]);

  const handleCreateCollection = (newCollection: Collection) => {
    console.log(
      "🔍 [DEBUG] handleCreateCollection called with:",
      newCollection,
    );
    console.log(
      "🔍 [DEBUG] Current collections before adding:",
      collections.length,
    );

    setCollections((prev) => {
      const updated = [
        { ...newCollection, image_count: 0, preview_images: [] },
        ...prev,
      ];
      console.log("🔍 [DEBUG] Updated collections state:", updated.length);
      return updated;
    });
    setShowCreateModal(false);

    console.log("🔍 [DEBUG] Collection creation completed, refreshing...");
    // Refresh collections from database to verify it was saved
    setTimeout(() => {
      console.log("🔍 [DEBUG] Triggering refresh after collection creation");
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
    console.log("🔍 [DEBUG] handleDeleteCollection called for:", collectionId);

    if (
      !confirm(
        "Are you sure you want to delete this collection? This action cannot be undone.",
      )
    ) {
      console.log("🔍 [DEBUG] Collection deletion cancelled by user");
      return;
    }

    try {
      console.log(
        "🔍 [DEBUG] Attempting to delete collection from database...",
      );
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionId);

      if (error) {
        console.error("❌ [DEBUG] Error deleting collection:", error);
        alert("Failed to delete collection. Please try again.");
      } else {
        console.log("✅ [DEBUG] Collection deleted successfully from database");
        setCollections((prev) => {
          const updated = prev.filter((col) => col.id !== collectionId);
          console.log(
            "🔍 [DEBUG] Updated collections after deletion:",
            updated.length,
          );
          return updated;
        });
      }
    } catch (error) {
      console.error("❌ [DEBUG] Unexpected error deleting collection:", error);
      alert("Failed to delete collection. Please try again.");
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    console.log("🔍 [DEBUG] Rendering loading state");
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
              console.log(
                "🔍 [DEBUG] Create Collection button clicked from empty state",
              );
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
                    title="View collection"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => setEditingCollection(collection)}
                    className={styles.editButton}
                    title="Edit collection"
                  >
                    ✏️
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
                          <img
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
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
                  <span
                    className={`${styles.privacyBadge} ${styles[collection.privacy]}`}
                  >
                    {collection.privacy === "private" ? "🔒" : "🌐"}{" "}
                    {collection.privacy}
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
