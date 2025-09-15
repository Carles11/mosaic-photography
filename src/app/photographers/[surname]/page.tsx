import { notFound } from "next/navigation";
import PhotographerGalleryZoom from "@/components/gallery/PhotographerGalleryZoom";
import { fetchPhotographerBySlugSSR } from "@/utils/fetchPhotographerByIdSSR";

export default async function PhotographerDetailPage(
  props: PageProps<"/photographers/[surname]">
) {
  const params = await props.params;
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
      <PhotographerGalleryZoom images={photographer.images || []} />
    </main>
  );
}
