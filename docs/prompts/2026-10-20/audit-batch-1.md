# Prompt for openCode — audit batch 1 (canonical, private data, security, nudity filter)

Repo: Mosaic Photography (Next.js 15 App Router, React 19, TypeScript). Read `CLAUDE.md` first
and follow its 10 rules. Do NOT run any git write commands (no add/commit/push/rm --cached).
Carles commits. Do only the six changes below; do not refactor anything else.

Source: an external code audit on 2026-10-20, verified on the live site the same day.

## Change 1 — canonical URLs (SEO, highest priority)

Live today, `/photographers/weston`, `/photographers/brady` and `/legal/credits` all output
`<link rel="canonical" href="https://www.mosaic.photography"/>`, i.e. they declare the HOMEPAGE
as their canonical. Cause:

1. `src/app/photographers/[surname]/page.tsx` (~line 90), in `generateMetadata`: the key is
   `alternatives:` (typo). Next.js ignores unknown keys, so the page inherits the root
   layout's `alternates.canonical`. Rename it to `alternates:`. Keep `canonicalUrl` as it is,
   but confirm it is built from the photographer's DB `slug` (ASCII, e.g.
   `https://www.mosaic.photography/photographers/de-la-vaudere`), not from `surname`.
2. `src/app/layout.tsx` (~line 27) sets `alternates.canonical: "https://www.mosaic.photography/"`
   for the whole site, so EVERY page without its own canonical inherits the homepage.
   - Remove the `canonical` from the root layout's `alternates` (keep `metadataBase` if present;
     add `metadataBase: new URL("https://www.mosaic.photography")` if it is missing).
   - Set the homepage canonical in `src/app/page.tsx` `metadata`:
     `alternates: { canonical: "/" }`.
   - Then list every `page.tsx` under `src/app/` that is public (not `auth/`, not `profile/`,
     not `api/`) and has no own `alternates.canonical`. Add one with its own path
     (relative paths like `"/legal/credits"` resolve against `metadataBase`). Include at least
     `legal/credits`, `legal/privacy-policy`, `legal/terms-of-service`. For dynamic routes,
     add it in `generateMetadata` from the slug.
3. Grep the whole `src/` for any other `alternatives:` key and fix it the same way.

## Change 2 — contributor emails are public (personal data)

The live homepage HTML contains contributors' `email` and `submission_notes`, because the
contributor fetchers use `.select("*")`.

1. In `src/utils/fetchContributorsWithFeaturedSSR.ts`,
   `src/utils/fetchContributorBySlugSSR.ts`,
   `src/utils/fetchContributorBySlugWithFeaturedSSR.ts` and `src/utils/fetchContributorsSSR.ts`:
   replace every `.select("*")` **on the `contributors` table** with an explicit column list.
   Build the list by grepping which `contributor.<field>` the components and pages read
   (`src/components/**`, `src/app/community/**`, the JSON-LD on contributor pages). Known
   readers today: `id, slug, name, bio, description, nudity, country, license_default`, plus
   whatever avatar/website/instagram/featured columns are read. **Never include `email`,
   `submission_notes`, or any other contact/admin column.**
2. If those files also `.select("*")` on the images table for contributors, list the columns
   explicitly too (only what the cards/gallery read).
3. Update the TypeScript types so `email`/`submission_notes` are not on the type the client
   receives (no `as` casts to hide errors).
4. Add these lines to `.gitignore` (Carles will untrack the files himself):
   ```
   # saved page snapshots can contain personal data
   seo-reports/**/url-inspections/*.html
   docs/seo-reports/**/*.html
   ```

## Change 3 — `/api/download-image` is an open proxy

`src/app/api/download-image/route.ts` only checks `url.startsWith("https://cdn.mosaic.photography")`,
so `https://cdn.mosaic.photography.evil.com/x` passes, and `fetch` follows redirects.

