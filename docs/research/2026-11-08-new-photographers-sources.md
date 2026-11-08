# New photographers — source check (2026-11-08)

Task 1, round 1. Picked by Carles 2026-11-08: **Eugène Atget, Gertrude Käsebier, Rudolf Koppitz**.
Read live by Claude (Wikimedia Commons API via Claude in Chrome; life dates via web search).
Rule for Mosaic: author died before 1956 (life + 70, PD in the EU too), work dated ≤ 1930,
CC PDM / PD tag on the file, originals ≥ 1600 px on the long side (the pipeline never upscales;
w1600 is the largest rendition).

## Summary

| | Atget | Käsebier | Koppitz |
|---|---|---|---|
| Life | 1857–1927 (Libourne → Paris) | 1852–1934 (Des Moines → New York) | 1884–1936 (Schreiberseifen, Austrian Silesia → Perchtoldsdorf) |
| PD (life + 70) | yes | yes | yes |
| Commons category | `Photographs by Eugène Atget` (3,684 files direct, 19 subcats) | `Photographs by Gertrude Käsebier` (296 files, 3 subcats) | `Rudolf Koppitz` (34 files, 3 subcats incl. `Female nudes by…` 9, `Male nudes by…` 3) |
| Best sub-source | `…in the Metropolitan Museum of Art` (134), `…in the J. Paul Getty Museum` (60); also AIC 301, Philadelphia 482, High Museum 387, ICP 285, MFA Boston 106 | Library of Congress (`LCCN…` files) + Met (`MET DP…`) | — |
| Resolution (sample) | Met 2,700–3,800 px; Getty 3,300–5,400 px; BnF files often ~1,300 px | LoC 4,000–7,600 px; Met 2,500–4,000 px | **mostly 320–960 px**; only ~8 files ≥ 2,000 px |
| Licence seen | Met/Getty: PD / CC0 or PDM on file pages | LoC: "no known restrictions" / PD-1923; Met: CC0 | per file, not checked yet |
| Nudes | yes, small set (subcat `Photographs of nude females by Eugène Atget`, 1920s studies) + `Photographs of prostitutes by…` | none expected | yes (adult nude studies, dance) |
| Minors check (Task 5 rule) | street scenes with children, clothed | many mother-and-child images, clothed | `Mutter und Kind c1925`, `Koppitz madchen` → Carles checks |
| Usable estimate | plenty; curate ~80–120 from Met + Getty (+ AIC/Philadelphia if needed) | ~60–100 after removing duplicates (same image as LoC + Met + crops) | **~8–15 at Mosaic quality** |

## Findings and flags

- **Atget:** volume is not the problem, curation is. Prefer Met + Getty (high-res, clear CC0/PD). Commons
  holds the same negative several times (BnF, Carnavalet, MoMA) → dedupe by title. Many files are dated
  "1898–1927" ranges; use the start year or the museum date.
- **Käsebier:** best quality of the three. Duplicates are frequent (e.g. Amos Two Bulls ×6, Rodin ×7,
  Stieglitz ×3) → keep the largest LoC or Met version only. Some LoC catalogue titles use period wording
  (e.g. "young Negro woman …") → **Mosaic titles must be rewritten neutrally**, keep the LoC number as
  source. Her Sioux portraits from Buffalo Bill's Wild West Show (1898–1902) are a large, well-known
  set; describe them with the sitters' names, no clichés.
- **Koppitz:** too thin on Commons for a full page. High-res files: Auf Skitour 1928, Mutter und Kind
  c1925, Wien Stephanskirche 1925, Junge Sizilianerin, Zwei Bauern, Bewegungsstudie 1925 (auction
  scan, 2286×3200), Ruderboot c1930, Fleißige Hände "1930s" (→ excluded, may be after 1930).
  Most nudes are small scans. A second source would be **Europeana / Albertina** (items with
  Public Domain Mark, e.g. `15508/FotoGLV2000_4095`), but europeana.eu shows a bot check to Claude,
  so it can't be read from here. Options for Carles: (a) Koppitz with ~8–12 images, (b) Carles checks
  Europeana by hand first, (c) swap Koppitz for a reserve (Frank Eugene 1865–1936, Frances Benjamin
  Johnston 1864–1952).
- Folder / author / slug proposal (RUNBOOKS routine 1, step 2; ASCII slug rule from Task 1):
  `eugene-atget` / `Eugène Atget` / `atget` · `gertrude-kasebier` / `Gertrude Käsebier` / `kasebier` ·
  `rudolf-koppitz` / `Rudolf Koppitz` / `koppitz`. Existing pages use the surname as slug
  (`/photographers/brady`), so these follow that. `author` keeps the accent (display name, join key).
- Commons API works from Carles's browser (and should from his PC). `commons.wikimedia.org` is not
  reachable from Claude's WebFetch or shells → downloads must run on Carles's PC.

## Koppitz: Europeana / Albertina checked (2026-11-08, Claude in Chrome)

- Europeana, "Rudolf Koppitz" + "Can I use this? Yes": **37 results, all Albertina, Public Domain**,
  mostly the folk-costume portraits (Sokácen, Ungarische Bäuerin, Murtaler, Sennerin …).
- Sample `Ungarischer Bauer` (Albertina Foto2015/27): Europeana download = **JPEG 74 KB** (small);
  Albertina dates it **"vor 1936"**, series **"Land und Leute" (exhibition Vienna 1936)**.
  → can't be shown to be ≤ 1930 and too small. **Not usable.** (Albertina offers IIIF / image request,
  not checked further.)
- **Decision (Carles, 2026-11-08): option (a)**, Koppitz from Commons only, ~8–12 images.
- Found by Carles in Commons, checked via API: **`Bewegungsstudie (Movement Study) 1925, black and white
  photograph by Rudolf Koppitz.jpg`** 1960×2712, PD (PD-old-80-expired, CC-PD-Mark), Featured picture,
  Picture of the Year 2025 finalist, retouched from the Christie's scan. It sits in `Category:Female nudes by
  Rudolf Koppitz` → `Category:Bewegungsstudie` (my first list only covered the top category) → the fetch
  script must recurse subcategories. Use this one, not the auction scan or `Albertina 2018 … Motion Study`
  (a photo of the framed print in the museum).
- `Photo - Portrait Erwin Puchinger - Koppitz - um 1914.png` = Koppitz's portrait **of the painter Erwin
  Puchinger** (583×780, PD), not of Koppitz → a gallery image, not the `000_aaa_` portrait.
- Koppitz portrait: Wikidata P18 = `KOPPITZ R.jpg`, self-portrait c. 1923, only 285×385 (enough for a card).
- Prompt: `docs/prompts/2026-11-08/fetch-from-commons.md`.

## Next

1. Carles decides Koppitz (a / b / c).
2. openCode prompt: `0-fetch-from-commons.mjs` (per category: list files, keep PD/CC0 + year ≤ 1930 +
   long side ≥ 1600 px, dedupe by title, download originals, write a manifest + HTML review sheet for
   nudity / gender / minors / title) and `--folder` for scripts 1–3. Mosaic rules for the prompt: no AI on
   the images, never construct CDN URLs (rule 1), nothing is uploaded or imported by the script.
