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
        <title>
          Mosaic | Iconic Nude Photographers | Timeless Artistic Beauty
        </title>
        <meta
          name="description"
          content="Discover Mosaic's curated gallery of iconic nude photography, celebrating the beauty of the human form through the lens of the world's most renowned nude photographers."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicons/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicons/site.webmanifest" />
      </Head>
      <main>
        <Gallery />
      </main>
    </div>
  );
}
