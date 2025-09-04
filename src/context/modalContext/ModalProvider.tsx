"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import ModalShell from "@/components/modals/ModalShell";
import { modalRegistry } from "./modalRegistry";

type ModalEntry = {
  id: string;
  Component: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
  resolver?: (value?: unknown) => void;
};

export type ModalContextValue = {
  open: (key: string, props?: Record<string, unknown>) => string | null;
  openAsync: <T = unknown>(
    key: string,
    props?: Record<string, unknown>,
  ) => Promise<T>;
  close: (id?: string, result?: unknown) => void;
};

// Export a loosely typed context so hooks can import it without strict generics
export const ModalContext = createContext<ModalContextValue | undefined>(
  undefined,
);

export function useInternalModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("ModalProvider missing");
  return ctx;
}

export const ModalProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [stack, setStack] = useState<ModalEntry[]>([]);
  const idCounter = useRef(0);

  const open = useCallback((key: string, props?: Record<string, unknown>) => {
    const loader = modalRegistry[key];
    if (!loader) {
      console.warn(`Modal loader not found for key: ${key}`);
      return null;
    }

    const id = `modal_${++idCounter.current}`;

    // Start loading component async and push a placeholder entry so we can show a loader if needed
    loader().then((mod) => {
      setStack((s) => [...s, { id, Component: mod.default, props }]);
    });

    return id;
  }, []);

  const openAsync = useCallback(
    <T,>(key: string, props?: Record<string, unknown>) => {
      return new Promise<T>((resolve) => {
        const loader = modalRegistry[key];
        if (!loader) {
          console.warn(`Modal loader not found for key: ${key}`);
          resolve(undefined as unknown as T);
          return;
        }

        const id = `modal_${++idCounter.current}`;

        loader().then((mod) => {
          // resolver will be called with unknown; safe to assign
          setStack((s) => [
            ...s,
            {
              id,
              Component: mod.default,
              props,
              resolver: resolve as (v?: unknown) => void,
            },
          ]);
        });
      });
    },
    [],
  );

  const close = useCallback((id?: string, result?: unknown) => {
    setStack((s) => {
      if (!id) {
        const last = s[s.length - 1];
        if (last && last.resolver) last.resolver(result);
        return s.slice(0, -1);
      }
      const idx = s.findIndex((e) => e.id === id);
      if (idx === -1) return s;
      const entry = s[idx];
      if (entry && entry.resolver) entry.resolver(result);
      return [...s.slice(0, idx), ...s.slice(idx + 1)];
    });
  }, []);

  // Scroll lock when stack has at least one modal
  useEffect(() => {
    const original = document.body.style.overflow;
    if (stack.length > 0) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [stack.length]);

  // Render modals into #modal-root
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setPortalRoot(document.getElementById("modal-root"));
  }, []);

  return (
    <ModalContext.Provider value={{ open, openAsync, close }}>
      {children}
      {portalRoot &&
        createPortal(
          <>
            {stack.map((entry) => (
              <ModalShell key={entry.id} isOpen onClose={() => close(entry.id)}>
                <entry.Component
                  {...(entry.props as Record<string, unknown>)}
                  onClose={(res?: unknown) => close(entry.id, res)}
                />
              </ModalShell>
            ))}
          </>,
          portalRoot,
        )}
    </ModalContext.Provider>
  );
};
