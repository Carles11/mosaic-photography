"use client";

import React, { useEffect } from "react";
import Cookies from "js-cookie";

const COOKIE_NAME = "cookie_consent";

declare global {
  interface Window {
    __mosaic_gtm_loaded?: boolean;
    __mosaic_clarity_loaded?: boolean;
    // removed dataLayer to avoid conflict with existing google.d.ts
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
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

      // Narrow the window type locally to avoid redeclaring dataLayer globally.
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

      // Minimal clarity setup similar to official snippet
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

    try {
      if (Cookies.get(COOKIE_NAME) === "true") {
        loadAll();
      }
    } catch (e) {
      console.warn("[AnalyticsLoader] Cookies read failed", e);
    }

    const onConsentGranted = (): void => {
      loadAll();
    };

    window.addEventListener("cookie-consent-granted", onConsentGranted);

    return () => {
      window.removeEventListener("cookie-consent-granted", onConsentGranted);
    };
  }, []);

  return null;
}