Rewrite the check:
```ts
let target: URL;
try { target = new URL(url); } catch { return 400 }
if (target.protocol !== "https:" || target.hostname !== "cdn.mosaic.photography") return 400
```
Then `fetch(target, { redirect: "error" })` inside `try/catch` (return 502 on throw).
Sanitize `filename` for the `Content-Disposition` header (keep `encodeURIComponent`, and
strip `"` `\r` `\n`). Keep the response headers as they are otherwise.
Add a Jest test next to the existing ones (`src/utils/__tests__/` style, or
`src/app/api/download-image/__tests__/route.test.ts`) covering: valid CDN URL accepted (mock
`fetch`), `cdn.mosaic.photography.evil.com` rejected, `http://` rejected, garbage string rejected.
The only caller is `src/utils/handleDownloadOptionClick.ts` — make sure it still works.

## Change 4 — service worker caches private Supabase responses

In `pwa.config.js`, delete the whole `runtimeCaching` entry whose `urlPattern` is
`/^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i` (cacheName `"supabase-api"`). Change nothing else
in the PWA config.

## Change 5 — JSON-LD must escape `<`

`JSON.stringify` does not escape `<`, so text from the database containing `</script>` would
break out of the `<script type="application/ld+json">` tag.

1. Create `src/helpers/jsonLd.ts` exporting
   `export function serializeJsonLd(data: unknown): string { return JSON.stringify(data).replace(/</g, "\\u003c"); }`
   (also replace `>` with `\\u003e` and `&` with `\\u0026`; JSON parsers read these the same).
2. Use it in EVERY `dangerouslySetInnerHTML` that writes JSON-LD: at least
   `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/photographers/[surname]/page.tsx`,
   `src/components/seo/JsonLdSchema.tsx`, `src/components/wrappers/FaqClientWrapper.tsx`
   (grep `dangerouslySetInnerHTML` to be sure; ignore `*.bak` files).
3. Add a tiny Jest test: `serializeJsonLd({a:"</script><script>x"})` contains no `<`, and
   `JSON.parse` of the result gives back the original object.

## Change 6 — Nude/Safe filter on photographer pages

`src/components/gallery/PhotographerGalleryZoom.tsx` (~lines 64 and 91) decides nudity with
`img.nudity === true || String(img.nudity).toLowerCase() === "true"`, but `images_resize.nudity`
holds `"nude"` / `"not-nude"`. Result: "Nude (0)" and nude images under "Safe".

Add one helper (e.g. in `src/helpers/nudity.ts`):
```ts
export const isNudeValue = (n: unknown) =>
  n === true || ["true", "nude"].includes(String(n).toLowerCase().trim());
```
Use it in both places. Grep `src/` for other `nudity === true` / `"true"` checks and list them in
your answer (fix only if they read `images_resize.nudity` the same way). Do NOT change the
gallery default (`nudity: "nude"`, CLAUDE.md rule 3) or filter persistence (rule 10).

## Checks before you finish

- `yarn lint`, `npx tsc --noEmit`, `yarn test` all clean.
- `yarn dev`, then:
  ```bash
  for p in / /photographers/weston /photographers/de-la-vaudere /legal/credits /legal/privacy-policy /about /toolkit/taschen /community/photography/elcarles78; do
    printf "%s  " "$p"; curl -s "http://localhost:3000$p" | grep -o '<link rel="canonical"[^>]*>'; echo; done
  curl -s http://localhost:3000/ | grep -c '@gmail'          # must be 0
  curl -s http://localhost:3000/ | grep -c 'submission_notes' # must be 0
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/download-image?url=https://cdn.mosaic.photography.evil.com/x"  # 400
  ```
  Each canonical must be the page's own absolute URL (`https://www.mosaic.photography/...`),
  and `/` must be `https://www.mosaic.photography/` or without trailing slash — say which.
- Photographer page: the Nude/Safe counts add up to the total and "Safe" shows no nude images.
- Homepage: contributors slider still renders names, avatars and featured images.

## Final answer format

1. Files changed, one line each.
2. The canonical table from the curl loop.
3. The contributor column list you chose and where each column is read.
4. Other nudity checks found (Change 6, step 2).
5. Anything you were unsure about and left as is.
