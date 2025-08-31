// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
import { supabase } from "@/lib/supabaseClient";
import { ImageWithOrientation } from "@/types/gallery";

export async function fetchGalleryImagesSSR(): Promise<
  ImageWithOrientation[] | null
> {
  try {
    const { data: images, error } = await supabase
      .from("images")
      .select("id, url, author, title, description, created_at, orientation");
    if (error || !images) {
      console.error(
        "[SSR fetchGalleryImagesSSR] Supabase error or no data",
        error,
      );
      return null;
    }
    // Filter out images starting with 000_aaa (like in preloadGalleryData)
    const filteredImages = images.filter((img) => {
      const fileName = img.url.split("/").pop()?.toLowerCase();
      return !fileName?.startsWith("000_aaa");
    });
    // Shuffle for random order
    const shuffledImages = shuffleArray(filteredImages);
    // Add mosaicType logic (like in preloadGalleryData)
    const processedImages: ImageWithOrientation[] = shuffledImages.map(
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
    console.log("[SSR fetchGalleryImagesSSR] processedImages", processedImages);
    return processedImages;
  } catch (err) {
    console.error("[SSR fetchGalleryImagesSSR] Exception", err);
    return null;
  }
}
