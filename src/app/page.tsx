// filepath: /C:/Users/Usuario/Documents/AAA_REPOs/mosaic/pages/index.tsx
"use client";

import Head from "next/head";
import Gallery from "@/components/gallery/Gallery";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const { isMosaic } = useAppContext();

  console.log({ isMosaic });

  return (
    <div>
      <Head>
        <title>Mosaic Photography Gallery</title>
        <meta name="description" content="A beautiful image gallery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Gallery />
      </main>
    </div>
  );
}
