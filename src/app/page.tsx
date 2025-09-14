import { Suspense } from "react";
import HomeClient from "./HomeClient";
import { fetchPhotographersWithFeaturedSSR } from "@/utils/fetchPhotographersWithFeaturedSSR";
import { fetchGalleryImagesSSR } from "@/utils/fetchGalleryImagesSSR";

export default async function HomePage() {
  const photographers = await fetchPhotographersWithFeaturedSSR();
  const images = await fetchGalleryImagesSSR();
  return (
    <Suspense fallback={<div>Loading.....</div>}>
      <HomeClient photographers={photographers || []} images={images || []} />
    </Suspense>
  );
}
