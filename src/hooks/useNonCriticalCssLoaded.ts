import { useEffect, useState } from "react";

// This hook returns true when non-critical.css has loaded
export function useNonCriticalCssLoaded() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if the CSS is already loaded
    const link = document.querySelector(
      'link[href="/non-critical.css"]',
    ) as HTMLLinkElement | null;
    if (link && link.sheet) {
      setLoaded(true);
      return;
    }

    function handleLoad(e: Event) {
      const target = e.target as HTMLLinkElement;
      if (target.href.endsWith("/non-critical.css")) {
        setLoaded(true);
      }
    }

    // Listen for link load
    document
      .querySelectorAll('link[href="/non-critical.css"]')
      .forEach((el) => {
        const l = el as HTMLLinkElement;
        l.addEventListener("load", handleLoad);
      });

    // Fallback: set loaded after a timeout just in case
    const timeout = setTimeout(() => setLoaded(true), 3000);

    return () => {
      document
        .querySelectorAll('link[href="/non-critical.css"]')
        .forEach((el) => {
          const l = el as HTMLLinkElement;
          l.removeEventListener("load", handleLoad);
        });
      clearTimeout(timeout);
    };
  }, []);

  return loaded;
}
