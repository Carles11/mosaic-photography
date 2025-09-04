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
import { modalRegistry, ModalKey, ModalPropsMap } from "./modalRegistry";

// Internal entry - keep flexible so the stack can hold any modal shape
type ModalEntry = {
  id: string;
  Component: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
  resolver?: (value?: unknown) => void;
};

export type ModalContextValue = {
  open: <K extends ModalKey>(key: K, props?: ModalPropsMap[K]) => string | null;
  openAsync: <K extends ModalKey, T = unknown>(
    key: K,
    props?: ModalPropsMap[K],
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

  const open = useCallback(
    <K extends ModalKey>(key: K, props?: ModalPropsMap[K]) => {
      const loader = modalRegistry[key];
      if (!loader) {
        console.warn(`Modal loader not found for key: ${key}`);
        return null;
      }

      const id = `modal_${++idCounter.current}`;

      // Start loading component async and push the loaded component when ready
      loader().then((mod) => {
        // cast loaded component to a component accepting object props
        const Component = mod.default as unknown as React.ComponentType<
          Record<string, unknown>
        >;
        setStack((s) => [...s, { id, Component, props }]);
      });

      return id;
    },
    [],
  );

  const openAsync = useCallback(
    <K extends ModalKey, T = unknown>(key: K, props?: ModalPropsMap[K]) => {
      return new Promise<T>((resolve) => {
        const loader = modalRegistry[key];
        if (!loader) {
          console.warn(`Modal loader not found for key: ${key}`);
          resolve(undefined as unknown as T);
          return;
        }

        const id = `modal_${++idCounter.current}`;

        loader().then((mod) => {
          const Component = mod.default as unknown as React.ComponentType<
            Record<string, unknown>
          >;
          // resolver will be called with unknown; safe to assign
          setStack((s) => [
            ...s,
            {
              id,
              Component,
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
            {stack.map((entry) => {
              const Comp = entry.Component as React.ComponentType<unknown>;
              return (
                <ModalShell
                  key={entry.id}
                  isOpen
                  onClose={() => close(entry.id)}
                >
                  {(() => {
                    const propsObj: Record<string, unknown> = {
                      ...(entry.props ?? {}),
                      onClose: (res?: unknown) => close(entry.id, res),
                    };
                    return <Comp {...propsObj} />;
                  })()}
                </ModalShell>
              );
            })}
          </>,
          portalRoot,
        )}
    </ModalContext.Provider>
  );
};
