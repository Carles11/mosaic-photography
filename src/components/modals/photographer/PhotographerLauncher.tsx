import React from "react";
import { useModal } from "@/context/modalContext/useModal";
import type { Photographer } from "@/types";

interface PhotographerLauncherProps {
  photographer: Photographer;
  children: React.ReactNode;
}

const PhotographerLauncher: React.FC<PhotographerLauncherProps> = ({
  photographer,
  children,
}) => {
  const { open } = useModal();

  const handleOpen = () => {
    open("photographer", {
      photographer,
      onClose: () => {},
    });
  };

  return (
    <span
      onClick={handleOpen}
      style={{ display: "inline-block", cursor: "pointer" }}
    >
      {children}
    </span>
  );
};

export default PhotographerLauncher;
