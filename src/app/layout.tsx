import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Mosaic | Iconic Nude Photographers | Timeless Artistic Beauty",
  description:
    "Discover Mosaic's curated gallery of iconic nude photography, celebrating the beauty of the human form through the lens of the world's most renowned nude photographers.",
  // viewport: {
  //   width: "device-width",
  //   initialScale: 1,
  // },
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
