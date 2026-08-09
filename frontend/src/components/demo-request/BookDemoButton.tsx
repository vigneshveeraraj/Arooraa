"use client";

import type { ReactNode } from "react";
import { useDemoModal } from "./DemoModalContext";

interface BookDemoButtonProps {
  children: ReactNode;
  className?: string;
}

export function BookDemoButton({ children, className }: BookDemoButtonProps) {
  const { open } = useDemoModal();

  return (
    <button type="button" className={className} onClick={open}>
      {children}
    </button>
  );
}
