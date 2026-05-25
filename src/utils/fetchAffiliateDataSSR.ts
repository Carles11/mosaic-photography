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
  const { data, error } = await supabaseServerClient
    .from("affiliate_products")
    .select("*, affiliate_advertisers(*)");
  // .is("photographer_author", null);

  if (error) {
    console.error("Error fetching general affiliate resources:", error);
    throw error;
  }

  const shuffledData = shuffleArray(data);

  return shuffledData as AffiliateProductWithAdvertiser[];
}

export async function getAffiliateProductsByAuthor(
  author: string,
): Promise<AffiliateProductWithAdvertiser[]> {
  const { data, error } = await supabaseServerClient
    .from("affiliate_products")
    .select("*, affiliate_advertisers(*)")
    .eq("photographer_author", author);

  if (error) {
    console.error(
      `Error fetching affiliate products for author ${author}:`,
      error,
    );
    throw error;
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
    .single();

  if (error) {
    console.error(`Error fetching toolkit data for slug ${slug}:`, error);
    throw error;
  }

  return data;
}
