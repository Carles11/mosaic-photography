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
import { Collection, ImageData } from "@/types";
import ImageWrapper from "@/components/wrappers/ImageWrapper";

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

  // Preview images by collectionId
  const [collectionPreviews, setCollectionPreviews] = useState<
    Record<string, ImageData[]>
  >({});

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load collections and batch fetch preview images
  const loadCollections = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await supabase.auth.getSession();
      // Fetch all collections for user
      const { data: collectionsData } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      let collectionsWithCounts: Collection[] = [];
      const previewsMap: Record<string, ImageData[]> = {};

      if (collectionsData && collectionsData.length > 0) {
        const allCollectionIds = collectionsData.map((c) => c.id);

        // Get all favorite_ids for all collections (up to 4 per collection)
        const { data: allFavorites } = await supabase
          .from("collection_favorites")
          .select("collection_id, favorite_id, display_order")
          .in("collection_id", allCollectionIds)
          .order("display_order", { ascending: true });

        // Map: collection_id -> [favorite_id...]
        const previewFavoriteIdsByCollection: Record<string, number[]> = {};
        const allPreviewFavoriteIds: number[] = [];

        allCollectionIds.forEach((cid) => {
          // Get up to 4 favorite_ids for this collection
          const favsForCollection = (allFavorites || [])
            .filter((f) => f.collection_id === cid)
            .slice(0, 4);
          const favIds = favsForCollection.map((f) => f.favorite_id);
          previewFavoriteIdsByCollection[cid] = favIds;
          allPreviewFavoriteIds.push(...favIds);
        });

        // Fetch all favorites info for those IDs
        const { data: previewFavoritesInfo } = await supabase
          .from("favorites")
          .select("id, image_id")
          .in("id", allPreviewFavoriteIds);

        // Map favorite_id -> image_id
        const favoriteIdToImageId: Record<number, string> = {};
        (previewFavoritesInfo || []).forEach((fav) => {
          favoriteIdToImageId[fav.id] = fav.image_id;
        });

        // Get all unique image IDs
        const allPreviewImageIds = [
          ...new Set(Object.values(favoriteIdToImageId).filter(Boolean)),
        ];

        // Fetch all image info for image IDs
        const { data: previewImagesData } = await supabase
          .from("images_resize")
          .select(
            "id, author, title, description, created_at, base_url, filename, width, height, orientation"
          )
          .in("id", allPreviewImageIds);

        // Map image_id -> ImageData
        const imageIdToData: Record<string, ImageData> = {};
        (previewImagesData || []).forEach((img) => {
          imageIdToData[String(img.id)] = {
            id: String(img.id),
            url:
              img.base_url && img.filename
                ? `${img.base_url}/w400/${img.filename}`
                : "/favicons/android-chrome-512x512.png",
            base_url: img.base_url,
            filename: img.filename,
            author: img.author || "Unknown",
            title: img.title || "",
            description: img.description || "",
            created_at: img.created_at || "",
            width: img.width,
            height: img.height,
            orientation: img.orientation,
          };
        });

        // Build previews for each collection
        allCollectionIds.forEach((cid) => {
          const favIds = previewFavoriteIdsByCollection[cid] || [];
          const imgsForCollection: ImageData[] = favIds.map((favId) => {
            const imgId = favoriteIdToImageId[favId];
            return (
              imageIdToData[imgId] || {
                id: `preview-${cid}-${favId}`,
                url: "/favicons/android-chrome-512x512.png",
                author: "Unknown",
                title: "",
                description: "",
                created_at: "",
              }
            );
          });
          previewsMap[cid] = imgsForCollection;
        });

        // For each collection, count images (from image_count query)
        collectionsWithCounts = await Promise.all(
          collectionsData.map(async (collection) => {
            // Get image count
            const { count: imageCount } = await supabase
              .from("collection_favorites")
              .select("*", { count: "exact", head: true })
              .eq("collection_id", collection.id);
            return {
              ...collection,
              image_count: imageCount || 0,
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
      setCollectionPreviews(previewsMap);
    } catch (err) {
      console.error("Error loading collections:", err);
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
      { ...newCollection, image_count: 0 },
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
              background: "var(--tertiary-color)",
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
                    Edit
                  </button>
                  <button
                    onClick={() => setEditingCollection(collection)}
                    className={`${buttonStyles.buttonBase} ${buttonStyles.editButton}`}
                    title="Edit collection"
                  >
                    Rename
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

              <div
                className={styles.previewContainer}
                onClick={() =>
                  router.push(`/profile/collections/${collection.id}`)
                }
              >
                <div className={styles.imageGrid}>
                  {(collectionPreviews[collection.id] || []).map((imgData) => (
                    <div key={imgData.id} className={styles.previewThumb}>
                      <ImageWrapper
                        image={imgData}
                        width={120}
                        height={120}
                        showOverlayButtons={false}
                        imgStyleOverride={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        sizes="120px"
                      />
                    </div>
                  ))}
                </div>
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
          <span style={{ display: "none" }} />
        </EditCollectionLauncher>
      )}
    </div>
  );
});

CollectionsList.displayName = "CollectionsList";

export default CollectionsList;
