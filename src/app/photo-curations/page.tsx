import { Suspense } from "react";
import PhotoCurationsClient from "./PhotoCurationsClient";

export default function PhotoCurationsPage() {
  return (
    <Suspense fallback={<div>Loading..</div>}>
      <PhotoCurationsClient />
    </Suspense>
  );
}
