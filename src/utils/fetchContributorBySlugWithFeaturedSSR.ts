// src/utils/fetchContributorBySlugWithFeaturedSSR.ts

import { supabaseServerClient } from "@/lib/supabaseServerClient";
import { Contributor, ContributorImage } from "@/types/contributor";
import { getAllS3Urls } from "@/utils/imageResizingS3";

export type ContributorWithFeatured = Contributor & {
  images: ContributorImage[];
  featuredImage: ContributorImage | null;
};

export async function fetchContributorBySlugWithFeaturedSSR(
  slug: string,
): Promise<ContributorWithFeatured | null> {
  try {
    const { data: contributor, error } = await supabaseServerClient
      .from("contributors")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !contributor) {
      console.error(
        "[fetchContributorBySlugWithFeaturedSSR] Contributor fetch error",
        error,
      );
      return null;
    }

    const { data: images, error: imagesError } = await supabaseServerClient
      .from("contributor_images")
      .select("*")
      .eq("contributor_id", contributor.id)
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (imagesError) {
      console.error(
        "[fetchContributorBySlugWithFeaturedSSR] Images fetch error",
        imagesError,
      );

      return {
        ...(contributor as Contributor),
        images: [],
        featuredImage: null,
      };
    }

    const mappedImages: ContributorImage[] = (images ?? []).map((img) => ({
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

    const featuredImage =
      mappedImages.find((img) => img.featured) ?? mappedImages[0] ?? null;

    return {
      ...(contributor as Contributor),
      images: mappedImages,
      featuredImage,
    };
  } catch (err) {
    console.error(
      "[fetchContributorBySlugWithFeaturedSSR] Unexpected error",
      err,
    );

    return null;
  }
}
