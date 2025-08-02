export interface User {
  id: string;
  username: string;
  displayName?: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  portfolioCount?: number;
  followersCount?: number;
  followingCount?: number;
  contactEmail?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
}
