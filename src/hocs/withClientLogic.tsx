"use client";

import React, { useEffect, JSX } from "react";

export function withClientLogic<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.ComponentType<P>
) {
  return function EnhancedComponent(props: P) {
    useEffect(() => {
      // Session Storage Logic
      const ageConfirmed = sessionStorage.getItem("isMinimumAgeConfirmed");
      if (!ageConfirmed) {
        console.log("Age confirmation is required.");
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
}
