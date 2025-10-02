import { supabase } from "@/lib/supabaseClient";
import { Photographer, ImageData } from "@/types/gallery";
import { getAllS3Urls } from "@/utils/imageResizingS3";

// Fetch by slug (recommended for URLs)
export async function fetchPhotographerBySlugSSR(
  slug: string
): Promise<Photographer | null> {
  try {
    // Fetch the photographer by surname
    const { data: photographers, error: photographerError } = await supabase
      .from("photographers")
      .select("*")
      .eq("slug", slug)
      .limit(1);

    if (photographerError || !photographers || photographers.length === 0) {
      console.error(
        "[fetchPhotographerBySlugSSR] Photographer not found or error",
        photographerError
      );
      return null;
    }

    const photographer = photographers[0];

    // Fetch all images for this photographer
    const { data: images, error: imagesError } = await supabase
      .from("images_resize")
      .select("*")
      .eq("author", photographer.author);

    let imagesWithProgressive: ImageData[] = [];

    if (images) {
      imagesWithProgressive = images.map((img: ImageData) => ({
        ...img,
        s3Progressive: getAllS3Urls(img),
      }));
    }

    if (imagesError) {
      console.error(
        "[fetchPhotographerBySlugSSR] Images fetch error",
        imagesError
      );
      photographer.images = [];
      return photographer as Photographer;
    }

    photographer.images = imagesWithProgressive;
    return photographer as Photographer;
  } catch (err) {
    console.error("[fetchPhotographerBySlugSSR] Unexpected error", err);
    return null;
  }
}
