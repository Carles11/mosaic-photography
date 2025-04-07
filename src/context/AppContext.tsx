// filepath: /c:/Users/Usuario/Documents/AAA_REPOs/mosaic/src/context/AppContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface AppContextProps {
  isMosaic: boolean;
  toggleView: (viewModus: string) => void;
}
const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [isMosaic, setIsMosaic] = useState(true);

  const toggleView = (viewModus: string) => {
    setIsMosaic(viewModus === "authors");
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
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
