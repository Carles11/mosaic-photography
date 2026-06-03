import { ImageData } from "./gallery";

// Contributor type
export type Contributor = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  description: string | null;
  email: string | null;
  submission_notes: string | null;
  default_license_url: string | null;
  avatar_url: string | null;
  website: string | null;
  instagram: string | null;
  featured: boolean;
  license_default: string | null;
  country: string | null;
  source_type: string | null;
  created_at: string;
  updated_at: string;
  featuredImage?: ContributorImage | null;
};

export interface ContributorImage {
  id: string; // uuid

  contributor_id: string;

  image_id?: number;

  filename: string;
  base_url: string;
  s3Progressive?: Array<{
    url: string;
    width: number;
  }>;

  title?: string;
  description?: string;

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
