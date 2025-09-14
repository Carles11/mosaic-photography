import { supabase } from "@/lib/supabaseClient";
import { ImageData } from "@/types/gallery";

/**
 * Fetches all "featured" images (where url filename starts with 000_aaa)
 * for all photographers.
 */
export async function fetchPhotographersFeaturedImages(): Promise<
  ImageData[] | null
> {
  try {
    const { data, error } = await supabase
      .from("images")
      .select(
        `
        id,
        url,
        author,
        title,
        description,
        created_at,
        orientation
      `
      )
      .ilike("url", "%/000_aaa%") // finds URLs ending in /000_aaa...
      .order("author", { ascending: true });

    if (error || !data) {
      console.error(
        "[SSR fetchPhotographersFeaturedImages] Supabase error or no data",
        error
      );
      return null;
    }

    return data as ImageData[];
  } catch (err) {
    console.error(
      "[SSR fetchPhotographersFeaturedImages] Unexpected error",
      err
    );
    return null;
  }
}
