# openCode prompt — Koppitz timeline + llms.txt + fetch-script fixes (Task 1)

> Written 2026-11-08 by Claude (orchestrator). Run in openCode from the web repo root. Read `CLAUDE.md` first.
> Context: Rudolf Koppitz was published to S3 + Supabase on 2026-11-08 (photographers id 65, slug `koppitz`,
> 12 images). `/photographers/koppitz` is live, but its "A Life in Focus" timeline is empty because
> `src/lib/timeline/photographersTimelines.ts` has no `koppitz` key.

## Part 1 — timeline (`src/lib/timeline/photographersTimelines.ts`)

Add a `koppitz` key (after `cameron`, same shape as the other entries: `title`, `cardTitle`,
`cardDetailedText`, `eventType`). Use exactly these events and facts; you may polish wording but add no
new facts, dates or superlatives. Add "Albertina Sammlungen Online, Austria-Forum (AEIOU)" to the
Sources comment at the end of the file.

| title | cardTitle | cardDetailedText | eventType |
|---|---|---|---|
| 1884 | Born in Austrian Silesia | Rudolf Koppitz was born on 3 January 1884 in Schreiberseifen, Austrian Silesia (today Skrbovice in the Czech Republic), into a rural Protestant family. | personal |
| 1897 | The Vienna Secession is founded | Gustav Klimt and fellow artists break with Vienna's academic establishment and found the Vienna Secession. Its decorative, symbolist style later shapes Koppitz's photographs. | historical |
| 1897 | Apprenticeship in Freudenthal | At thirteen he begins training with the photographer Robert Rotter in nearby Freudenthal (Bruntál), then works in small commercial studios. | personal |
| 1912 | Graphische Lehr- und Versuchsanstalt | He enrols at Vienna's school for photography and printing. By 1913 he is an assistant there; his teacher, the Czech Symbolist Karel Novák, influences his early work. | personal |
| 1914 | Outbreak of the First World War | Austria-Hungary goes to war in the summer of 1914. | historical |
| 1914–1918 | Field and aerial photographer | Koppitz serves as a field and aerial reconnaissance photographer, recording landscapes from the air, soldiers and the communities along the front. | personal |
| 1918 | End of Austria-Hungary | The empire collapses at the end of the war; Vienna becomes the capital of the new Republic of Austria. | historical |
| 1919 | Professor in Vienna | He becomes a professor at the Graphische Lehr- und Versuchsanstalt, a post he holds for about twenty years. | personal |
| 1923 | Marriage and "In the Bosom of Nature" | He marries the photographer Anna Arbeitlang, his studio partner since 1921, who retouches his prints and often models for him. The same year he makes "In the Bosom of Nature", a nude self-portrait in an Alpine landscape. | personal |
| 1925 | Bewegungsstudie | Koppitz creates Bewegungsstudie (Motion Study), his best-known image, with dancers in a frieze-like composition in the spirit of the Vienna Secession. His daughter Liselotte is born the same year. | personal |
| 1926 | Success in the United States | His prints are shown at the Pittsburgh Salon (1926, 1927, 1928) and in about fourteen juried exhibitions in the United States up to 1930. | personal |
| 1929 | The Wall Street Crash | The stock market crash in New York starts the Great Depression, which hits Austria hard in the early 1930s. | historical |
| 1936 | "Land und Leute" and death | His exhibition "Land und Leute" (Country and People), about 500 photographs of rural Austria, opens in Vienna. He dies on 8 July 1936 in Perchtoldsdorf, near Vienna, aged 52. | personal |

## Part 2 — `public/llms.txt`

- Add "Rudolf Koppitz" to the "Representative photographers" line (before "and others").
- If the file states a number of photographers anywhere, update it (14 → 15). Change nothing else.

## Part 3 — `scripts/adding-new-photographers/0-fetch-from-commons.mjs` fixes (found in the first real run)

1. **HTTP 429 from upload.wikimedia.org** ("Your bot is making too many requests"): on 429 or 503, wait
   (honour `Retry-After` if present, else 30 s, then 60 s, then 120 s) and retry, max 3 retries per file.
   Download files one at a time with ≥ 1 s between downloads. Atget will download ~100 files.
2. **Title slug:** map `ß` → `ss` before NFKD (got `flei-ige-hande`), and drop apostrophes instead of
   turning them into `-` (got `st-stephen-s-cathedral`; want `st-stephens-cathedral`).
3. **Gender "none" (no people):** add `none` to the gender select in review.html ("none (no people)") and
   to the valid values. With `none`, the filename has **no gender token** (the CSV parser then leaves
   gender empty, which is what we want for buildings, animals, landscapes).
4. **Titles into the CSV:** `--apply` already writes `sources.csv`. Make `3-generate-supabase-csv.py`
   read `IMGs\{folder}\_commons\sources.csv` when it exists and use its title (the reviewed Mosaic title,
   with accents and punctuation) instead of the title parsed from the filename; description becomes
   `"{title}. Photograph by {author}, {year}."`. Add a `mosaic_title` column to `sources.csv` if it isn't
   there. Without `sources.csv`, behaviour stays as today.
5. **Portrait row:** in the CSV, a `000_aaa_` portrait gets `nudity=not-nude` and the year/orientation/
   gender/color from its decision in `sources.csv` (today it comes out as `nude` with empty year and
   orientation, which `4-publish.mjs` rejects).

## Out of scope

- No other photographer's timeline, no `src/` changes except the timeline file, no DB, no S3, no deps.
- Don't touch `4-publish.mjs`.

## Check before you report

- `yarn lint` and `npx tsc --noEmit` clean.
- `yarn dev` → `/photographers/koppitz` shows the timeline (13 cards).
- Slug unit check (print in the report): `Fleißige Hände (Busy Hands)` → `fleissige-hande-busy-hands`;
  `Stephanskirche, Wien (St. Stephen's Cathedral, Vienna)` → `stephanskirche-wien-st-stephens-cathedral-vienna`.
- Script 3 against the existing `rudolf-koppitz` folder with `--out` to a temp file: titles match
  `sources.csv`, portrait row not-nude with year. Then delete the temp file. (Don't overwrite
  `images_resize_rudolf-koppitz_2026-11-08.csv`.)

Report back files changed and the check results. No commit.
