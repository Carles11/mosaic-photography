import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { AppContextProvider } from "@/context/AppContext";
import { ThemeProvider } from "next-themes";
import GitHubCorner from "@/components/buttons/GitHubCorner";

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
  title: "Mosaic | Iconic Nude Photography Gallery | Timeless Artistic Beauty",
  description:
    "Discover Mosaic's curated gallery of iconic nude photography, celebrating the beauty of the human form through the lens of the world's most renowned nude photographers.",
  keywords: [
    "nude photography",
    "artistic nudes",
    "art nudes",
    "nude pictures",
    "nude photos",
    "classic nudes",
    "playboy magazine nude",
    "nude photo",
    "nude pics",
    "artistic nude",
    "nude art photography",
    "artistic nude photography",
    "nude fine art photography",
    "art nude photographs",
    "art photoshoot",
    "artistic body photography",
    "classic photography",
    "nude model",
    "modelsociety",
    "Helmut Newton",
    "Mikhail Potapov",
    "Horst Kistner",
    "Robert Mapplethorpe",
    "Sam Haskins",
    "Slim Aarons",
    "Rusland Bolgov",
    "Larry Woodman",
    "Junior Luz",
    "Ruth Bernhard",
    "Radoslav Pujan",
    "Taras Kuscynskyi",
    "Man Ray",
    "David Dubnitskiy",
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
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
