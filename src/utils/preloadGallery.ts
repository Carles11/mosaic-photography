import { supabase } from "@/lib/supabaseClient";
import { ImageWithOrientation } from "@/types/gallery";

// Shared cache for gallery data
let galleryCache: ImageWithOrientation[] | null = null;

// Try to load from sessionStorage on module load (browser only)
if (typeof window !== "undefined") {
  try {
    const cached = window.sessionStorage.getItem("galleryCache");
    if (cached) {
      galleryCache = JSON.parse(cached);
    }
  } catch {
    // Ignore JSON parse/storage errors
  }
}

export async function preloadGalleryData(): Promise<
  ImageWithOrientation[] | null
> {
  if (galleryCache) {
    if (typeof window !== "undefined") {
    }
    return galleryCache;
  }
  if (typeof window !== "undefined") {
  }
  try {
    const { data: images, error } = await supabase
      .from("images")
      .select(`id, url, author, title, description, created_at, orientation`);
    if (error || !images) {
      if (typeof window !== "undefined") {
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
      try {
        window.sessionStorage.setItem(
          "galleryCache",
          JSON.stringify(processedImages),
        );
      } catch {
        // Ignore storage errors
      }
    }
    return processedImages;
  } catch {
    if (typeof window !== "undefined") {
    }
    return null;
  }
}

export function getPreloadedGalleryData(): ImageWithOrientation[] | null {
  return galleryCache;
}
