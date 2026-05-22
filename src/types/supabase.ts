// Types for Supabase tables: affiliate_advertisers and affiliate_products

export interface AffiliateAdvertiser {
  id: string; // uuid
  name: string;
  slug: string;
  platform: string; // e.g., 'Awin', 'Amazon'
  logo_url?: string | null;
  description?: string | null;
  website_url?: string | null;
  created_at?: string;
}

export interface AffiliateProduct {
  id: string; // uuid
  advertiser_id: string; // uuid, references affiliate_advertisers.id
  type: string; // e.g., 'book', 'print', 'tool'
  title: Record<string, string>; // jsonb for localization, e.g., { en: "Product name" }
  description: Record<string, string>; // jsonb for localization
  affiliate_url: string;
  image_url?: string | null;
  photographer_author?: string | null; // references photographers.author
  created_at?: string;
}
