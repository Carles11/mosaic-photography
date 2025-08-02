import { supabase } from "@/lib/supabaseClient";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("name, username, bio, avatar_url")
    .eq("username", params.username)
    .single();

  if (!profile) return {};

  return {
    title: `${profile.name} (@${profile.username}) - Public Profile`,
    description:
      profile.bio || `${profile.name}'s public profile and collections.`,
    openGraph: {
      title: `${profile.name} (@${profile.username})`,
      description: profile.bio || "",
      images: profile.avatar_url ? [profile.avatar_url] : [],
      url: `https://yourdomain.com/profile/public-view/${profile.username}`,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${profile.name} (@${profile.username})`,
      description: profile.bio || "",
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}
