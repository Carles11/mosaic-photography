"use client";

import React from "react";
import { useModal } from "@/context/modalContext/useModal";
import CommentsButton from "@/components/buttons/CommentsButton";

interface CommentsLauncherProps {
  imageId: string;
  onLoginRequired?: () => void;
  className?: string;
}

export default function CommentsLauncher({
  imageId,
  onLoginRequired,
  className,
}: CommentsLauncherProps) {
  const { open } = useModal();

  const handleOpen = () => {
    open("comments", {
      imageId,
      onClose: () => {},
      onLoginRequired,
    });
  };

  return (
    <CommentsButton
      imageId={imageId}
      onOpenModal={handleOpen}
      className={className}
    />
  );
}
