import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchPhotographerBySlugSSR } from "@/utils/fetchPhotographerByIdSSR";
import { slugify } from "@/utils/slugify";

interface Props {
  params: { surname: string };
}

export default async function PhotographerDetailPage(props: Props) {
  const params = props.params;
  if (!params?.surname) return notFound();

  // Fetch photographer by surname (not slug)
  const photographer = await fetchPhotographerBySlugSSR(params.surname);
  if (!photographer) return notFound();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>
        {photographer.name} {photographer.surname}
      </h1>

      <p>
        <strong>Origin:</strong> {photographer.origin}
      </p>
      <p>
        <strong>Biography:</strong> {photographer.biography}
      </p>
      <h2>Gallery</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {photographer.images && photographer.images.length > 0 ? (
          photographer.images.map((img) => (
            <div
              key={img.id}
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1/1",
                minHeight: 0,
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                background: "#f8f8f8",
              }}
            >
              <Image
                src={img.url}
                alt={img.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 200px"
                priority={false}
              />
            </div>
          ))
        ) : (
          <p>No images found for this photographer.</p>
        )}
      </div>
    </main>
  );
}
