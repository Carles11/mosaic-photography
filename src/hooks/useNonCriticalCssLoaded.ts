import { useEffect, useState } from "react";

export function useNonCriticalCssLoaded() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Adjust querySelector to match any query string
    const link = document.querySelector(
      'link[href^="/non-critical.css"]',
    ) as HTMLLinkElement | null;
    if (link && link.sheet) {
      setLoaded(true);
      return;
    }

    function handleLoad(e: Event) {
      const target = e.target as HTMLLinkElement;
      if (target.href.includes("/non-critical.css")) {
        setLoaded(true);
      }
    }

    document
      .querySelectorAll('link[href^="/non-critical.css"]')
      .forEach((el) => {
        const l = el as HTMLLinkElement;
        l.addEventListener("load", handleLoad);
      });

    const timeout = setTimeout(() => setLoaded(true), 3000);

    return () => {
      document
        .querySelectorAll('link[href^="/non-critical.css"]')
        .forEach((el) => {
          const l = el as HTMLLinkElement;
          l.removeEventListener("load", handleLoad);
        });
      clearTimeout(timeout);
    };
  }, []);

  return loaded;
}
