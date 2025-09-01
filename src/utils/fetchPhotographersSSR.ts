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
      const featuredIndex = photographer.images.findIndex((img) => {
        const fileName = img.url.split("/").pop()?.toLowerCase();
        return fileName?.startsWith("000_aaa");
      });
      if (featuredIndex > -1) {
        const [featured] = photographer.images.splice(featuredIndex, 1);
        photographer.images.unshift(featured);
      }
      return photographer;
    });
    return processedPhotographers;
  } catch {
    return null;
  }
}
