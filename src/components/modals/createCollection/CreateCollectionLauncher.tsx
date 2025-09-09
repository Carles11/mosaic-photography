import React from "react";
import { useModal } from "@/context/modalContext/useModal";
import type { Collection } from "@/types";

interface CreateCollectionLauncherProps {
  onCreateCollection: (collection: Collection) => void;
  children: React.ReactNode;
}

const CreateCollectionLauncher: React.FC<CreateCollectionLauncherProps> = ({
  onCreateCollection,
  children,
}) => {
  const { open } = useModal();

  const handleOpen = () => {
    open("createCollection", {
      onClose: () => {},
      onCreateCollection,
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

export default CreateCollectionLauncher;
