import { supabase } from "@/lib/supabaseClient";
import { Contributor } from "@/types/contributor";

/**
 * Fetch all contributors from the contributors table.
 * SSR/SSG friendly.
 */
export async function getContributors(): Promise<Contributor[] | null> {
  try {
    const { data, error } = await supabase
      .from("contributors")
      .select(
        `
        id,
        slug,
        name,
        bio,
        description,
        email,
        submission_notes,
        default_license_url,
        avatar_url,
        website,
        instagram,
        featured,
        license_default,
        country,
        source_type,
        created_at,
        updated_at
      `,
      )
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
      .select(
        `
        id,
        slug,
        name,
        bio,
        description,
        avatar_url,
        website,
        instagram,
        featured,
        license_default,
        country,
        source_type,
        created_at,
        updated_at
      `,
      )
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
      .select(
        `
        id,
        slug,
        name,
        bio,
        description,
        avatar_url,
        website,
        instagram,
        featured,
        license_default,
        country,
        source_type,
        created_at,
        updated_at
      `,
      )
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
