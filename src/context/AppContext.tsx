// filepath: /c:/Users/Usuario/Documents/AAA_REPOs/mosaic/src/context/AppContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface AppContextProps {
  isMosaic: boolean;
  toggleView: (viewModus: string) => void;
}
const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isMosaic, setIsMosaic] = useState(false);

  const toggleView = (viewModus: string) => {
    setIsMosaic(viewModus === "mosaic");
  };

  return (
    <AppContext.Provider value={{ isMosaic, toggleView }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
