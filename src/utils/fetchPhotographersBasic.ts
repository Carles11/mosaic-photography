import { supabase } from "@/lib/supabaseClient";
import { Photographer } from "@/types/gallery";

/**
 * Fetch photographers with basic info only (no images).
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
        random_order
      `
      )
      .order("random_order", { ascending: true });

    if (error || !data) {
      console.error(
        "[SSR fetchPhotographersBasic] Supabase error or no data",
        error
      );
      return null;
    }
    return data as Photographer[];
  } catch (err) {
    console.error("[SSR fetchPhotographersBasic] Unexpected error", err);
    return null;
  }
}
