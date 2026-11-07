# Follow-up for openCode: contributor og:image size (same uncommitted change)

File: `src/app/community/photography/[slug]/page.tsx`, `generateMetadata` (found branch) only.
Do not commit. Do not touch anything else.

## Problem

`imageUrl` is `featuredImage.s3Progressive?.[0]?.url`. `s3Progressive` (from
`getAllS3Urls` in `src/utils/imageResizingS3.ts`) is sorted small → large and ends with
`originalsWEBP`, so `[0]` is the **w400** rendition. But `openGraph.images` gets
`width`/`height` from `featuredImage.width/height`, which are the **original's** dimensions.
So the tag claims e.g. 4000×3000 for a 400 px file (wrong metadata), and 400 px is too small
for `summary_large_image` previews (Facebook/LinkedIn want ~1200 px).

## Fix (metadata only)

In `generateMetadata`, pick the OG rendition like this:

```ts
const renditions = (featuredImage?.s3Progressive ?? []).filter(
  (r) => !r.url.includes("/originalsWEBP/"),
);
const ogRendition =
  renditions.find((r) => r.width === 1200) ?? renditions[renditions.length - 1];
const ogImageUrl = ogRendition?.url ?? featuredImage?.url ?? "/images/og-image.jpg";
const ogWidth = ogRendition?.width;
const ogHeight =
  ogRendition && featuredImage?.width && featuredImage?.height
    ? Math.round((ogRendition.width * featuredImage.height) / featuredImage.width)
    : undefined;
```

- Use `ogImageUrl` in `openGraph.images[0].url` and `twitter.images`.
- Pass `width: ogWidth, height: ogHeight` only when both are defined; otherwise no width/height.
- If there is no `featuredImage`, keep `/images/og-image.jpg` with `width: 1200, height: 630`.
- Leave the page component's JSON-LD `image` (w400 there is fine) and the not-found branch as they are.

## Check

```bash
yarn lint && npx tsc --noEmit
curl -s http://localhost:3000/community/photography/elcarles78 | grep -o '<meta property="og:image[^>]*>'
```
Expect `og:image` pointing to `/w1200/` (or the largest `wNNN` the image has) and
`og:image:width` equal to that number. Report the output.
