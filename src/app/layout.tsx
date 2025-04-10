import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { AppContextProvider } from "@/context/AppContext";
import { ThemeProvider } from "next-themes";
import GitHubCorner from "@/components/buttons/GitHubCorner";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mosaic | Nude iconic photography",
    template: "%s | Mosaic Photography",
  },
  description:
    "Discover Mosaic's curated gallery of iconic nude photography, celebrating the timeless beauty of the human form through the lens of legendary photographers.",
  keywords: [
    // Core Niche Keywords
    "public domain mosaic photography",
    "public domain nude photography",
    "fine art nude photography public domain",
    "vintage nude photography public domain",
    "classic nude photography public domain",
    "artistic nudes public domain",
    "timeless nude art public domain",
    "historical nude photography",
    "black and white nude photography",
    "daguerreotype nudes public domain",
    "wet plate nude portraits",
    "platinum print nudes",
    "vintage nude portraits public domain",
    "figure study photography public domain",
    "bodyscape art public domain",
    "nude portraiture public domain",
    "contrapposto pose photography",
    "sculptural lighting nude photography",

    // Historical and Iconic Figures
    "Edward Weston photography",
    "Alfred Stieglitz public domain nudes",
    "Baron Wilhelm Von Gloeden public domain",
    "Fred Holland Day photography public domain",
    "Eadweard Muybridge public domain nudes",
    "Robert Demachy photography public domain",

    // Vintage & Classic Photography
    "Victorian nude photography public domain",
    "Edwardian nude art public domain",
    "public domain vintage giclee nude print",
    "sepia-toned nude photos public domain",

    // Artistic & Intimate Themes
    "intimate nude photography public domain",
    "aesthetics of the human figure public domain",
    "bold vintage nudes public domain",
    "nude underwater portraits public domain",
    "sensual vintage art public domain",
    "museum-grade nude prints public domain",
    "gallery-quality public domain nudes",
    "timeless nude beauty public domain",

    // German Keywords for Public Domain Works
    "Aktfotografie public domain",
    "künstlerische Aktfotografie public domain",
    "klassische Aktfotografie public domain",
    "Vintage Aktfotografie public domain",
    "ästhetische Aktfotos public domain",
    "Aktfotografie Schwarzweiß public domain",
    "nackte Fotokunst public domain",
    "historische Aktfotografie public domain",
    "Platinprint Akt public domain",
    "Körperstudie Fotografie public domain",
    "nackte Poesie public domain",
    "zeitlose Aktfotografie public domain",
    "Galerie-Aktfotografie public domain",
    "intime Aktporträts public domain",
    "Aktbilder Sammlung public domain",
    "nackte Schönheit Kunst public domain",

    // Spanish Keywords for Public Domain Works
    "fotografía de mosaico dominio público",
    "fotografía artística de desnudos dominio público",
    "fotografía de desnudos clásico dominio público",
    "fotografía de desnudos vintage dominio público",
    "arte desnudo atemporal dominio público",
    "fotografía de desnudos en blanco y negro dominio público",
    "fotografía histórica de desnudos",
    "fotografía de desnudos daguerrotipos dominio público",
    "retratos de desnudos en placa húmeda",
    "fotografía de desnudos con impresión de platino",
    "retrato artístico desnudo dominio público",
    "fotografía de estudio de figura dominio público",
    "cuerpo desnudo arte dominio público",
    "fotografía de desnudo contrapposto",
    "iluminación escultórica desnudo fotografía",
    "fotografía de desnudos de Edward Weston",
    "fotografía de desnudos de Alfred Stieglitz dominio público",
    "fotografía de desnudos de Wilhelm Von Gloeden",
    "Fred Holland Day fotografía dominio público",
    "fotografía de desnudos de Eadweard Muybridge dominio público",
    "fotografía de desnudos de Robert Demachy",
    "fotografía de desnudos victoriana dominio público",
    "fotografía de desnudos eduardiana dominio público",
    "impresión giclee de desnudos vintage dominio público",
    "fotografía de desnudos sepia dominio público",
    "fotografía íntima de desnudos dominio público",
    "poesía en forma de desnudo dominio público",
    "estética de la figura humana dominio público",
    "desnudos vintage audaces dominio público",
    "retratos de desnudos subacuáticos dominio público",
    "arte sensual vintage dominio público",
    "colección de fotografía de desnudos dominio público",
    "impresión de desnudos de alta calidad dominio público",
    "desnudo artístico atemporal dominio público",
    "galería de fotografía de desnudos dominio público",
  ],
  icons: {
    icon: [
      { rel: "icon", url: "/favicons/favicon.ico" },
      {
        rel: "icon",
        url: "/favicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/favicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: "/favicons/apple-touch-icon.png",
  },
  manifest: "/favicons/site.webmanifest",
  openGraph: {
    title: "Nude photography | Mosaic Photography curated Gallery",
    description:
      "Meet the iconic photographers behind the stunning classic nude photography in our collection.",
    images: ["/favicons/favicon-32x32.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nude photography | Mosaic Photography curated Gallery",
    description:
      "Explore our stunning image gallery featuring classic nude photography by iconic photographers.",
    images: ["/favicons/favicon-32x32.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider defaultTheme="system">
          <AppContextProvider>
            <GitHubCorner url="https://github.com/Carles11/mosaic-photography" />
            <Header />
            {children}
            <Footer />
            <Analytics />
            <SpeedInsights />
          </AppContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
