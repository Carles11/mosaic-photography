# Prompt for openCode: photographer pages answer first, /photographers hub, site-wide description

Repo: Mosaic Photography (Next.js 15 App Router, React 19, TypeScript). Read `CLAUDE.md` first
and follow its 10 rules. Do NOT run any git write commands (no add/commit/push). Carles commits.
Do only the changes below. Do not refactor anything else. Do NOT run `yarn build` (its postbuild
regenerates sitemaps and pings IndexNow).

Why: AI assistants (ChatGPT, Perplexity) never cite mosaic.photography, not even for questions
these pages answer, e.g. "Mathew Brady's portraits online with a short biography?" or "public
domain photographs by early photographers like Julia Margaret Cameron, organized by photographer?".
The pages bury the short answer, say "nude" on pages that have no nude images, put ~2,000 chars of
raw Markdown (including a block addressed to "AI engines") into Person JSON-LD, and their
breadcrumb points to `/photographers`, which is a 404.

Facts checked on 2026-10-21:
- `photographers.intro_md` holds a short factual intro, e.g. `# Mathew Brady (1822–1896)\n\nMathew
  Brady is widely recognized as the "Father of Photojournalism." ...`. It starts with its own
  Markdown heading line. Today it is only used by `src/app/api/photographers/[surname]/route.ts`
  (the `.md` route), never on the HTML page.
- `photographers.biography_md` ends with a section starting `#### 🔍 AI-Search & GEO Context`.
  `getHumanReadableBiography` in `src/utils/clean-content.ts` already strips it for display.
- Image rows have `nudity` = `"nude"` or `"not-nude"`. Brady has 0 nude of 79.
- `src/utils/fetchPhotographersBasic.ts` returns all photographers (incl. `intro_md`,
  `birthdate`, `deceasedate`, `origin`, `slug`) plus their `000_aaa` portrait.
- Supabase returns max 1,000 rows per query and `images_resize` has ~1,004 rows, so do NOT count
  images by selecting all rows at once.

## Change 1: photographer page `src/app/photographers/[surname]/page.tsx`

1. **Answer first.** Directly under the `<h1>`, add a section with
   `<h2>Who was {name} {surname}?</h2>` followed by `intro_md` rendered with `ReactMarkdown`
   (same `components` mapping the biography uses). Remove the first line of `intro_md` if it
   starts with `#` (the page already has the H1). If `intro_md` is empty, render nothing.
2. **Quick facts list:** replace the `Subject:` row with `Lived: {birthYear}–{deathYear}` (years
   only, from `birthdate`/`deceasedate`; omit the row if either is missing). Keep the other rows.
3. **Metadata (`generateMetadata`)**, built from data, one small helper in the same file:
   - `nudeCount` = number of the photographer's images with `nudity === "nude"`.
   - Title, using `title: { absolute: ... }` so the layout template is not appended:
     `{name} {surname} ({birthYear}–{deathYear}): Public Domain Photographs | Mosaic`.
     Leave out the years if they are missing. If it is longer than 70 chars, drop ` | Mosaic`.
   - Description:
     `{name} {surname} ({birthYear}–{deathYear}), {origin}: biography, timeline and {n}
     public-domain photographs{nudeCount > 0 ? ", including fine-art nude studies" : ""}. Free to
     use (CC PDM 1.0).` Trim to ≤160 chars at a word boundary.
   - Use the same title/description for `openGraph` and `twitter`.
   - `keywords`: include `"vintage nude photography"` and `"classic nude art"` only when
     `nudeCount > 0`.
4. **Person JSON-LD (`PhotographerJsonLd`):**
   - `description` = plain text of `intro_md` (heading line removed, Markdown `*`, `_`, `#`
     stripped), cut to ≤300 chars at a sentence end. Fallback: the first paragraph of
     `getHumanReadableBiography(biography_md)` as plain text. Never include the
     "AI-Search & GEO Context" block.
   - `birthDate` / `deathDate` as `YYYY-MM-DD` only (today they carry `T00:00:00+00:00`).
5. **More photographers** (internal links; this is deliberate, so each page links to the rest of the
   collection and to the new hub): after the gallery, add
   `<h2>More photographers in the collection</h2>` and a plain `<ul>` of links to every other
   photographer as `/photographers/{slug}` with text `{name} {surname} ({birthYear}–{deathYear})`,
   sorted by surname, plus a final link `All photographers` → `/photographers`. Get the data
   with `fetchPhotographersBasic()` (reuse it, do not add a new fetcher for this). Use the DB
   `slug`, never `slugify(surname)`.
6. The breadcrumb JSON-LD stays as it is (it becomes valid once Change 2 exists).

## Change 2: new hub page `src/app/photographers/page.tsx` (server component)

