import { Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { transformGalleryImages } from "@/utils/galleryDataTransform";
import Gallery from "@/components/gallery/Gallery";

export default async function Home() {
  // Fetch images from Supabase (SSR)
  const { data: images, error } = await supabase
    .from("images")
    .select(`id, url, author, title, description, created_at, orientation`);

  if (error || !images) {
    // Optionally handle error state
    return <div>Failed to load images.</div>;
  }

  // Use your utility to transform the images
  const galleryImages = transformGalleryImages(images);

  return (
    <main>
      <Suspense fallback={<div>Loading gallery...</div>}>
        <Gallery id="main-gallery" images={galleryImages} />
      </Suspense>
    </main>
  );
}
