import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import type { WorkStory } from "@/lib/content/our-work";
import styles from "./FeaturedWorkStory.module.css";

interface FeaturedWorkStoryProps {
  story: WorkStory;
  visual: ReactNode;
  /** flagship = MESA's larger treatment; standard = Mindra/Smart Home's two-column story;
   * cinematic = Smart Mirror's full-width, dark, visual-led treatment. */
  variant: "flagship" | "standard" | "cinematic";
  /** standard variant only — puts the visual on the left at desktop instead of the right,
   * without changing DOM/reading order (content stays first for assistive tech). */
  reverse?: boolean;
  /** flagship variant only — an extra full-width editorial band rendered below the split. */
  band?: ReactNode;
}

function StoryFields({ story }: { story: WorkStory }) {
  const fields = [
    { label: story.problemLabel, body: story.problem },
    { label: "PRODUCT THINKING", body: story.productThinking },
    { label: story.builtLabel, body: story.built },
    { label: "ENGINEERING CHALLENGE", body: story.engineeringChallenge },
  ];
  return (
    <dl className={styles.fields}>
      {fields.map((field) => (
        <div key={field.label} className={styles.field}>
          <dt className={styles.fieldLabel}>{field.label}</dt>
          <dd className={`text-body ${styles.fieldBody}`}>{field.body}</dd>
        </div>
      ))}
    </dl>
  );
}

function StoryFooter({ story }: { story: WorkStory }) {
  return (
    <div className={styles.footer}>
      <div className={styles.maturityRow}>
        <span className={styles.maturityBadge}>{story.maturity.label}</span>
        <p className={`text-body-sm ${styles.maturityDescription}`}>{story.maturity.description}</p>
      </div>
      <div className={styles.demonstrates}>
        <p className={styles.fieldLabel}>WHAT IT DEMONSTRATES</p>
        <p className={`text-body ${styles.fieldBody}`}>{story.demonstrates}</p>
      </div>
      <div className={styles.footerActions}>
        <Button href={story.relatedProduct.href} variant="secondary">
          {story.relatedProduct.label}
        </Button>
        {story.engineeringStory ? (
          <Button href={story.engineeringStory.href} variant="ghost">
            {story.engineeringStory.label}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The reusable per-project story layout (W1) — large project number, eyebrow,
 * title and lead, a plain-language `<dl>` of problem/product-thinking/built/
 * engineering-challenge (deliberately not feature cards), and a footer strip
 * with an honest maturity badge, "what it demonstrates" and a link to the
 * existing product page. Three variants give the four stories genuinely
 * different rhythm without four bespoke layouts: "flagship" (MESA — larger
 * number/title, wider visual, room for an extra band below), "standard"
 * (Mindra/Smart Home — a two-column split that can alternate sides via
 * `reverse`), and "cinematic" (Smart Mirror — full-width, dark, visual on
 * top). Every variant is a real <article> with its own <h2>, so the page
 * keeps one h1 (WorkHero) and four project h2s.
 */
export function FeaturedWorkStory({ story, visual, variant, reverse = false, band }: FeaturedWorkStoryProps) {
  const header = (
    <div className={styles.header}>
      <p className={`${styles.number} ${variant === "flagship" ? styles.numberFlagship : ""}`} aria-hidden="true">
        {story.number}
      </p>
      <Eyebrow>{story.eyebrow}</Eyebrow>
      <h2 className={`${variant === "flagship" ? "text-display" : "text-h1"} ${styles.title}`}>{story.title}</h2>
      <p className={`text-body-lg ${styles.lead}`}>{story.lead}</p>
    </div>
  );

  if (variant === "cinematic") {
    return (
      <Section id={story.slug} tone="dark" spacing="default" as="article">
        <Container width="wide">
          <div className={styles.storyContainer}>
            {header}
            <div className={styles.cinematicVisual}>{visual}</div>
            <div className={styles.cinematicBody}>
              <StoryFields story={story} />
              <StoryFooter story={story} />
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section id={story.slug} tone="light" spacing="default" as="article">
      <Container width="wide">
        <div className={`${styles.storyContainer} ${variant === "flagship" ? styles.storyContainerFlagship : ""}`}>
          <div
            className={[
              styles.split,
              variant === "flagship" ? styles.splitFlagship : styles.splitStandard,
              reverse ? styles.reverse : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles.content}>
              {header}
              <StoryFields story={story} />
              <StoryFooter story={story} />
            </div>
            <div className={styles.visual}>{visual}</div>
          </div>
          {band ? <div className={styles.band}>{band}</div> : null}
        </div>
      </Container>
    </Section>
  );
}
