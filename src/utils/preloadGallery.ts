import { supabase } from "@/lib/supabaseClient";
import { ImageWithOrientation } from "@/types/gallery";

// Shared cache for gallery data
let galleryCache: ImageWithOrientation[] | null = null;

export async function preloadGalleryData(): Promise<
  ImageWithOrientation[] | null
> {
  if (galleryCache) {
    if (typeof window !== "undefined") {
      console.log("[Gallery Preload] Using cached gallery data.");
    }
    return galleryCache;
  }
  if (typeof window !== "undefined") {
    console.log("[Gallery Preload] Fetching gallery data from Supabase...");
  }
  try {
    const { data: images, error } = await supabase
      .from("images")
      .select(`id, url, author, title, description, created_at, orientation`);
    if (error || !images) {
      if (typeof window !== "undefined") {
        console.log("[Gallery Preload] Error or no data returned.");
      }
      return null;
    }
    const filteredImages = images.filter((img) => {
      const fileName = img.url.split("/").pop()?.toLowerCase();
      return !fileName?.startsWith("000_aaa");
    });
    const processedImages: ImageWithOrientation[] = filteredImages.map(
      (img, index) => {
        let mosaicType: "normal" | "large" | "wide" | "tall" = "normal";
        const isLargeMosaic = index > 0 && index % 11 === 0;
        const isWideMosaic = index > 0 && index % 13 === 7;
        const isTallMosaic = index > 0 && index % 17 === 5;
        if (isLargeMosaic) mosaicType = "large";
        else if (isWideMosaic) mosaicType = "wide";
        else if (isTallMosaic) mosaicType = "tall";
        return {
          ...img,
          orientation: img.orientation || "vertical",
          mosaicType,
        };
      },
    );
    if (typeof window !== "undefined") {
      console.log(
        `[Gallery Preload] Preloading ${processedImages.length} gallery images.`,
      );
    }
    // Preload images in browser
    if (typeof window !== "undefined") {
      processedImages.forEach((img) => {
        const preloadImg = new window.Image();
        preloadImg.src = img.url;
      });
    }
    galleryCache = processedImages;
    if (typeof window !== "undefined") {
      console.log(
        "[Gallery Preload] Gallery data and images preloaded and cached.",
      );
    }
    return processedImages;
  } catch (e) {
    if (typeof window !== "undefined") {
      console.log("Error preloading gallery data:", e);
    }
    return null;
  }
}

export function getPreloadedGalleryData(): ImageWithOrientation[] | null {
  return galleryCache;
}
