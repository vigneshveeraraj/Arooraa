import { keepSuffix } from "./keepSuffix";
import ui from "./ui.module.css";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  /** Set when the title/lead are Tamil-grammar copy (see content.ts). */
  lang?: "ta";
  centered?: boolean;
};

/** Eyebrow + h2 + optional lead. The h2's id labels the surrounding section. */
export function SectionHeading({ id, eyebrow, title, lead, lang, centered = false }: SectionHeadingProps) {
  return (
    <header className={`${ui.heading} ${centered ? ui.headingCentered : ""}`}>
      <p className={ui.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={ui.title} lang={lang}>
        {keepSuffix(title)}
      </h2>
      {lead ? (
        <p className={ui.lead} lang={lang}>
          {keepSuffix(lead)}
        </p>
      ) : null}
    </header>
  );
}
