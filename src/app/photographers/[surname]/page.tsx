import { notFound } from "next/navigation";
import PhotographerGalleryZoom from "@/components/gallery/PhotographerGalleryZoom";
import { fetchPhotographerBySlugSSR } from "@/utils/fetchPhotographerByIdSSR";
import { PhotographerLinks } from "../client/PhotographerLinks";
import styles from "./Photographers.module.css";

export default async function PhotographerDetailPage(
  props: PageProps<"/photographers/[surname]">
) {
  const params = await props.params;
  if (!params?.surname) return notFound();

  // Fetch photographer by surname (not slug)
  const photographer = await fetchPhotographerBySlugSSR(params.surname);
  if (!photographer) return notFound();

  return (
    <div>
      <h1>
        {photographer.name} {photographer.surname}
      </h1>
      <main className={styles.photographerDetailPage}>
        <span className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Origin:</h3>
          <p>{photographer.origin}</p>
        </span>

        <span className={styles.subsectionHeader}>
          <h3 className={styles.sectionTitle}>Biography:</h3>
          <p>{photographer.biography}</p>
        </span>

        <PhotographerLinks
          stores={photographer.store}
          website={photographer.website}
        />
      </main>
      <h2>Gallery</h2>
      <PhotographerGalleryZoom images={photographer.images || []} />
    </div>
  );
}
