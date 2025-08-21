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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const ageConfirmed = sessionStorage.getItem("isMinimumAgeConfirmed");
    if (ageConfirmed === "true") {
      setIsMinimumAgeConfirmed(true);
    }
  }, []);

  const handleAgeConfirmation = (value: boolean) => {
    setIsMinimumAgeConfirmed(value);
    if (isClient) {
      sessionStorage.setItem("isMinimumAgeConfirmed", value.toString());
    }
  };

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
