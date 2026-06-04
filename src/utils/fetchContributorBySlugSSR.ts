import { supabase } from "@/lib/supabaseClient";
import { Contributor } from "@/types/contributor";
import { UniversalGalleryImage } from "@/types/gallery";
import { getAllS3Urls } from "@/utils/imageResizingS3";

export type ContributorWithImages = Contributor & {
  images: UniversalGalleryImage[];
};

// Fetch all contributor slugs for static generation
export async function fetchAllContributorSlugsSSR(): Promise<string[]> {
  const { data, error } = await supabase
    .from("contributors")
    .select("slug")
    .not("slug", "is", null);

  if (error || !data) {
    console.error("[fetchAllContributorSlugsSSR] Error", error);
    return [];
  }

  return data.map((row: { slug: string }) => row.slug).filter(Boolean);
}

// Fetch contributor page data by slug
export async function fetchContributorBySlugSSR(
  slug: string,
): Promise<ContributorWithImages | null> {
  try {
    const { data: contributors, error: contributorError } = await supabase
      .from("contributors")
      .select("*")
      .eq("slug", slug)
      .limit(1);

    if (contributorError || !contributors || contributors.length === 0) {
      console.error(
        "[fetchContributorBySlugSSR] Contributor not found or error",
        contributorError,
      );
      return null;
    }

    const contributor = contributors[0];

    const { data: images, error: imagesError } = await supabase
      .from("contributor_images")
      .select("*")
      .eq("contributor_id", contributor.id)
      .eq("published", true)
      .order("sort_order", { ascending: true });

    let imagesWithProgressive: UniversalGalleryImage[] = [];

    if (images) {
      imagesWithProgressive = images.map((img) => ({
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
      }));
    }

    if (imagesError) {
      console.error(
        "[fetchContributorBySlugSSR] Images fetch error",
        imagesError,
      );

      return {
        ...(contributor as Contributor),
        images: [],
      };
    }

    return {
      ...(contributor as Contributor),
      images: imagesWithProgressive,
    };
  } catch (err) {
    console.error("[fetchContributorBySlugSSR] Unexpected error", err);
    return null;
  }
}
