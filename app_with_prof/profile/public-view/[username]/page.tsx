import { supabase } from "@/lib/supabaseClient";
import PublicProfileHeader from "./PublicProfileHeader";
import PublicCollectionsList from "./PublicCollectionsList";
import ProfileJsonLd from "./ProfileJsonLd";
import { notFound } from "next/navigation";
import React from "react";

async function getUserProfile(username: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, name, username, avatar_url, bio")
    .eq("username", username)
    .single();
  if (error || !data) return null;
  return data;
}

async function getUserCollections(userId: string) {
  const { data, error } = await supabase
    .from("collections")
    .select("id, title, cover_image_url, description")
    .eq("user_id", userId)
    .eq("is_public", true);
  if (error) return [];
  return data;
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const profile = await getUserProfile(params.username);
  if (!profile) return notFound();

  const collections = await getUserCollections(profile.id);

  return (
    <main>
      <ProfileJsonLd profile={profile} collections={collections} />
      <PublicProfileHeader profile={profile} />
      <PublicCollectionsList collections={collections} />
    </main>
  );
}
