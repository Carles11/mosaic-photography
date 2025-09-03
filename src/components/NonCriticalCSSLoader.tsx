"use client";

import { useEffect } from "react";

export default function NonCriticalCSSLoader() {
  useEffect(() => {
    // Create link element for non-critical CSS using media-switch pattern
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/non-critical.css";
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
