/* eslint-disable @typescript-eslint/no-explicit-any */
// Registry mapping modal keys to dynamic import functions.
// Add entries here for each modal body you want to lazy-load.

import React from "react";

export type ModalLoader<T = any> = () => Promise<{
  default: React.ComponentType<T>;
}>;

export const modalRegistry: Record<string, ModalLoader> = {
  addToCollection: () =>
    import("@/components/modals/addToCollection/AddToCollectionModalBody"),
  goPro: () => import("@/components/modals/goProModal/GoProModalBody"),
};
