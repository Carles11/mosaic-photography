import { Suspense } from "react";
import MyContentClient from "./MyContentClient";

export default function ContentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyContentClient />
    </Suspense>
  );
}
