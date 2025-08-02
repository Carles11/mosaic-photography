import Image from "next/image";
import React from "react";

export default function PublicCollectionsList({
  collections,
}: {
  collections: any[];
}) {
  return (
    <section>
      <h2>Public Collections</h2>
      {collections.length === 0 && <p>No public collections yet.</p>}
      <ul>
        {collections.map((col) => (
          <li key={col.id}>
            {col.cover_image_url && (
              <Image
                src={col.cover_image_url}
                alt={col.title}
                width={80}
                height={80}
                style={{ borderRadius: 8 }}
              />
            )}
            <div>
              <a href={`/collections/${col.id}`}>
                <strong>{col.title}</strong>
              </a>
              {col.description && <p>{col.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
