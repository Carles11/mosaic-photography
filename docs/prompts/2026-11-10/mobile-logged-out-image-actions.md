# Mobile: logged-out taps on favorite / comment (Task 7)

Agent: openCode. Repo: `C:\mosaicapp` (Expo 54, branch `master`). Work only in this repo.
Do NOT commit or push. Carles commits.

## Bug (reported 2026-11-10, store app, logged out)

1. Heart (favorite): a tap does nothing. No toast, no login screen.
2. Comment icon: feedback appears only on the **first** tap; later taps show nothing.
Expected: every tap, on both icons, gives the same clear login feedback.

## What was already found (read-only check by Claude, 2026-11-10; verify, don't trust blindly)

- The only toast host is `<MosaicToast />` in `app/_layout.tsx` (react-native-toast-message 2.3).
- The lightbox `src/4-shared/components/image-zoom/ui/ZoomGalleryModal.tsx` is a React Native
  `<Modal>`. Toasts from the root host render **under** a native Modal, so they are invisible there.
- In the lightbox, `ZoomImage` (`ImageZoom.tsx`, `handleFavoritePress`) only calls
  `showErrorToast("Please log in to add favorites.")` and returns: no redirect. Inside the Modal
  that toast is invisible → "tap does nothing". This is the most likely cause of bug 1.
- Outside the lightbox, `src/3-entities/images/ui/ImageFooterRow.tsx` shows the toast AND
  `router.push("/auth/login")`. That one likely works; confirm.
- Comments: there is no login toast. Logged out, the comment tap opens
  `src/2-features/main-gallery/ui/BottomSheetComments.tsx`, which shows
  "Log in to write and manage your comments." The sheet is opened by a `useEffect` on
  `commentsImageId` in `src/1-pages/home/ui/Home.tsx` (~l. 278) and in
  `PhotographerDetailScreen.tsx`. Possible causes for "only the first tap":
  (a) `BottomSheetComments` passes `snapPoints={["95%"]}` with `index={1}` (index out of range
  for one snap point) to `ReusableBottomSheetModal` (`src/4-shared/components/bottom-sheet/ui/BottomSheetModal.tsx`);
  (b) `commentsImageId` not reset to null on some close path, so a second tap on the same image
  sets the same value and the effect doesn't fire; (c) from the lightbox, the modal closes and the
  80 ms `setTimeout` races the sheet. Find which one by reading the code paths; don't guess.

## Do

1. Lightbox favorite, logged out: same behaviour as `ImageFooterRow`: close the lightbox, show the
   toast, open `/auth/login`. Reuse the existing close-then-navigate pattern already used in
   `ZoomGalleryModal` for `onPressAuthor` / `onPressComments` (pass a callback down; don't add a
   new context or helper).
2. Make toasts visible while the lightbox is open: render `<MosaicToast />` inside
   `ZoomGalleryModal`'s `<Modal>` (the documented react-native-toast-message way for Modals).
   Reason: the download panel inside the lightbox also shows toasts (iOS WebP message, download
   result), which are invisible today for the same reason.
3. Comments, logged out: every tap must open the comments sheet (it already shows the login text).
   Fix the cause you find in (a)/(b)/(c) above with the smallest change. If (a) is wrong, set
   `index={0}`.
4. Check the same two buttons on the photographer detail screen, favorites list, collection
   detail and contributor detail (they all render `ZoomGalleryModal`), and fix the same way only
   if they share the code path.

## Out of scope

- No new toast library, no toast wrapper/abstraction, no new context.
- No change to logged-in behaviour, copy wording, styles, or the web repo.
- No refactor of the bottom-sheet component beyond the one prop fix.
- No version bump, no EAS build, no release.

## Report back (in your final message)

- Root cause for bug 1 and bug 2 (file + line).
- Diff summary per file.
- `yarn lint` result (and `npx tsc --noEmit` result).
- What you could not verify without a device, as a manual test list for Carles:
  logged out → heart in gallery, heart in lightbox, comment in gallery ×3 on the same image,
  comment in lightbox ×3; logged in → heart and comment still work.
