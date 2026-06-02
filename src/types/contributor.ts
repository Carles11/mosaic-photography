// Contributor type
export type Contributor = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  description: string | null;
  avatar_url: string | null;
  website: string | null;
  instagram: string | null;
  featured: boolean;
  license_default: string | null;
  country: string | null;
  source_type: string | null;
  created_at: string;
  updated_at: string;
};
