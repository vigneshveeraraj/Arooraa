import type { ReactNode } from "react";
import styles from "./Eyebrow.module.css";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return <p className={["text-eyebrow", styles.eyebrow, className].filter(Boolean).join(" ")}>{children}</p>;
}