Deliberate structure: a real index page, because "organised by photographer" is the question we
want to answer and the breadcrumb on every photographer page already points here.

- `export const revalidate = 86400;` (same as the detail page).
- Data: `fetchPhotographersBasic()` for the photographers. For image counts, add ONE SSR helper
  `src/utils/fetchPhotographerImageCountsSSR.ts` (rule 7) that returns
  `Record<author, { total: number; nude: number }>` using per-author head counts
  (`.select("id", { count: "exact", head: true }).eq("author", author)`, and the same plus
  `.eq("nudity", "nude")`), run in `Promise.all`. Exclude portraits
  (`.not("filename", "ilike", "000_aaa%")`). Reason: avoids the 1,000-row limit.
- `metadata`: title `{ absolute: "Photographers: Public Domain Vintage Photography (1840s–1930s) | Mosaic" }`
  (shorten if over 70 chars), a description of ≤160 chars saying it lists every photographer
  in the collection with life dates, biography and public-domain photographs,
  `alternates: { canonical: "/photographers" }`, and `openGraph` with title, description and url.
- Content:
  - `<h1>Photographers in the Mosaic collection</h1>`
  - One sentence answering the question directly, with numbers from the data:
    `Public-domain photographs by {count} early photographers, organised by photographer, from
    {earliestBirthYear} to {latestDeathYear}: fine-art nudes, portraits and documentary work.`
  - A `<ul>` sorted by surname. Each item: link `{name} {surname}` → `/photographers/{slug}`,
    then `{birthYear}–{deathYear} · {origin} · {total} photographs`, then the first sentence of
    `intro_md` as plain text (same stripping as Change 1.4). No images (out of scope).
- JSON-LD (inline `<script type="application/ld+json">` with `serializeJsonLd` from
  `@/helpers/jsonLd`, like the Person block):
  - `CollectionPage` with `name`, `url` (`https://www.mosaic.photography/photographers`),
    `description`, and `mainEntity` = `ItemList` whose `itemListElement` are
    `{ "@type": "ListItem", position, url, name }` for every photographer.
  - `BreadcrumbList`: Home → Photographers.
- Sitemap: in `scripts/generate-sitemap-0.ts`, add `https://www.mosaic.photography/photographers`
  to `staticPages` (changefreq `weekly`, priority `0.8`), in the same format as the others.

## Change 3: site-wide description `src/app/layout.tsx`

Carles approved this wording on 2026-10-21. Use it in exactly these three places:
`metadata.description` (~line 34), the `WebSite` `JsonLdSchema` `description` (~line 145) and
the `Organization` JSON-LD `description` (~line 162):

`Public-domain vintage photography, 1840s–1930s: fine-art nudes, portraits and documentary work by pioneering photographers.`

Also change the OG image `alt` (~line 63) to `Mosaic Photography: public-domain vintage photography gallery`.
Do NOT change `title.default`/`template`, and do NOT touch `src/app/page.tsx`.

## Change 4: timeline headings `src/components/timeline/Timeline.tsx`

`semanticTags`: `title: "h1"` → `"h3"`, `cardTitle: "h2"` → `"h4"`. Today every milestone renders
an extra `<h1>` after hydration.

## Out of scope (do not do)

- Homepage title, H1, meta and JSON-LD in `src/app/page.tsx`.
- The `author` column or image captions (it is the join key across 3 tables).
- Any Supabase write, any S3 change, `public/llms.txt`, footer/nav links (`ClientLayout`).
- `PhotographersViewCard.tsx` (its `slugify(surname)` links), the ImageGallery `w400` URLs,
  the `Timeline (1).tsx` duplicate, the affiliate shelf.
- No new dependencies.

## Check before you report back

1. `yarn lint` and `npx tsc --noEmit`: both clean.
2. `yarn dev`, then with curl (server HTML, not the browser):
   - `/photographers` → 200; one `<h1>`; canonical `https://www.mosaic.photography/photographers`;
     `CollectionPage` JSON-LD with 14 `ListItem`s; all 14 links present.
   - `/photographers/brady` → title contains `Mathew Brady (1822–1896)`; description contains no
     "nude"; the "Who was Mathew Brady?" H2 and intro text appear before "A Life in Focus";
     Person `description` ≤300 chars with no `AI-Search` and no `#`/`**`; `birthDate` is
     `1822-05-18`; 13 "More photographers" links + `All photographers`.
   - `/photographers/durieu` → description contains "fine-art nude studies".
   - `/` → the `Organization` and `WebSite` descriptions show the new sentence; the homepage
     `<title>` is unchanged.
3. Report: the files changed, the title/description lengths for brady, durieu and von-gloeden,
   and anything you could not verify.
