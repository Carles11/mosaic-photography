import { fetchPhotographersBasic } from "./fetchPhotographersBasic";
import { fetchPhotographersFeaturedImages } from "./fetchPhotographersFeaturedImages";
import { Photographer, ImageData } from "@/types/gallery";

/**
 * Fetch all photographers, each with only their featured image (if any),
 * for SSR gallery main page.
 * Now images include s3Progressive info.
 */
export async function fetchPhotographersWithFeaturedSSR(): Promise<
  Photographer[] | null
> {
  const photographers = await fetchPhotographersBasic();
  const featuredImages = await fetchPhotographersFeaturedImages();

  if (!photographers) return null;

  // Create a map from author to featured image
  const imageMap: Record<string, ImageData> = {};
  if (featuredImages) {
    for (const img of featuredImages) {
      if (!imageMap[img.author]) {
        imageMap[img.author] = img;
      }
    }
  }

  // Attach featured image to each photographer as images: [featuredImage]
  return photographers.map((photographer) => {
    const featured = imageMap[photographer.author];
    return {
      ...photographer,
      images: featured ? [featured] : [],
    };
  });
}
