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
    const { data, error } = await supabase
      .from("photographers")
      .select(
        `
        id,
        name,
        surname,
        author,
        biography,
        birthdate,
        deceasedate,
        origin,
        website,
        store,
        instagram,
        random_order,
        images_resize!left (
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
        )
      `
      )
      .order("random_order", { ascending: true })
      .ilike("images_resize.filename", "000_aaa%");

    if (error || !data) {
      console.error(
        "[SSR fetchPhotographersBasic] Supabase error or no data",
        error
      );
      return null;
    }

    // Transform the data to match expected Photographer structure
    return data.map((photographer) => {
      // Since we're filtering at DB level, images_resize contains only portrait images
      const portraitImage = photographer.images_resize?.[0]; // Take the first (and likely only) portrait image

      // Destructure to exclude images_resize from the final result
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { images_resize, ...photographerData } = photographer;

      return {
        ...photographerData,
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
