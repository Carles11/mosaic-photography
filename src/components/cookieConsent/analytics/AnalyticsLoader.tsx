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

    // Typed local view for window.dataLayer to avoid global declaration conflicts
    const getDataLayerHost = (): { dataLayer?: unknown[] } =>
      window as unknown as { dataLayer?: unknown[] };

    function injectGtm(): void {
      if (hasGtm()) return;

      const win = getDataLayerHost();
      // Ensure dataLayer exists and push the gtm.start event
      win.dataLayer = win.dataLayer ?? [];
      try {
        (win.dataLayer as unknown[]).push({
          "gtm.start": Date.now(),
          event: "gtm.js",
        });
      } catch {
        // ignore
      }

      // If a consent cookie already exists, push its value to the dataLayer
      try {
        const cookieVal = Cookies.get(COOKIE_NAME);
        if (cookieVal !== undefined) {
          const consentBool = cookieVal === "true";
          (win.dataLayer as unknown[]).push({
            event: "cookie_consent",
            consent: consentBool,
            timestamp: Date.now(),
          });
          console.debug(
            "[AnalyticsLoader] initial dataLayer push (cookie_consent):",
            consentBool
          );
        }
      } catch (e) {
        console.warn("[AnalyticsLoader] reading cookie failed on init", e);
      }

      const s: HTMLScriptElement = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtm.js?id=GTM-N74Q9JC5";
      s.id = "mosaic-gtm-script";
      document.head?.appendChild(s);

      setGtmFlag();
      console.debug(
        "[AnalyticsLoader] GTM injected (container loaded on every page)"
      );
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

    // Note: GTM now intentionally remains loaded on the page so it can capture both
    // Accept and Decline dataLayer pushes. We will not remove the GTM script on revoke.
    // We will remove/restore Clarity only, since Clarity collects user-level data.

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
      // Keep GTM present so it can capture future consent events.
      // Remove third-party trackers that should not run without consent.
      removeClarity();

      try {
        Reflect.deleteProperty(window, "__mosaic_revoke_analytics");
      } catch {
        /* ignore */
      }

      console.debug(
        "[AnalyticsLoader] analytics revoked (clarity removed; GTM preserved)"
      );
    };

    // expose a debug function to manually revoke (useful for testing)
    window.__mosaic_revoke_analytics = () => {
      revokeAll();
    };

    // ----- event handlers -----
    const onConsentGranted = (): void => {
      // GTM is already loaded; just ensure clarity is injected and push the consent change
      const win = getDataLayerHost();
      try {
        (win.dataLayer = win.dataLayer ?? []).push({
          event: "cookie_consent",
          consent: true,
          timestamp: Date.now(),
        });
        console.debug("[AnalyticsLoader] pushed consent=true to dataLayer");
      } catch {
        // ignore
      }
      injectClarity();
    };

    const onConsentRevoked = (): void => {
      // push the consent=false event, and remove trackers like Clarity
      const win = getDataLayerHost();
      try {
        (win.dataLayer = win.dataLayer ?? []).push({
          event: "cookie_consent",
          consent: false,
          timestamp: Date.now(),
        });
        console.debug("[AnalyticsLoader] pushed consent=false to dataLayer");
      } catch {
        // ignore
      }
      revokeAll();
    };

    const onConsentChanged = (): void => {
      try {
        const cookieVal = Cookies.get(COOKIE_NAME);
        const win = getDataLayerHost();
        if (cookieVal === "true") {
          (win.dataLayer = win.dataLayer ?? []).push({
            event: "cookie_consent",
            consent: true,
            timestamp: Date.now(),
          });
          injectClarity();
        } else if (cookieVal === "false") {
          (win.dataLayer = win.dataLayer ?? []).push({
            event: "cookie_consent",
            consent: false,
            timestamp: Date.now(),
          });
          revokeAll();
        }
      } catch (e) {
        console.warn("[AnalyticsLoader] reading cookie failed on change", e);
      }
    };

    // Load GTM on every page so GTM can capture both accept and decline pushes.
    try {
      injectGtm();
      // If cookie was already true we already injected clarity in injectGtm via initial push,
      // but ensure clarity runs if cookie === "true"
      try {
        if (Cookies.get(COOKIE_NAME) === "true") injectClarity();
      } catch {
        // ignore
      }
    } catch (e) {
      console.warn("[AnalyticsLoader] GTM injection failed", e);
    }

    window.addEventListener("cookie-consent-granted", onConsentGranted);
    window.addEventListener("cookie-consent-declined", onConsentRevoked);
    window.addEventListener("cookie-consent-changed", onConsentChanged);

    return () => {
      window.removeEventListener("cookie-consent-granted", onConsentGranted);
      window.removeEventListener("cookie-consent-declined", onConsentRevoked);
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
