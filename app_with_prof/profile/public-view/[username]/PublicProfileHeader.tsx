import Image from "next/image";
import React from "react";

export default function PublicProfileHeader({ profile }: { profile: any }) {
  return (
    <section>
      {profile.avatar_url && (
        <Image
          src={profile.avatar_url}
          alt={`${profile.name}'s avatar`}
          width={120}
          height={120}
          style={{ borderRadius: "50%" }}
        />
      )}
      <h1>{profile.name}</h1>
      <p>@{profile.username}</p>
      {profile.bio && <p>{profile.bio}</p>}
    </section>
  );
}
