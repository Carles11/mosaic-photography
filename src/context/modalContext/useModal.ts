"use client";

import { useContext } from "react";
import { ModalContext, ModalContextValue } from "./ModalProvider";

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx as ModalContextValue;
}
