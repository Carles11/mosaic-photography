import { supabaseServerClient } from "@/lib/supabaseServerClient";
import { Contributor } from "@/types/contributor";
import { ImageData } from "@/types/gallery";
import { getAllS3Urls } from "@/utils/imageResizingS3";

export type ContributorWithFeatured = Contributor & {
  featuredImage: ImageData | null;
};

/**
 * Fetch all contributors with their first published image.
 * Used on the homepage contributors slider.
 */
export async function fetchContributorsWithFeaturedSSR(): Promise<
  ContributorWithFeatured[]
> {
  try {
    const { data: contributors, error } = await supabaseServerClient
      .from("contributors")
      .select("*")
      .order("name", { ascending: true });

    if (error || !contributors) {
      console.error(
        "[fetchContributorsWithFeaturedSSR] Contributors fetch error",
        error,
      );
      return [];
    }

    // Fetch the first published image for each contributor in parallel
    const withFeatured: ContributorWithFeatured[] = await Promise.all(
      contributors.map(async (contributor) => {
        const { data: images, error: imgError } = await supabaseServerClient
          .from("contributor_images")
          .select("*")
          .eq("contributor_id", contributor.id)
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .limit(1);

        if (imgError || !images || images.length === 0) {
          return { ...(contributor as Contributor), featuredImage: null };
        }

        const img = images[0];
        const featuredImage: ImageData = {
          ...img,
          id: img.image_id,
          author: contributor.name,
          orientation:
            img.width && img.height
              ? img.width > img.height
                ? "horizontal"
                : img.height > img.width
                  ? "vertical"
                  : "square"
              : undefined,
          s3Progressive: getAllS3Urls(img),
        };

        return { ...(contributor as Contributor), featuredImage };
      }),
    );

    return withFeatured;
  } catch (err) {
    console.error("[fetchContributorsWithFeaturedSSR] Unexpected error", err);
    return [];
  }
}
