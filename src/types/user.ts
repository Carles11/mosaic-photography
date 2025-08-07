// User-related types
export interface UserProfile {
  id: string;
  name: string;
  instagram: string;
  website: string;
  own_store_name: string;
  own_store_url: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  image_id: string;
  created_at: string;
}
