"use client";
import dynamic from "next/dynamic";

const HeaderWithAuth = dynamic(
  () => import("@/components/header/HeaderWithAuth"),
  { ssr: false },
);

export default function FaqHeaderClient() {
  return <HeaderWithAuth />;
}
