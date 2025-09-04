"use client";

import React from "react";
import { useModal } from "@/context/modalContext/useModal";

interface LauncherProps {
  imageId: string;
  imageTitle: string;
  trigger?: React.ReactNode;
}

export default function AddToCollectionLauncher({
  imageId,
  imageTitle,
  trigger,
}: LauncherProps) {
  const { open } = useModal();

  const handleOpen = () => {
    open("addToCollection", {
      imageId,
      imageTitle,
      onClose: (): void => {},
    });
  };

  if (trigger) {
    return <div onClick={handleOpen}>{trigger}</div>;
  }

  return (
    <button type="button" onClick={handleOpen}>
      Add to collection
    </button>
  );
}
