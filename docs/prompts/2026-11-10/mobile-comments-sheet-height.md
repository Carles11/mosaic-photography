# Mobile: comments sheet opens too small (follow-up to mobile-logged-out-image-actions.md)

Agent: openCode. Repo: `/mnt/c/mosaicapp` (branch `fix/logged-out-image-actions`). Do NOT commit or push.

## Problem (Carles, emulator, 2026-11-10)

After the previous fix (`BottomSheetComments.tsx`: `index={1}` → `index={0}`) the comments sheet opens
on every tap, but only a few lines high at the bottom; the user has to drag it up to see
"Log in to write…" / the input.

## Cause (checked by Claude)

`@gorhom/bottom-sheet` ^5.2.6 has `enableDynamicSizing` **on by default**. It adds a content-height snap
point, so the comments sheet's snap points become `[contentHeight, "95%"]`. `index={0}` now selects the
content height (tiny when there are no comments). The old `index={1}` meant 95 %.

## Do (exactly this, nothing more)

1. `src/4-shared/components/bottom-sheet/ui/BottomSheetModal.tsx`: add an optional prop
   `enableDynamicSizing?: boolean` and pass it through to `GorhomBottomSheetModal` **only when defined**
   (so the library default stays for every other sheet). Reason: other sheets use `index={0}` and may
   rely on content-height sizing.
2. `src/2-features/main-gallery/ui/BottomSheetComments.tsx`: pass `enableDynamicSizing={false}`, keep
   `snapPoints={["95%"]}` and `index={0}`. Update the comment above it to say why.

## Out of scope

No other sheet, no style or copy change, no UX redesign of the comment entry point.

## Line endings

The repo stores **LF**. Keep LF in both files (openCode under WSL wrote CRLF last time). Before
finishing, check with `grep -c $'\r' <file>` → must be 0 for both files.

## Report back

Diff of both files; the CR count check; anything you could not verify.
