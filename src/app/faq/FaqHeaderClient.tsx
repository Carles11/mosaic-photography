"use client";
import dynamic from "next/dynamic";

const HeaderWithAuth = dynamic(
  () => import("@/components/header/HeaderWithAuth"),
  { ssr: false },
);

interface FaqHeaderClientProps {
  onGoProClick?: () => void;
}

export default function FaqHeaderClient({
  onGoProClick,
}: FaqHeaderClientProps) {
  return <HeaderWithAuth onGoProClick={onGoProClick} />;
}
