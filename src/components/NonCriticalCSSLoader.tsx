"use client";

import { useEffect } from "react";

export default function NonCriticalCSSLoader() {
  useEffect(() => {
    // Create link element for non-critical CSS using media-switch pattern
    const link = document.createElement("link");
    link.rel = "stylesheet";
    // Add a cache-busting query param (build id or timestamp)
    link.href = `/non-critical.css?v=${process.env.NEXT_PUBLIC_BUILD_ID || Date.now()}`;
    // Start as non-blocking
    link.media = "print";
    link.setAttribute("data-noncritical", "1");

    link.onload = () => {
      link.media = "all";
    };

    document.head.appendChild(link);

    // Cleanup function
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  return null;
}
