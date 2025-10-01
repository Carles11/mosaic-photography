import { supabase } from "@/lib/supabaseClient";
import { ImageData } from "@/types/gallery";
import { getAllS3Urls } from "@/utils/imageResizingS3";

/**
 * Fetches all "featured" images (where url filename starts with 000_aaa)
 * for all photographers.
 * Now includes S3 progressive image info.
 */
export async function fetchPhotographersFeaturedImages(): Promise<
  ImageData[] | null
> {
  try {
    const { data, error } = await supabase
      .from("images_resize")
      .select(
        `
        id,
        author,
        title,
        description,
        created_at,
        orientation,
        width,
        height,
        filename,
        base_url
      `
      )
      .ilike("filename", "000_aaa%")
      .order("author", { ascending: true });

    if (error || !data) {
      console.error(
        "[SSR fetchPhotographersFeaturedImages] Supabase error or no data",
        error
      );
      return null;
    }

    // Add s3Progressive array to each image
    const imagesWithProgressive: ImageData[] = data.map((img: ImageData) => ({
      ...img,
      s3Progressive: getAllS3Urls(img),
    }));

    return imagesWithProgressive;
  } catch (err) {
    console.error(
      "[SSR fetchPhotographersFeaturedImages] Unexpected error",
      err
    );
    return null;
  }
}
