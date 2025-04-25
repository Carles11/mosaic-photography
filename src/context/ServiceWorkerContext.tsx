"use client";

import React, { useEffect } from "react";

export const ServiceWorkerContext = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return <>{children}</>;
};
