"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define the context and its type
const AgeConsentContext = createContext<{
  isMinimumAgeConfirmed: boolean;
  setIsMinimumAgeConfirmed: (value: boolean) => void;
} | null>(null);

export const useAgeConsent = () => {
  const context = useContext(AgeConsentContext);
  if (!context) {
    throw new Error("useAgeConsent must be used within an AgeConsentProvider");
  }
  return context;
};

export const AgeConsentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMinimumAgeConfirmed, setIsMinimumAgeConfirmed] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Check sessionStorage for age confirmation (only on client-side)
    if (typeof window !== "undefined") {
      const ageConfirmed = sessionStorage.getItem("isMinimumAgeConfirmed");
      if (ageConfirmed === "true") {
        setIsMinimumAgeConfirmed(true);
      }
    }
    setIsCheckingSession(false); // Ensure the modal doesn't disappear prematurely
  }, []);

  const handleAgeConfirmation = (value: boolean) => {
    setIsMinimumAgeConfirmed(value);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("isMinimumAgeConfirmed", value.toString());
    }
  };

  if (isCheckingSession) {
    return (
      <AgeConsentContext.Provider
        value={{
          isMinimumAgeConfirmed: false,
          setIsMinimumAgeConfirmed: () => {},
        }}
      >
        {children}
      </AgeConsentContext.Provider>
    ); // Provide context even during initial check
  }

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
