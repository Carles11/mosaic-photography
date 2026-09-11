import { shuffleArray } from "@/helpers/shuffle";
import { supabaseServerClient } from "@/lib/supabaseServerClient";
import type { AffiliateProduct, AffiliateAdvertiser } from "@/types/supabase";

// Supabase nests the joined table data under the table name
export interface AffiliateProductWithAdvertiser extends AffiliateProduct {
  affiliate_advertisers: AffiliateAdvertiser | null;
}

export async function getGeneralAffiliateResources(): Promise<
  AffiliateProductWithAdvertiser[]
> {
  // `!inner` turns the join into a filter: products of hidden advertisers
  // (is_active = false) are dropped, as are hidden products.
  const { data, error } = await supabaseServerClient
    .from("affiliate_products")
    .select("*, affiliate_advertisers!inner(*)")
    .eq("is_active", true)
    .eq("affiliate_advertisers.is_active", true);
  // .is("photographer_author", null);

  if (error) {
    console.error("Error fetching general affiliate resources:", error);
    return [];
  }

  const shuffledData = shuffleArray(data ?? []);

  return shuffledData as AffiliateProductWithAdvertiser[];
}

export async function getAffiliateProductsByAuthor(
  author: string,
): Promise<AffiliateProductWithAdvertiser[]> {
  const { data, error } = await supabaseServerClient
    .from("affiliate_products")
    .select("*, affiliate_advertisers!inner(*)")
    .eq("photographer_author", author)
    .eq("is_active", true)
    .eq("affiliate_advertisers.is_active", true);

  if (error) {
    console.error(
      `Error fetching affiliate products for author ${author}:`,
      error,
    );
    return [];
  }

  return data as AffiliateProductWithAdvertiser[];
}

export async function getToolkitDataBySlug(slug: string) {
  const { data, error } = await supabaseServerClient
    .from("affiliate_advertisers")
    .select(
      `
      *,
      products:affiliate_products(*)
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("products.is_active", true)
    .single();

  if (error) {
    console.error(`Error fetching toolkit data for slug ${slug}:`, error);
    return null;
  }

  return data;
}
