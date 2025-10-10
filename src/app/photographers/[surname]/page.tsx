import { notFound } from "next/navigation";
import PhotographerGalleryZoom from "@/components/gallery/PhotographerGalleryZoom";
import { fetchPhotographerBySlugSSR } from "@/utils/fetchPhotographerByIdSSR";
import { PhotographerLinks } from "../client/PhotographerLinks";
import Timeline from "@/components/timeline/Timeline";
import { getTimelineBySlug } from "@/lib/timeline/photographersTimelines";
import { TimelineItemModelProps } from "@/types/components";
import { formatLifespan } from "@/helpers/dates";

import styles from "./Photographers.module.css";

export default async function PhotographerDetailPage(
  props: PageProps<"/photographers/[surname]">
) {
  const params = await props.params;
  if (!params?.surname) return notFound();

  // Remove any "-" from the surname before searching
  const cleanSurname = params.surname.replace(/-/g, "");

  const photographerTimeline = getTimelineBySlug(cleanSurname);
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
      <p>
        {formatLifespan(
          photographer.birthdate ?? "",
          photographer.deceasedate ?? ""
        )}
      </p>
      <main className={styles.photographerDetailPage}>
        <h2 className={styles.timelineTitle}>A Life in Focus</h2>
        <p className={styles.sectionContent}>
          Personal & Historical Milestones in {photographer.name}{" "}
          {photographer.surname}&apos;s life time.
        </p>
        <div className={styles.timelineContainer}>
          <Timeline events={photographerTimeline as TimelineItemModelProps[]} />
        </div>
        <h2 className={styles.timelineTitle}>About the Photographer</h2>
        <span className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Born in: </h3>
          <p className={styles.sectionContent}>{photographer.origin}</p>
        </span>

        <span className={styles.subsectionHeader}>
          <h3 className={styles.sectionTitle}>Biography:</h3>
          <p className={styles.sectionBioContent}>{photographer.biography}</p>
        </span>

        <PhotographerLinks
          stores={photographer.store}
          website={photographer.website}
        />
      </main>

      <h2 className={styles.timelineTitle}>
        Gallery{" "}
        <span
          className={styles.galleryCount}
        >{`(${imagesWithUrl.length})`}</span>
      </h2>
      <PhotographerGalleryZoom images={imagesWithUrl} />
    </div>
  );
}
