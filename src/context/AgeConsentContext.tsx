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
    // Check sessionStorage for age confirmation
    const ageConfirmed = sessionStorage.getItem("isMinimumAgeConfirmed");
    if (ageConfirmed === "true") {
      setIsMinimumAgeConfirmed(true);
    }
    setIsCheckingSession(false); // Ensure the modal doesn't disappear prematurely
  }, []);

  const handleAgeConfirmation = (value: boolean) => {
    setIsMinimumAgeConfirmed(value);
    sessionStorage.setItem("isMinimumAgeConfirmed", value.toString());
  };

  if (isCheckingSession) {
    return null; // Don't render anything until session check is complete
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
