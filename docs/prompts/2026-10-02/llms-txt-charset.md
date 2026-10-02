# openCode task: serve /llms.txt as UTF-8

Date: 2026-10-02 · Repo: mosaic-photography · Branch: main

## Why

`public/llms.txt` is valid UTF-8 (checked: "—" is bytes e2 80 94), but on
production the browser shows "â€”", "Â·", "PlÃ¼schow": Amplify serves the file
without `charset`, so clients fall back to Windows-1252. AI crawlers may do
the same. Locally `next dev` sends `charset=UTF-8`, so this only shows live.

## Do exactly this (nothing else)

In `next.config.ts`, inside `async headers()` → the returned array, add one
entry right after the existing `source: "/site.webmanifest"` entry, same style:

```ts
      {
        source: "/llms.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain; charset=utf-8",
          },
        ],
      },
```

Do not change the file `public/llms.txt`. Do not touch any other file.
No git add / commit / push. Do not run `npm run build`.

## Verify and report

- `npx tsc --noEmit` passes.
- `npm run dev`, then `curl -sI http://localhost:3000/llms.txt` → 200 and
  `content-type: text/plain; charset=utf-8`. Stop the dev server.
- Paste `git diff next.config.ts`.
