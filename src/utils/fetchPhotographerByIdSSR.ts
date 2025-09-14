import { supabase } from "@/lib/supabaseClient";
import { Photographer } from "@/types/gallery";
import { slugify } from "@/utils/slugify";

// Fetch by slug (recommended for URLs)
export async function fetchPhotographerBySlugSSR(
  surname: string
): Promise<Photographer | null> {
  try {
    // Fetch the photographer by surname
    const { data: photographers, error: photographerError } = await supabase
      .from("photographers")
      .select("*")
      .eq("surname", surname)
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
      .from("images")
      .select("*")
      .eq("author", photographer.author);

    if (imagesError) {
      console.error(
        "[fetchPhotographerBySlugSSR] Images fetch error",
        imagesError
      );
      photographer.images = [];
      return photographer as Photographer;
    }

    photographer.images = images || [];
    return photographer as Photographer;
  } catch (err) {
    console.error("[fetchPhotographerBySlugSSR] Unexpected error", err);
    return null;
  }
}
