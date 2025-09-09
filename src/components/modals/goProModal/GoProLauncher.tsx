"use client";

import React from "react";
import { useModal } from "@/context/modalContext/useModal";

interface GoProLauncherProps {
  trigger?: React.ReactNode;
}

export default function GoProLauncher({ trigger }: GoProLauncherProps) {
  const { open } = useModal();

  const handleOpen = () => {
    open("goPro", {
      onClose: (): void => {},
    });
  };

  if (trigger) {
    return <div onClick={handleOpen}>{trigger}</div>;
  }

  return (
    <button type="button" onClick={handleOpen}>
      Go Pro
    </button>
  );
}
