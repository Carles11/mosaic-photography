import { Suspense } from "react";
import HomeClient from "./HomeClient";
import { fetchPhotographersSSR } from "@/utils/fetchPhotographersSSR";
import { fetchGalleryImagesSSR } from "@/utils/fetchGalleryImagesSSR";

export default async function HomePage() {
  const photographers = await fetchPhotographersSSR();
  const images = await fetchGalleryImagesSSR();
  return (
    <Suspense fallback={<div>Loading.....</div>}>
      <HomeClient photographers={photographers || []} images={images || []} />
    </Suspense>
  );
}
