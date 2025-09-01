import { supabase } from "@/lib/supabaseClient";
import { Photographer } from "@/types/gallery";

export async function fetchPhotographersSSR(): Promise<Photographer[] | null> {
  try {
    const { data: photographers, error } = await supabase
      .from("photographers")
      .select(
        `
        name, surname, author, biography, birthdate, deceasedate, origin, website, store, instagram,
  images (id, url, author, title, description, created_at)
      `,
      )
      .order("random_order", { ascending: true })
      .order("created_at", { ascending: true, foreignTable: "images" });
    if (error || !photographers) {
      console.error(
        "[SSR fetchPhotographersSSR] Supabase error or no data",
        error,
      );
      return null;
    }
    const processedPhotographers = (photographers || []).map((photographer) => {
      if (!photographer.images) return photographer;
      // Ensure all images have orientation
      const imagesWithOrientation = (photographer.images as any[]).map(
        (img) => ({
          ...img,
          orientation:
            "orientation" in img && img.orientation
              ? img.orientation
              : "portrait",
        }),
      );
      return {
        ...photographer,
        images: imagesWithOrientation,
      };
    });
    // Move featured image logic if needed after this mapping
    processedPhotographers.forEach((photographer) => {
      if (!photographer.images) return;
      const featuredIndex = photographer.images.findIndex((img) => {
        const fileName = img.url.split("/").pop()?.toLowerCase();
        return fileName?.startsWith("000_aaa");
      });
      if (featuredIndex > -1) {
        const [featured] = photographer.images.splice(featuredIndex, 1);
        photographer.images.unshift(featured);
      }
    });
    return processedPhotographers;
  } catch {
    return null;
  }
}
