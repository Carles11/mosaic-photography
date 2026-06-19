# Feature: Modal System

> Lazy-loaded, typed modal registry. All modals go through this system.

## Files

| File                                            | Role                                       |
| ----------------------------------------------- | ------------------------------------------ |
| `src/context/modalContext/modalRegistry.ts`     | Registry + types (ModalKey, ModalPropsMap) |
| `src/context/modalContext/ModalProvider.tsx`    | State machine (open/close/stack)           |
| `src/context/modalContext/useModal.ts`          | Hook for consumers                         |
| `src/components/modals/ModalProviderLoader.tsx` | Lazy-loads ModalProvider                   |
| `src/components/modals/ModalShell.tsx`          | Shell wrapper (backdrop, close button)     |
| `src/components/modals/mainModal.tsx`           | Main modal container                       |

---

## Available Modals

| Key                | Body component              | Props                                                  |
| ------------------ | --------------------------- | ------------------------------------------------------ |
| `comments`         | `CommentsModalBody`         | `{ imageId, onClose, onLoginRequired? }`               |
| `downloadOptions`  | `OptionsModalBody`          | `{ image, onClose, onDownloadOption, title? }`         |
| `photographer`     | `PhotographerModalBody`     | `{ photographer, onClose }`                            |
| `addToCollection`  | `AddToCollectionModalBody`  | `{ imageId, imageTitle, onClose, onAddToCollection? }` |
| `createCollection` | `CreateCollectionModalBody` | `{ onClose, onCreateCollection }`                      |
| `editCollection`   | `EditCollectionModalBody`   | `{ collection, onClose, onUpdateCollection }`          |
| `shareCollection`  | `ShareCollectionModal`      | `{ collection, onClose }`                              |
| `galleryFilters`   | `GalleryFiltersModalBody`   | `{ filters, onApply, onClose }`                        |

---

## Usage Pattern

```tsx
import { useModal } from "@/context/modalContext/useModal";

function MyComponent({ imageId }: { imageId: string }) {
  const { open, close } = useModal();

  const handleOpenComments = () => {
    open("comments", {
      imageId,
      onClose: close,
      onLoginRequired: () => open("login", {}), // example
    });
  };

  return <button onClick={handleOpenComments}>Comments</button>;
}
```

---

## Adding a New Modal

1. **Create the modal body:**

   ```
   src/components/modals/{name}/{Name}ModalBody.tsx
   ```

   Must be a default export React component.

2. **Add types to `modalRegistry.ts`:**

   ```typescript
   // Add to ModalKey union:
   export type ModalKey = "existingKey" | "myNewModal";

   // Add to ModalPropsMap:
   export type ModalPropsMap = {
     // ...existing...
     myNewModal: {
       someData: string;
       onClose: () => void;
     };
   };
   ```

3. **Register the loader:**

   ```typescript
   export const modalRegistry = {
     // ...existing...
     myNewModal: () => import("@/components/modals/myModal/MyModalBody"),
   };
   ```

4. TypeScript will now enforce correct props at call sites.

---

## Portal Requirements

`#modal-root` div must exist **before** `ModalProviderLoader` mounts.

In `ClientProviders.tsx`:

```tsx
<div id="modal-root" />         {/* ← must come first */}
<ModalProviderLoader>
  {children}
</ModalProviderLoader>
```

In `jest.setup.ts`, the test environment adds this div to `document.body`.

---

## Async Modal Pattern

For modals that return a value (e.g., user picks an option):

```tsx
const { openAsync } = useModal();

const result = await openAsync("downloadOptions", {
  image,
  onDownloadOption: (option) => {
    /* handle */
  },
  onClose: close,
});
```

---

## Key Invariants

- Never render modal bodies directly. Always go through `open()`.
- Modal bodies are lazy-loaded (dynamic imports). Don't import them eagerly.
- The `onClose` prop should always call the modal system's `close()` to clean up state.
- Tests mock the modal portal via `jest.setup.ts` which adds `#modal-root` to `document.body`.
