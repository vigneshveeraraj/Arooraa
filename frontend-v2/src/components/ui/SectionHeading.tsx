import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={[styles.heading, align === "center" ? styles.center : "", className].filter(Boolean).join(" ")}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className={["text-h2", styles.title].join(" ")}>{title}</h2>
      {description ? <p className={["text-body-lg", styles.description].join(" ")}>{description}</p> : null}
    </div>
  );
}
