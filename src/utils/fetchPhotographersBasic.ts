import { supabase } from "@/lib/supabaseClient";
import { Photographer } from "@/types/gallery";
import { getAllS3Urls } from "@/utils/imageResizingS3";

/**
 * Fetch photographers with basic info and their portrait image if available (portraits filename starts always with 000_aaa).
 * Returns all photographers regardless of whether they have a portrait image.
 * SSR/SSG friendly.
 */
export async function fetchPhotographersBasic(): Promise<
  Photographer[] | null
> {
  try {
    // First, fetch all photographers
    const { data: photographers, error: photographersError } = await supabase
      .from("photographers")
      .select(
        `
        id,
        name,
        surname,
        author,
        biography,
        intro,
        birthdate,
        deceasedate,
        origin,
        website,
        store,
        instagram,
        random_order
      `
      )
      .order("random_order", { ascending: true });

    if (photographersError || !photographers) {
      console.error(
        "[SSR fetchPhotographersBasic] Photographers fetch error",
        photographersError
      );
      return null;
    }

    // Then, fetch portrait images for all photographers
    const photographerAuthors = photographers.map((p) => p.author);
    const { data: portraitImages, error: imagesError } = await supabase
      .from("images_resize")
      .select(
        `
        id,
        author,
        filename,
        base_url,
        orientation,
        width,
        height,
        title,
        description,
        created_at
      `
      )
      .in("author", photographerAuthors)
      .ilike("filename", "000_aaa%");

    if (imagesError) {
      console.error(
        "[SSR fetchPhotographersBasic] Images fetch error",
        imagesError
      );
      // Continue without portrait images rather than failing completely
    }

    // Transform the data to match expected Photographer structure
    return photographers.map((photographer) => {
      // Find portrait image for this photographer
      const portraitImage = portraitImages?.find(
        (img) => img.author === photographer.author
      );

      return {
        ...photographer,
        images: portraitImage
          ? [
              {
                ...portraitImage,
                s3Progressive: getAllS3Urls(portraitImage),
              },
            ]
          : [],
      };
    }) as Photographer[];
  } catch (err) {
    console.error("[SSR fetchPhotographersBasic] Unexpected error", err);
    return null;
  }
}
