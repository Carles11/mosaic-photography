import { Suspense } from "react";
import HomeClient from "./HomeClient";
import { fetchPhotographersSSR } from "@/utils/fetchPhotographersSSR";

export default async function HomePage() {
  const photographers = await fetchPhotographersSSR();
  return (
    <Suspense fallback={<div>Loading.....</div>}>
      <HomeClient photographers={photographers || []} />
    </Suspense>
  );
}
