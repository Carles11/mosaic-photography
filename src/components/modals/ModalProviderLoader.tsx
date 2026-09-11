"use client";

import React from "react";
import { ModalProvider } from "@/context/modalContext/ModalProvider";

/**
 * Mounts the modal system around the app.
 *
 * This used to wrap `{children}` in `dynamic(() => import(ModalProvider),
 * { ssr: false })` with `fallback={null}`. Because ClientProviders puts this
 * component around the ENTIRE app in the root layout, that single flag
 * disabled server rendering for every route on the site: the HTML Google
 * (and any fetch without JavaScript) received was a 1.8 KB shell with
 * `BAILOUT_TO_CLIENT_SIDE_RENDERING`, zero `<img>`, zero `<h1>`, ten words —
 * confirmed live on every route on 2026-09-11. All the SSR fetchers, the
 * page-level JSON-LD and the H1s ran on the server and were thrown away.
 *
 * ModalProvider is SSR-safe on its own: it touches `document` only inside
 * effects and creates the portal only once `#modal-root` has been found on
 * the client. Modal BODIES stay lazy via `modalRegistry` — that is where the
 * bundle-size win was; the provider itself is a few KB. So: plain import,
 * children render on the server, modals still load on demand.
 */
export default function ModalProviderLoader({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <ModalProvider>{children}</ModalProvider>;
}
