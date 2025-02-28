// filepath: /c:/Users/Usuario/Documents/AAA_REPOs/mosaic/src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header";
import { AppProvider } from "@/context/AppContext";
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
  title: "Mosaic photography Gallery",
  description: "Iconic nude photography from the Mosaic Gallery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppProvider>
          <Header />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
