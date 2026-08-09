"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface DemoModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const DemoModalContext = createContext<DemoModalContextValue | null>(null);

export function DemoModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return <DemoModalContext.Provider value={value}>{children}</DemoModalContext.Provider>;
}

export function useDemoModal() {
  const ctx = useContext(DemoModalContext);
  if (!ctx) {
    throw new Error("useDemoModal must be used within a DemoModalProvider");
  }
  return ctx;
}
