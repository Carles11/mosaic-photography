"use client";

import { useEffect } from "react";

export default function NonCriticalCSSLoader() {
  useEffect(() => {
    // Create link element for non-critical CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/non-critical.css";
    link.media = "print";

    // Switch media to 'all' once loaded
    link.onload = () => {
      link.media = "all";
    };

    // Add to head
    document.head.appendChild(link);

    // Cleanup function
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return null;
}
