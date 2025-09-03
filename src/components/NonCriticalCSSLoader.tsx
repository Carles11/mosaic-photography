"use client";

import { useEffect } from "react";

export default function NonCriticalCSSLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/non-critical.css?v=${process.env.NEXT_PUBLIC_BUILD_ID || Date.now()}`;
    link.media = "print";
    link.setAttribute("data-noncritical", "1");
    link.onload = () => {
      link.media = "all";
    };
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);
  return null;
}
