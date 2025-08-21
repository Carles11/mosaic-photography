import { supabase } from "@/lib/supabaseClient";
import { Photographer } from "@/types";

let photographersCache: Photographer[] | null = null;

export async function preloadPhotographersData(): Promise<
  Photographer[] | null
> {
  if (photographersCache) {
    if (typeof window !== "undefined") {
      console.log("[Photographers Preload] Using cached photographers data.");
    }
    return photographersCache;
  }
  if (typeof window !== "undefined") {
    console.log(
      "[Photographers Preload] Fetching photographers data from Supabase...",
    );
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
        console.log("[Photographers Preload] Error or no data returned.");
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
      console.log(
        `[Photographers Preload] Preloading ${processedPhotographers.reduce((acc, p) => acc + (p.images?.length || 0), 0)} images for photographers.`,
      );
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
      console.log(
        "[Photographers Preload] Photographers data and images preloaded and cached.",
      );
    }
    return processedPhotographers;
  } catch (e) {
    if (typeof window !== "undefined") {
      console.log("Error preloading photographers data:", e);
    }
    return null;
  }
}

export function getPreloadedPhotographersData(): Photographer[] | null {
  return photographersCache;
}
