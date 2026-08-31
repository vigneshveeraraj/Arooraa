import type { ElementType, ReactNode } from "react";
import styles from "./Container.module.css";

type ContainerWidth = "content" | "wide" | "full";

interface ContainerProps {
  /** content = long-form reading measure, wide = default site container, full = no max-width. */
  width?: ContainerWidth;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Container({ width = "wide", as: Tag = "div", className, children }: ContainerProps) {
  const widthClass = width === "content" ? styles.content : width === "full" ? styles.full : styles.wide;
  return <Tag className={[styles.container, widthClass, className].filter(Boolean).join(" ")}>{children}</Tag>;
}
