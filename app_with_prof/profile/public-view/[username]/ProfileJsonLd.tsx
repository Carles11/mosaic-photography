import React from "react";

export default function ProfileJsonLd({
  profile,
  collections,
}: {
  profile: any;
  collections: any[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.username,
    description: profile.bio,
    image: profile.avatar_url,
    url: `https://yourdomain.com/profile/public-view/${profile.username}`,
    hasPart: collections.map((col) => ({
      "@type": "Collection",
      name: col.title,
      description: col.description,
      image: col.cover_image_url,
      url: `https://yourdomain.com/collections/${col.id}`,
    })),
  };
  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify(jsonLd)}
    </script>
  );
}
