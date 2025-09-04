"use client";

import dynamic from "next/dynamic";
import React from "react";

const ModalProvider = dynamic(
  () =>
    import("@/context/modalContext/ModalProvider").then(
      (mod) => mod.ModalProvider,
    ),
  {
    ssr: false,
  },
);

export default function ModalProviderLoader({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={null}>
      <ModalProvider>{children}</ModalProvider>
    </React.Suspense>
  );
}
