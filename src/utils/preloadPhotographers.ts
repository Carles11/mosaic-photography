import { supabase } from "@/lib/supabaseClient";
import { Photographer } from "@/types";

let photographersCache: Photographer[] | null = null;

export async function preloadPhotographersData(): Promise<
  Photographer[] | null
> {
  if (photographersCache) {
    if (typeof window !== "undefined") {
      // ...removed debug log...
    }
    return photographersCache;
  }
  if (typeof window !== "undefined") {
    // ...removed debug log...
  }
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
      if (typeof window !== "undefined") {
        // ...removed debug log...
      }
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
    if (typeof window !== "undefined") {
      // ...removed debug log...
    }
    // Preload all photographer images
    if (typeof window !== "undefined") {
      processedPhotographers.forEach((photographer) => {
        if (photographer.images) {
          photographer.images.forEach((img) => {
            const preloadImg = new window.Image();
            preloadImg.src = img.url;
          });
        }
      });
    }
    photographersCache = processedPhotographers;
    if (typeof window !== "undefined") {
      // ...removed debug log...
    }
    return processedPhotographers;
  } catch {
    if (typeof window !== "undefined") {
      // ...removed debug log...
    }
    return null;
  }
}

export function getPreloadedPhotographersData(): Photographer[] | null {
  return photographersCache;
}
