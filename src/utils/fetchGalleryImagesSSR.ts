import { supabase } from "@/lib/supabaseClient";
import { ImageWithOrientation } from "@/types/gallery";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function fetchGalleryImagesSSR(): Promise<
  ImageWithOrientation[] | null
> {
  try {
    const { data: images, error } = await supabase
      .from("images_resize")
      .select(
        "id, base_url, filename, author, title, description, created_at, orientation, width, height"
      );
    if (error || !images) {
      console.error(
        "[SSR fetchGalleryImagesSSR] Supabase error or no data",
        error
      );
      return null;
    }
    // Compose image URL from base_url and filename (filename includes extension!)
    const imagesWithUrl = images.map((img) => ({
      ...img,
      url: img.base_url.endsWith("/")
        ? img.base_url + img.filename
        : img.base_url + "/" + img.filename,
    }));

    // Filter out images starting with 000_aaa
    const filteredImages = imagesWithUrl.filter((img) => {
      const fileName = img.filename.toLowerCase();
      return !fileName.startsWith("000_aaa");
    });

    // Shuffle for random order
    const shuffledImages = shuffleArray(filteredImages);

    // Add mosaicType logic
    const processedImages: ImageWithOrientation[] = shuffledImages.map(
      (img, index) => {
        let mosaicType: "normal" | "large" | "wide" | "tall" = "normal";
        const isLargeMosaic = index > 0 && index % 3 === 0;
        const isWideMosaic = index > 0 && index % 4 < 2;
        const isTallMosaic = index > 0 && index % 9 === 2;

        if (isLargeMosaic) mosaicType = "large";
        else if (isWideMosaic) mosaicType = "wide";
        else if (isTallMosaic) mosaicType = "tall";
        return {
          ...img,
          orientation: img.orientation || "vertical",
          mosaicType,
        };
      }
    );
    return processedImages;
  } catch (err) {
    console.error("[SSR fetchGalleryImagesSSR] Exception", err);
    return null;
  }
}
