"use client";
import HeaderWithAuth from "@/components/header/HeaderWithAuth";
import Footer from "@/components/footer/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderWithAuth />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </>
  );
}
