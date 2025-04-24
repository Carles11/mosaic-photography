"use client";

import React, { useEffect, JSX } from "react";

export function withClientLogic<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.ComponentType<P>
) {
  return function EnhancedComponent(props: P) {
    useEffect(() => {
      // Service Worker Registration
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/workbox-e43f5367.js")
            .then((registration) => {
              console.log("SW registered: ", registration);
            })
            .catch((registrationError) => {
              console.error("SW registration failed: ", registrationError);
            });
        });
      }

      // Session Storage Logic
      const ageConfirmed = sessionStorage.getItem("isMinimumAgeConfirmed");
      if (!ageConfirmed) {
        console.log("Age confirmation is required.");
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
}
