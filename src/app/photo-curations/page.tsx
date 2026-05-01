import { Suspense } from "react";
import type { Metadata } from "next";
import PhotoCurationsClient from "./PhotoCurationsClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PhotoCurationsPage() {
  return (
    <Suspense fallback={<div>Loading..</div>}>
      <PhotoCurationsClient />
    </Suspense>
  );
}
