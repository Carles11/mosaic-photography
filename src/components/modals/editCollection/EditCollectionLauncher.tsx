import React, { useEffect, useRef } from "react";
import { useModal } from "@/context/modalContext/useModal";
import type { Collection } from "@/types";

interface EditCollectionLauncherProps {
  collection: Collection;
  onUpdateCollection: (collection: Collection) => void;
  children?: React.ReactNode;
}

const EditCollectionLauncher: React.FC<EditCollectionLauncherProps> = ({
  collection,
  onUpdateCollection,
}) => {
  const { open } = useModal();
  const openedRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    if (collection && openedRef.current !== collection.id) {
      open("editCollection", {
        collection,
        onClose: () => {},
        onUpdateCollection,
      });
      openedRef.current = collection.id;
    }
  }, [collection, onUpdateCollection, open]);

  return null;
};

export default EditCollectionLauncher;
