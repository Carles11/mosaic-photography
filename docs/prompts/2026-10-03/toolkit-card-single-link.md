# Prompt for openCode — one sponsored link per toolkit card

Repo: Mosaic Photography (Next.js 15, React 19, TypeScript). Read `CLAUDE.md` first.
Do NOT run any git write commands (no add/commit/push). Carles commits.

## Why

Since the June 2026 Google spam update, sponsored-link density matters. The homepage
resources shelf renders each affiliate product with TWO anchors to the same affiliate
URL (the image and the "Shop Now" button): 30 sponsored anchors for 18 products.
Each product must have exactly ONE sponsored anchor.

## Change 1 — `src/components/cards/toolkit/toolkitCard.tsx`

1. Remove the `<a href={product.affiliate_url} ...>` that wraps the `<Image>` inside
   `.cardImageWrap`. Keep the `<Image>` itself exactly as it is (same props), just no
   longer inside a link.
2. Delete the now-unused `handleCardClick` function (it sent the GTM event
   `toolkitCardClicked`, which only the removed image link used).
3. Leave the "Shop Now" anchor (`rel="sponsored noopener noreferrer"`,
   `target="_blank"`, `handleShopNowClick`) and the internal
   "Why I recommend this →" link (`/toolkit/{slug}`) exactly as they are.
4. Do not touch the commented-out advertiser badge block.

## Change 2 — `src/components/cards/toolkit/toolkitCard.module.css`

The image is no longer clickable, so it must not show a pointer cursor:

- In `.card`, remove `cursor: pointer;`
- In `.cardImageWrap`, remove `cursor: pointer;`

Change nothing else in the CSS (keep the hover zoom and underline animation).

## Change 3 — `src/app/toolkit/[slug]/page.tsx`, `generateMetadata`

In the `keywords` array, delete the entry `` `${advertiser.name} affiliate` ``.
Keep every other entry. (Self-describing pages as "affiliate" is a thin-affiliate
signal; the disclosure badge already covers disclosure.)

Do NOT change anything else in this file (leave the JSON-LD block alone).

## Verify

Run, and paste the output summary back:

```bash
yarn lint
npx tsc --noEmit
grep -c 'affiliate_url' src/components/cards/toolkit/toolkitCard.tsx
```

Expected: lint and tsc clean; the grep prints `1`.

Then `yarn dev`, open http://localhost:3000, scroll to the resources slider and confirm:
each card's image is not a link, "Shop Now" opens the partner in a new tab, and
"Why I recommend this →" goes to `/toolkit/<slug>`.

Report the list of files changed. Nothing else.
