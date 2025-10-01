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

  // Fetch photographer by slug (not just surname)
  const photographer = await fetchPhotographerBySlugSSR(params.surname);
  if (!photographer) return notFound();

  // Ensure all images have a valid url property
  const imagesWithUrl = (photographer.images ?? []).map((img) => ({
    ...img,
    url: img.s3Progressive?.[0]?.url ?? "/favicons/android-chrome-512x512.png",
  }));

  return (
    <div>
      <h1 className={styles.photographerDetailPageTitle}>
        {photographer.name} {photographer.surname}
      </h1>
      <main className={styles.photographerDetailPage}>
        <span className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Origin:</h3>
          <p className={styles.sectionContent}>{photographer.origin}</p>
        </span>

        <span className={styles.subsectionHeader}>
          <h3 className={styles.sectionTitle}>Biography:</h3>
          <p className={styles.sectionContent}>{photographer.biography}</p>
        </span>

        <PhotographerLinks
          stores={photographer.store}
          website={photographer.website}
        />
      </main>
      <h2>
        Gallery{" "}
        <span
          className={styles.galleryCount}
        >{`(${imagesWithUrl.length})`}</span>
      </h2>
      <PhotographerGalleryZoom images={imagesWithUrl} />
    </div>
  );
}
