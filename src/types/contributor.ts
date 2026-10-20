// Public contributor shape: matches CONTRIBUTOR_PUBLIC_COLUMNS (no contact/admin columns)
export type Contributor = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  description: string | null;
  nudity?: string | null;
  website: string | null;
  instagram: string | null;
  license_default: string | null;
  country: string | null;
  featuredImage?: ContributorImage | null;
};

export interface ContributorImage {
  id: string; // uuid

  contributor_id: string;
  author: string;
  image_id?: number;

  filename: string;
  base_url: string;
  s3Progressive?: Array<{
    url: string;
    width: number;
  }>;

  title?: string;
  description?: string;
  orientation?: "vertical" | "horizontal" | "square";

  year?: number;

  width?: number;
  height?: number;

  license?: string;
  license_url?: string;

  attribution?: string;
  source_url?: string;

  sort_order?: number;

  featured?: boolean;
  published?: boolean;

  source_identifier?: string;

  print_quality?: string;

  nudity?: boolean;

  created_at?: string;
  updated_at?: string;

  url?: string;
}
