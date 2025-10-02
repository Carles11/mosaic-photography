import { fetchPhotographersBasic } from "./fetchPhotographersBasic";
import { Photographer } from "@/types/gallery";

/**
 * Fetch all photographers for SSR gallery main page.
 * Only basic photographer info is returned—no images.
 */
export async function fetchPhotographersWithFeaturedSSR(): Promise<
  Photographer[] | null
> {
  const photographers = await fetchPhotographersBasic();

  if (!photographers) return null;

  // Only return photographers, no images attached
  return photographers;
}
