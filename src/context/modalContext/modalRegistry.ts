/*
  Strongly-typed modal registry
  - ModalKey: union of supported modal keys
  - ModalPropsMap: maps each key to the expected props for that modal body
  - modalRegistry: typed loader map so consumers can infer prop shapes

  Keep the runtime shape (dynamic imports) unchanged; these types only help
  TypeScript enforce correct `open`/`openAsync` usage.
*/

import React from "react";

export type ModalKey =
  | "addToCollection"
  | "goPro"
  | "comments"
  | "createCollection"
  | "editCollection"
  | "photographer";

export type ModalPropsMap = {
  addToCollection: {
    imageId: string;
    imageTitle: string;
    onClose: () => void;
    onAddToCollection?: (collectionId: string) => void;
  };
  goPro: {
    onClose?: (result?: unknown) => void;
  };
  comments: {
    imageId: string;
    onClose: () => void;
    onLoginRequired?: () => void;
  };
  createCollection: {
    onClose: () => void;
    onCreateCollection: (collection: import("@/types").Collection) => void;
  };
  editCollection: {
    collection: import("@/types").Collection;
    onClose: () => void;
    onUpdateCollection: (collection: import("@/types").Collection) => void;
  };
  photographer: {
    photographer: import("@/types").Photographer;
    onClose: () => void;
  };
};

export type ModalLoader<TProps> = () => Promise<{
  default: React.ComponentType<TProps>;
}>;

export const modalRegistry: {
  [K in ModalKey]: ModalLoader<ModalPropsMap[K]>;
} = {
  addToCollection: () =>
    import("@/components/modals/addToCollection/AddToCollectionModalBody"),
  goPro: () => import("@/components/modals/goProModal/GoProModalBody"),
  comments: () => import("@/components/modals/comments/CommentsModalBody"),
  createCollection: () =>
    import("@/components/modals/createCollection/CreateCollectionModalBody"),
  editCollection: () =>
    import("@/components/modals/editCollection/EditCollectionModalBody"),
  photographer: () =>
    import("@/components/modals/photographer/PhotographerModalBody"),
};
