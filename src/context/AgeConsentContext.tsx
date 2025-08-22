"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AgeConsentContext = createContext<{
  isMinimumAgeConfirmed: boolean;
  setIsMinimumAgeConfirmed: (value: boolean) => void;
}>({
  isMinimumAgeConfirmed: false,
  setIsMinimumAgeConfirmed: () => {},
});

export const useAgeConsent = () => useContext(AgeConsentContext);

export const AgeConsentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMinimumAgeConfirmed, setIsMinimumAgeConfirmed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ageConfirmed = sessionStorage.getItem("isMinimumAgeConfirmed");
      if (ageConfirmed === "true") {
        setIsMinimumAgeConfirmed(true);
      }
    }
  }, []);

  const handleAgeConfirmation = (value: boolean) => {
    setIsMinimumAgeConfirmed(value);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("isMinimumAgeConfirmed", value.toString());
    }
  };

  // Optionally memoize the context value to avoid unnecessary re-renders
  // const contextValue = useMemo(() => ({ isMinimumAgeConfirmed, setIsMinimumAgeConfirmed: handleAgeConfirmation }), [isMinimumAgeConfirmed]);

  return (
    <AgeConsentContext.Provider
      value={{
        isMinimumAgeConfirmed,
        setIsMinimumAgeConfirmed: handleAgeConfirmation,
      }}
    >
      {children}
    </AgeConsentContext.Provider>
  );
};
