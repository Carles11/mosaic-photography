import { supabase } from "@/lib/supabaseClient";
import { Contributor } from "@/types/contributor";

// Only what public pages read. Never add email, submission_notes or other contact/admin columns.
export const CONTRIBUTOR_PUBLIC_COLUMNS =
  "id, slug, name, bio, description, nudity, country, license_default, website, instagram";

// Columns the contributor cards and gallery read from contributor_images.
export const CONTRIBUTOR_IMAGE_COLUMNS =
  "id, image_id, contributor_id, filename, base_url, title, description, year, width, height, license, license_url, attribution, source_url, sort_order, featured, published, source_identifier, print_quality, nudity, created_at, updated_at";

/**
 * Fetch all contributors from the contributors table.
 * SSR/SSG friendly.
 */
export async function getContributors(): Promise<Contributor[] | null> {
  try {
    const { data, error } = await supabase
      .from("contributors")
      .select(CONTRIBUTOR_PUBLIC_COLUMNS)
      .order("name", { ascending: true });

    if (error || !data) {
      console.error("[getContributors] Fetch error", error);
      return null;
    }

    return data as Contributor[];
  } catch (err) {
    console.error("[getContributors] Unexpected error", err);
    return null;
  }
}

/**
 * Fetch a single contributor by slug.
 */
export async function getContributorBySlug(
  slug: string,
): Promise<Contributor | null> {
  try {
    const { data, error } = await supabase
      .from("contributors")
      .select(CONTRIBUTOR_PUBLIC_COLUMNS)
      .eq("slug", slug)
      .limit(1);

    if (error || !data || data.length === 0) {
      console.error(
        "[getContributorBySlug] Contributor not found or error",
        error,
      );
      return null;
    }

    return data[0] as Contributor;
  } catch (err) {
    console.error("[getContributorBySlug] Unexpected error", err);
    return null;
  }
}

/**
 * Fetch a single contributor by id.
 */
export async function getContributorById(
  id: string,
): Promise<Contributor | null> {
  try {
    const { data, error } = await supabase
      .from("contributors")
      .select(CONTRIBUTOR_PUBLIC_COLUMNS)
      .eq("id", id)
      .limit(1);

    if (error || !data || data.length === 0) {
      console.error(
        "[getContributorById] Contributor not found or error",
        error,
      );
      return null;
    }

    return data[0] as Contributor;
  } catch (err) {
    console.error("[getContributorById] Unexpected error", err);
    return null;
  }
}
