"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import JSZip from "jszip";
import { toast } from "react-hot-toast";
import styles from "./CollectionView.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useAuthSession } from "@/context/AuthSessionContext";
import { CollectionWithImages } from "@/types";
import ShareCollectionModal from "@/components/profile/ShareCollectionModal";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

interface CollectionImageData {
  id: string;
  url: string;
  title?: string;
  description?: string;
  favorite_id: number;
  image_id: string;
  image_url: string;
  image_title: string;
  image_author: string;
  added_at: string;
}

export default function CollectionView() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthSession();
  const [collection, setCollection] = useState<CollectionWithImages | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [isReordering, setIsReordering] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null,
  );

  const collectionId = params?.id as string;
  const isEmbedded = searchParams?.get("embed") === "true";

  const loadCollection = useCallback(async () => {
    if (!collectionId) {
      setError("Collection ID not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get collection details
      const { data: collectionData, error: collectionError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (collectionError) {
        console.error("Error loading collection:", collectionError);
        setError("Collection not found");
        setLoading(false);
        return;
      }

      // Get collection images with details
      // We need to handle this differently because favorites.image_id is TEXT (like "4960")
      // and we need to match it with images.id
      const { data: collectionFavoritesData, error: collectionFavoritesError } =
        await supabase
          .from("collection_favorites")
          .select("favorite_id, added_at, display_order")
          .eq("collection_id", collectionId)
          .order("display_order", { ascending: true });

      if (collectionFavoritesError) {
        console.error(
          "Error loading collection favorites:",
          collectionFavoritesError,
        );
        setError("Error loading collection images");
        setLoading(false);
        return;
      }

      let imagesData: CollectionImageData[] = [];
      if (collectionFavoritesData && collectionFavoritesData.length > 0) {
        // Get favorites to get image_ids
        const favoriteIds = collectionFavoritesData.map(
          (item) => item.favorite_id,
        );
        const { data: favoritesData, error: favoritesError } = await supabase
          .from("favorites")
          .select("id, image_id")
          .in("id", favoriteIds);

        if (favoritesError) {
          console.error("Error loading favorites:", favoritesError);
          // If we can't access favorites (anonymous user), still show empty collection
          setCollection({
            ...collectionData,
            images: [],
          });
          setLoading(false);
          return;
        }

        if (favoritesData && favoritesData.length > 0) {
          // Get image details from images table
          const imageIds = favoritesData.map((fav) => fav.image_id);
          const { data: imagesTableData, error: imagesError } = await supabase
            .from("images")
            .select("id, url, title, author")
            .in("id", imageIds);

          if (imagesError) {
            console.error("Error loading images:", imagesError);
            setError("Error loading collection images");
            setLoading(false);
            return;
          }

          // Combine the data
          imagesData = collectionFavoritesData
            .map((cfItem) => {
              const favorite = favoritesData.find(
                (f) => f.id === cfItem.favorite_id,
              );
              const image = favorite
                ? imagesTableData?.find((img) => img.id === favorite.image_id)
                : null;

              return {
                id: favorite?.image_id || "", // Use image_id as id
                url: image?.url || "", // Use image.url as url
                title: image?.title || "Image not found",
                description: undefined, // No description available
                // Additional properties for later use
                favorite_id: cfItem.favorite_id,
                image_id: favorite?.image_id || "",
                image_url: image?.url || "",
                image_title: image?.title || "Image not found",
                image_author: image?.author || "Unknown",
                added_at: cfItem.added_at,
              };
            })
            .filter((item) => item.url); // Filter out items where image wasn't found
        }
      }

      if (imagesData.length === 0) {
        // Collection with no images or access issues
        setCollection({
          ...collectionData,
          images: [],
        });
        setLoading(false);
        return;
      }

      // Transform the data
      const images = imagesData.map((item: CollectionImageData) => ({
        favorite_id: item.favorite_id,
        image_id: item.image_id,
        image_url: item.image_url,
        image_title: item.image_title,
        image_author: item.image_author,
        added_at: item.added_at,
      }));

      setCollection({
        ...collectionData,
        images,
      });
    } catch (error) {
      console.error("Error loading collection:", error);
      setError("Failed to load collection");
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    loadCollection();
  }, [collectionId, loadCollection]);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleRemoveImages = async () => {
    if (!collection || selectedImages.size === 0 || !user) return;

    const favoriteIds = Array.from(selectedImages);

    try {
      const { error } = await supabase
        .from("collection_favorites")
        .delete()
        .eq("collection_id", collection.id)
        .in("favorite_id", favoriteIds);

      if (error) {
        console.error("Error removing images:", error);
        return;
      }

      // Reload collection
      setSelectedImages(new Set());
      await loadCollection();
    } catch (error) {
      console.error("Error removing images:", error);
    }
  };

  const handleImageSelect = (favoriteId: number) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(favoriteId)) {
      newSelected.delete(favoriteId);
    } else {
      newSelected.add(favoriteId);
    }
    setSelectedImages(newSelected);
  };

  const handleExportZip = async () => {
    if (!collection || !collection.images.length || isExporting) return;

    try {
      setIsExporting(true);

      // First, let's try to create a proper ZIP with image downloads
      const zip = new JSZip();
      const collectionFolder = zip.folder(
        collection.name.replace(/[^a-z0-9]/gi, "_"),
      );

      let successCount = 0;
      let failCount = 0;

      // Download all images and add them to the ZIP
      for (let index = 0; index < collection.images.length; index++) {
        const image = collection.images[index];
        try {
          console.debug(`[ZIP DEBUG] Attempting to fetch image:`, {
            url: image.image_url,
            title: image.image_title,
            index,
          });
          // Try to fetch the image
          const response = await fetch(image.image_url, {
            mode: "cors",
            credentials: "omit",
          });

          console.debug(
            `[ZIP DEBUG] Fetch response for ${image.image_title}:`,
            response,
          );

          if (!response.ok) {
            console.error(
              `[ZIP DEBUG] Response not ok for ${image.image_title}:`,
              response.status,
              response.statusText,
            );
            throw new Error(`HTTP ${response.status}`);
          }

          const blob = await response.blob();
          console.debug(`[ZIP DEBUG] Blob for ${image.image_title}:`, blob);

          if (blob.size === 0) {
            console.error(`[ZIP DEBUG] Blob size 0 for ${image.image_title}`);
            throw new Error("Empty response");
          }

          const fileExtension =
            image.image_url.split(".").pop()?.toLowerCase() || "jpg";
          const fileName = `${String(index + 1).padStart(3, "0")}_${image.image_title.replace(/[^a-z0-9]/gi, "_")}.${fileExtension}`;

          collectionFolder?.file(fileName, blob);
          successCount++;
          console.log(
            `✓ Downloaded: ${image.image_title} (${blob.size} bytes)`,
          );
        } catch (error) {
          failCount++;
          console.warn(`[ZIP DEBUG] ✗ Failed: ${image.image_title} -`, error);
          // Add a text file with the image URL as fallback
          const fileName = `${String(index + 1).padStart(3, "0")}_${image.image_title.replace(/[^a-z0-9]/gi, "_")}_URL.txt`;
          collectionFolder?.file(
            fileName,
            `Image URL: ${image.image_url}\nTitle: ${image.image_title}\nAuthor: ${image.image_author}`,
          );
        }
      }

      // If no images were successfully downloaded, show alternative options
      if (successCount === 0) {
        setIsExporting(false);
        console.error(
          `[ZIP DEBUG] All image downloads failed. Likely CORS issue or network error.`,
        );
        // Use a toast to ask for user choice instead of confirm
        toast(
          "Unable to download images directly due to CORS restrictions. Creating a ZIP with image URLs only.",
          { icon: "⚠️", duration: 8000 },
        );
        // Continue with URL-only ZIP below
      }

      // Create a branded Mosaic.photography text file with all image information
      const now = new Date();
      const exportDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const imageList = collection.images
        .map(
          (image, index) =>
            `${index + 1}. ${image.image_title}\n` +
            `   Author: ${image.image_author}\n` +
            `   URL: ${image.image_url}\n`,
        )
        .join("\n");

      const infoText =
        `========================================\n` +
        `        Mosaic.photography Collection Export\n` +
        `========================================\n\n` +
        `Thank you for using Mosaic.photography!\n` +
        `This file contains information about your exported image collection.\n\n` +
        `Collection Name: ${collection.name}\n` +
        `Exported On: ${exportDate}\n` +
        `Total Images: ${collection.images.length}\n` +
        `Successfully Downloaded: ${successCount}\n` +
        `Failed Downloads: ${failCount}\n\n` +
        `----------------------------------------\n` +
        `IMAGE LIST\n` +
        `----------------------------------------\n\n` +
        imageList +
        `\n----------------------------------------\n` +
        `For more inspiration, visit https://mosaic.photography\n\n` +
        `© ${now.getFullYear()} Mosaic.photography. All rights reserved.\n`;

      collectionFolder?.file("_Mosaic_Collection_Info.txt", infoText);

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      // Create download link
      const zipFileName = `${collection.name.replace(/[^a-z0-9]/gi, "_")}_collection.zip`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(link.href);

      if (successCount === collection.images.length) {
        toast.success(
          `Successfully exported all ${successCount} images as ${zipFileName}!`,
        );
      } else if (successCount > 0) {
        toast(
          `Exported ${successCount} images successfully. ${failCount} images failed due to CORS restrictions. Check the _Image_URLs_and_Info.txt file for missing images.`,
          { icon: "⚠️", duration: 8000 },
        );
      } else {
        toast(
          `Created ZIP with image URLs and info. No images could be downloaded directly due to CORS restrictions.`,
          { icon: "⚠️", duration: 8000 },
        );
      }
    } catch (error) {
      console.error("Error creating ZIP:", error);
      toast.error("Error creating ZIP file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, favoriteId: number) => {
    if (!isReordering) return;
    setDraggedItem(favoriteId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", favoriteId.toString());
    // Add some visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add(styles.dragging);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Always reset visual state
    const target = e.currentTarget as HTMLElement;
    target.classList.remove(styles.dragging);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e: React.DragEvent, favoriteId: number) => {
    if (!isReordering || !draggedItem) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (favoriteId !== draggedItem) {
      setDragOverItem(favoriteId);
      // Determine before/after
      const targetElement = e.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      let isAfter = false;
      if (rect.width > rect.height) {
        isAfter = e.clientX > rect.left + rect.width / 2;
      } else {
        isAfter = e.clientY > rect.top + rect.height / 2;
      }
      setDropPosition(isAfter ? "after" : "before");
    }
  };

  // Touch event handlers for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent, favoriteId: number) => {
    if (!isReordering || !isMobile) return;

    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });

    // Start drag after a small delay to differentiate from scrolling
    setTimeout(() => {
      if (Date.now() - touchStartTime >= 200) {
        setDraggedItem(favoriteId);
        // Add visual feedback
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = "0.5";
        target.style.transform = "scale(1.05)";
        target.style.zIndex = "1000";
      }
    }, 200);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isReordering || !isMobile || !draggedItem) return;

    e.preventDefault(); // Prevent scrolling while dragging

    const touch = e.touches[0];
    const elementBelow = document.elementFromPoint(
      touch.clientX,
      touch.clientY,
    );

    // Find the closest image card
    const imageCard = elementBelow?.closest(
      "[data-favorite-id]",
    ) as HTMLElement;
    if (imageCard) {
      const favoriteId = parseInt(imageCard.dataset.favoriteId || "0");
      if (favoriteId && favoriteId !== draggedItem) {
        setDragOverItem(favoriteId);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isReordering || !isMobile) return;

    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    target.style.transform = "scale(1)";
    target.style.zIndex = "auto";

    if (draggedItem && dragOverItem && draggedItem !== dragOverItem) {
      // Perform the drop operation
      handleDrop(e as unknown as React.DragEvent<HTMLDivElement>, dragOverItem);
    }

    setDraggedItem(null);
    setDragOverItem(null);
    setTouchStartTime(0);
  };

  // Swipe gesture for quick selection on mobile
  const handleSwipeGesture = (e: React.TouchEvent, favoriteId: number) => {
    if (isReordering || !isMobile) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);
    const swipeTime = Date.now() - touchStartTime;

    // Detect horizontal swipe (at least 50px horizontal, less than 30px vertical, under 300ms)
    if (Math.abs(deltaX) > 50 && deltaY < 30 && swipeTime < 300) {
      e.preventDefault();
      handleImageSelect(favoriteId);

      // Add haptic feedback if available
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  // const _handleDragEnd = (event: React.DragEvent) => {
  //   if (!isReordering) return;

  //   // Reset visual state
  //   const target = event.target as HTMLElement;
  //   target.style.opacity = "1";

  //   setDraggedItem(null);
  //   setDragOverItem(null);
  // };

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const _handleDragOver = (event: React.DragEvent, favoriteId: number) => {
  //   if (!isReordering || !draggedItem) return;

  //   event.preventDefault();
  //   event.dataTransfer.dropEffect = "move";

  //   // Only update if we're over a different item
  //   if (favoriteId !== draggedItem && favoriteId !== dragOverItem) {
  //     setDragOverItem(favoriteId);
  //   }
  // };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isReordering) return;
    // Only clear dragOverItem if we're leaving the container entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverItem(null);
      setDropPosition(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetFavoriteId: number) => {
    if (!isReordering || !draggedItem || !collection || !user) return;
    e.preventDefault();
    setDragOverItem(null);
    setDropPosition(null);
    // Remove dragging class from all image cards
    document.querySelectorAll(`.${styles.dragging}`).forEach((el) => {
      el.classList.remove(styles.dragging);
    });
    if (draggedItem === targetFavoriteId) {
      setDraggedItem(null);
      return;
    }
    try {
      // Find current positions
      const draggedIndex = collection.images.findIndex(
        (img) => img.favorite_id === draggedItem,
      );
      const targetIndex = collection.images.findIndex(
        (img) => img.favorite_id === targetFavoriteId,
      );
      if (draggedIndex === -1 || targetIndex === -1) return;
      // Determine before/after
      let insertIndex = targetIndex;
      if (dropPosition === "after") insertIndex = targetIndex + 1;
      // Adjust for removing the dragged item if it comes before the insert point
      let adjustedIndex = insertIndex;
      if (draggedIndex < insertIndex) adjustedIndex--;
      // Create new order
      const newImages = [...collection.images];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(adjustedIndex, 0, draggedImage);
      // Update display_order in database
      const updates = newImages.map((image, index) => ({
        collection_id: collection.id,
        favorite_id: image.favorite_id,
        display_order: index,
      }));
      // Batch update display orders
      for (const update of updates) {
        await supabase
          .from("collection_favorites")
          .update({ display_order: update.display_order })
          .eq("collection_id", update.collection_id)
          .eq("favorite_id", update.favorite_id);
      }
      // Reload collection to reflect new order
      await loadCollection();
    } catch (error) {
      console.error("Error reordering images:", error);
    } finally {
      setDraggedItem(null);
    }
  };

  if (loading) {
    return (
      <>
        <Header
          onLoginClick={() => router.push("/?modal=auth")}
          user={user}
          onLogoutClick={handleLogout}
        />
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading collection...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          onLoginClick={() => router.push("/?modal=auth")}
          user={user}
          onLogoutClick={handleLogout}
        />
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>Error</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push("/")}
              className={styles.backButton}
            >
              Start at home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!collection) {
    return (
      <>
        <Header
          onLoginClick={() => router.push("/?modal=auth")}
          user={user}
          onLogoutClick={handleLogout}
        />
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>Collection Not Found</h2>
            <button
              onClick={() => router.push("/")}
              className={styles.backButton}
            >
              Start at home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {!isEmbedded && (
        <Header
          onLoginClick={() => router.push("/?modal=auth")}
          user={user}
          onLogoutClick={handleLogout}
        />
      )}
      <div
        className={`${styles.container} ${isEmbedded ? styles.embedded : ""}`}
      >
        {/* Header */}
        {!isEmbedded && (
          <div className={styles.header}>
            <div className={styles.breadcrumb}>
              {user ? (
                <>
                  <button
                    onClick={() => router.push("/profile")}
                    className={styles.breadcrumbLink}
                  >
                    Profile
                  </button>
                  <span className={styles.breadcrumbSeparator}>→</span>
                  <button
                    onClick={() =>
                      router.push("/photo-curations?tab=collections")
                    }
                    className={styles.breadcrumbLink}
                  >
                    Collections
                  </button>
                  <span className={styles.breadcrumbSeparator}>→</span>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/")}
                    className={styles.breadcrumbLink}
                  >
                    Home
                  </button>
                  <span className={styles.breadcrumbSeparator}>→</span>
                  <span className={styles.breadcrumbCurrent}>Collection</span>
                  <span className={styles.breadcrumbSeparator}>→</span>
                </>
              )}
              <span className={styles.breadcrumbCurrent}>
                {collection.name}
              </span>
            </div>

            <div className={styles.collectionInfo}>
              <h1 className={styles.title}>{collection.name}</h1>
              {collection.description && (
                <p className={styles.description}>{collection.description}</p>
              )}
              <div className={styles.meta}>
                <span className={styles.imageCount}>
                  {collection.images.length} image
                  {collection.images.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            {collection.user_id === user?.id && (
              <div className={styles.actions}>
                {selectedImages.size > 0 && (
                  <button
                    onClick={handleRemoveImages}
                    className={styles.removeButton}
                  >
                    Remove Selected ({selectedImages.size})
                  </button>
                )}
                <button
                  onClick={() => setIsReordering(!isReordering)}
                  className={styles.reorderButton}
                >
                  {isReordering ? "Done Reordering" : "Reorder Images"}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className={styles.shareButton}
                >
                  Share Collection
                </button>
                <button
                  onClick={handleExportZip}
                  className={styles.exportButton}
                  disabled={isExporting}
                >
                  {isExporting ? "Creating ZIP..." : "Export as ZIP"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Collection Info for Embedded View */}
        {isEmbedded && (
          <div className={styles.collectionInfo}>
            <h1 className={styles.title}>{collection.name}</h1>
            {collection.description && (
              <p className={styles.description}>{collection.description}</p>
            )}
          </div>
        )}

        {/* Images Grid */}
        {collection.images.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📷</div>
            <h3>No images in this collection</h3>
            <p>Add some images from your favorites to get started!</p>
          </div>
        ) : (
          <>
            {/* Mobile reordering instructions */}
            {isReordering && isMobile && (
              <div className={styles.mobileInstructions}>
                <p>
                  <strong>Touch and hold</strong> an image for 0.2 seconds to
                  start dragging.
                  <br />
                  <strong>Swipe left or right</strong> on images to select them
                  quickly.
                </p>
              </div>
            )}

            <div className={styles.grid}>
              {collection.images.map((image) => (
                <div
                  key={image.favorite_id}
                  data-favorite-id={image.favorite_id}
                  className={`
                    ${styles.imageCard}
                    ${selectedImages.has(image.favorite_id) ? " " + styles.selected : ""}
                    ${isReordering ? " " + styles.reordering : ""}
                    ${draggedItem === image.favorite_id ? " " + styles.dragging : ""}
                    ${dragOverItem === image.favorite_id ? " " + styles.dragOver : ""}
                    ${isMobile ? " " + styles.mobile : ""}
                  `}
                  draggable={isReordering && !isMobile}
                  onDragStart={(e) => handleDragStart(e, image.favorite_id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, image.favorite_id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, image.favorite_id)}
                  onTouchStart={(e) => {
                    if (isReordering) {
                      handleTouchStart(e, image.favorite_id);
                    } else {
                      const touch = e.touches[0];
                      setTouchStartTime(Date.now());
                      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
                    }
                  }}
                  onTouchMove={isReordering ? handleTouchMove : undefined}
                  onTouchEnd={(e) => {
                    if (isReordering) {
                      handleTouchEnd(e);
                    } else {
                      handleSwipeGesture(e, image.favorite_id);
                    }
                  }}
                >
                  {collection.user_id === user?.id && (
                    <div className={styles.selectCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedImages.has(image.favorite_id)}
                        onChange={() => handleImageSelect(image.favorite_id)}
                      />
                    </div>
                  )}

                  <div className={styles.imageWrapper}>
                    <Image
                      src={image.image_url}
                      alt={image.image_title}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  </div>

                  <div className={styles.imageInfo}>
                    <h4 className={styles.imageTitle}>{image.image_title}</h4>
                    <p className={styles.imageAuthor}>
                      by {image.image_author}
                    </p>
                  </div>

                  {isReordering && <div className={styles.dragHandle}>⋮⋮</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Share Modal */}
        {collection && (
          <ShareCollectionModal
            isOpen={showShareModal}
            collection={collection}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
      {!isEmbedded && <Footer />}
    </>
  );
}
