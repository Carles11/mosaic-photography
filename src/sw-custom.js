/* Custom Service Worker wrapper used by next-pwa.
   Filters out Next.js server-only manifest entries (next-font-manifest,
   dynamic-css-manifest and any /_next/server/* paths) before precaching.
*/

import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";

clientsClaim();

self.addEventListener("message", (event) => {
  if (event?.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

const manifest = self.__WB_MANIFEST || [];

const filteredManifest = (manifest || []).filter((entry) => {
  const url = entry && entry.url ? String(entry.url) : "";
  if (!url) return false;
  if (url.includes("/_next/server/")) return false;
  if (url.includes("next-font-manifest")) return false;
  if (url.includes("dynamic-css-manifest")) return false;
  return true;
});

precacheAndRoute(filteredManifest);
