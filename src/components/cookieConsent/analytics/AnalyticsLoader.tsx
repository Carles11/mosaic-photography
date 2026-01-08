"use client";

import React, { useEffect } from "react";
import Cookies from "js-cookie";

const COOKIE_NAME = "cookie_consent";

declare global {
  interface Window {
    __mosaic_gtm_loaded?: boolean;
    __mosaic_clarity_loaded?: boolean;
    // minimal clarity type used in loader
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
    // debug helper to revoke analytics manually
    __mosaic_revoke_analytics?: () => void;
  }
}

export default function AnalyticsLoader(): React.ReactElement | null {
  useEffect(() => {
    const hasGtm = (): boolean => Boolean(window.__mosaic_gtm_loaded);
    const setGtmFlag = (): void => {
      window.__mosaic_gtm_loaded = true;
    };

    function injectGtm(): void {
      if (hasGtm()) return;

      const win = window as Window & { dataLayer?: unknown[] };
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({
        "gtm.start": Date.now(),
        event: "gtm.js",
      });

      const s: HTMLScriptElement = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtm.js?id=GTM-N74Q9JC5";
      s.id = "mosaic-gtm-script";
      document.head?.appendChild(s);

      setGtmFlag();
      console.debug("[AnalyticsLoader] GTM injected");
    }

    function injectClarity(): void {
      if (window.__mosaic_clarity_loaded) return;

      if (!window.clarity) {
        const clarityFunc = (...args: unknown[]): void => {
          const qHolder = (window.clarity as { q?: unknown[] })?.q || [];
          qHolder.push(args);
          (window.clarity as { q?: unknown[] }).q = qHolder;
        };
        window.clarity = clarityFunc as ((...args: unknown[]) => void) & {
          q?: unknown[];
        };
      }

      const t: HTMLScriptElement = document.createElement("script");
      t.async = true;
      t.src = "https://www.clarity.ms/tag/ttu5c2if1l?ref=bwt";
      t.id = "mosaic-clarity-script";
      document.head?.appendChild(t);

      window.__mosaic_clarity_loaded = true;
      console.debug("[AnalyticsLoader] Clarity injected");
    }

    const loadAll = (): void => {
      injectGtm();
      injectClarity();
    };

    // ----- revoke / teardown helpers -----
    function removeGtm(): void {
      try {
        const gtmScript = document.getElementById("mosaic-gtm-script");
        if (gtmScript?.parentNode) gtmScript.parentNode.removeChild(gtmScript);

        // remove iframes referencing googletagmanager (safe-guard)
        const iframes = Array.from(document.getElementsByTagName("iframe"));
        iframes.forEach((f) => {
          try {
            if (
              f.src &&
              f.src.includes("googletagmanager.com") &&
              f.parentNode
            ) {
              f.parentNode.removeChild(f);
            }
          } catch {
            // ignore cross-origin read errors or removal errors
          }
        });

        // clear and remove dataLayer
        const win = window as Window & { dataLayer?: unknown[] };
        if (win.dataLayer) {
          try {
            win.dataLayer.length = 0;
          } catch {
            // ignore
          }
          try {
            Reflect.deleteProperty(win, "dataLayer");
          } catch {
            // ignore
          }
        }

        // clear flag
        try {
          Reflect.deleteProperty(window, "__mosaic_gtm_loaded");
        } catch {
          // ignore
        }

        console.debug("[AnalyticsLoader] GTM removed");
      } catch (e) {
        console.warn("[AnalyticsLoader] removeGtm failed", e);
      }
    }

    function removeClarity(): void {
      try {
        const clarityScript = document.getElementById("mosaic-clarity-script");
        if (clarityScript?.parentNode)
          clarityScript.parentNode.removeChild(clarityScript);

        // remove any clarity pixel images (best-effort)
        const imgs = Array.from(document.getElementsByTagName("img"));
        imgs.forEach((i) => {
          try {
            if (
              i.src &&
              (i.src.includes("clarity.ms") || i.src.includes("c.bing.com"))
            ) {
              i.parentNode?.removeChild(i);
            }
          } catch {
            // ignore
          }
        });

        // remove clarity function and flag
        try {
          Reflect.deleteProperty(window, "clarity");
        } catch {
          // ignore
        }
        try {
          Reflect.deleteProperty(window, "__mosaic_clarity_loaded");
        } catch {
          // ignore
        }

        console.debug("[AnalyticsLoader] Clarity removed");
      } catch (e) {
        console.warn("[AnalyticsLoader] removeClarity failed", e);
      }
    }

    const revokeAll = (): void => {
      removeGtm();
      removeClarity();

      try {
        Reflect.deleteProperty(window, "__mosaic_revoke_analytics");
      } catch {
        /* ignore */
      }

      console.debug("[AnalyticsLoader] analytics revoked");
    };

    // expose a debug function to manually revoke (useful for testing)
    window.__mosaic_revoke_analytics = () => {
      revokeAll();
    };

    // ----- event handlers -----
    const onConsentGranted = (): void => {
      loadAll();
    };

    const onConsentRevoked = (): void => {
      revokeAll();
    };

    const onConsentChanged = (): void => {
      try {
        if (Cookies.get(COOKIE_NAME) === "true") {
          loadAll();
        } else {
          revokeAll();
        }
      } catch (e) {
        console.warn("[AnalyticsLoader] reading cookie failed on change", e);
      }
    };

    try {
      if (Cookies.get(COOKIE_NAME) === "true") {
        loadAll();
      }
    } catch (e) {
      console.warn("[AnalyticsLoader] Cookies read failed", e);
    }

    window.addEventListener("cookie-consent-granted", onConsentGranted);
    window.addEventListener("cookie-consent-revoked", onConsentRevoked);
    window.addEventListener("cookie-consent-changed", onConsentChanged);

    return () => {
      window.removeEventListener("cookie-consent-granted", onConsentGranted);
      window.removeEventListener("cookie-consent-revoked", onConsentRevoked);
      window.removeEventListener("cookie-consent-changed", onConsentChanged);
      try {
        Reflect.deleteProperty(window, "__mosaic_revoke_analytics");
      } catch {
        /* ignore */
      }
    };
  }, []);

  return null;
}
