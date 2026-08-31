import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type {
  ProductFeatureSection,
  ProductListSection,
  ProductPageContent,
  ProductTextSection,
} from "@/lib/content/products";
import styles from "./ProductPageTemplate.module.css";

export interface ProductSectionVisuals {
  whyWeBuiltIt?: ReactNode;
  theProblem?: ReactNode;
  productVision?: ReactNode;
  overview?: ReactNode;
  whatItDoes?: ReactNode;
  experience?: ReactNode;
  howItWorks?: ReactNode;
  trust?: ReactNode;
  engineering?: ReactNode;
  whereWereGoing?: ReactNode;
}

interface ProductPageTemplateProps {
  content: ProductPageContent;
  /** Optional decorative visual rendered beside the hero copy — a React node, not content data, since it's not serializable. */
  heroVisual?: ReactNode;
  /** Optional per-section companion visuals, same reasoning as heroVisual — generic, not product-specific. */
  sectionVisuals?: ProductSectionVisuals;
  /**
   * P4.2: opt-in per-section layout override. Listing a section here renders
   * its companion visual full-width below the heading/content instead of the
   * default two-column story row — for a visual that needs to read as a
   * flagship moment (e.g. a large realistic product photo) rather than a
   * companion illustration squeezed into a ~0.85fr grid column. Purely
   * additive: omitted entirely (every product/section today), rendering is
   * identical to before this option existed — `reverse` is simply ignored
   * for a listed section since there's only one column to place things in.
   */
  stackedVisualSections?: ("theProblem" | "overview" | "experience" | "engineering")[];
}

/** Shared two-column story-row wrapper (P2.3) — every section type below
 * builds its className the same way, so column ratio/gap/alignment can
 * never drift per-section (see styles.storyRow in the CSS module). */
function storyRowClass(visual: ReactNode | undefined, reverse: boolean | undefined) {
  return `${styles.storyRow} ${visual ? styles.hasVisual : ""} ${visual && reverse ? styles.reverseVisual : ""}`;
}

function TextBlock({
  id,
  eyebrow,
  section,
  visual,
  reverse,
  spacing = "compact",
  editorial = false,
  stacked = false,
}: {
  id: string;
  eyebrow: string;
  section: ProductTextSection;
  visual?: ReactNode;
  reverse?: boolean;
  spacing?: "default" | "compact";
  /** A visual-less TextBlock reads as a deliberate editorial pause instead
   * of a narrow paragraph lost in a wide container: wider reading column,
   * centered within the page rather than left-anchored. Generic — any
   * product's breathing section can opt in, not just Mindra's. */
  editorial?: boolean;
  /** P4.2: renders `visual` full-width below the heading instead of beside
   * it in the two-column story row. See `stackedVisualSections` above. */
  stacked?: boolean;
}) {
  if (stacked && visual) {
    return (
      <Section id={id} spacing={spacing}>
        <Container>
          <div className={styles.stackedBlock}>
            <SectionHeading eyebrow={eyebrow} title={section.title} description={section.body} />
            <div className={styles.stackedVisual}>{visual}</div>
          </div>
        </Container>
      </Section>
    );
  }

  const row = `${storyRowClass(visual, reverse)} ${!visual && editorial ? styles.editorial : ""}`;
  return (
    <Section id={id} spacing={spacing}>
      <Container>
        <div className={row}>
          <SectionHeading
            eyebrow={eyebrow}
            title={section.title}
            description={section.body}
            className={!visual && editorial ? styles.editorialHeading : undefined}
          />
          {visual ? <div className={styles.sectionVisual}>{visual}</div> : null}
        </div>
      </Container>
    </Section>
  );
}

function ListBlock({
  id,
  eyebrow,
  section,
  visual,
  reverse,
  tone,
  stacked = false,
}: {
  id: string;
  eyebrow: string;
  section: ProductListSection;
  visual?: ReactNode;
  reverse?: boolean;
  /** "subtle" wraps the heading+badges in a very light surface panel — a
   * restrained way to distinguish two adjacent, otherwise near-identical
   * ListBlock sections (e.g. a trust/privacy list next to an engineering
   * list) without a new diagram. Generic, not tied to any one product. */
  tone?: "plain" | "subtle";
  /** P4.2: renders `visual` full-width below the heading/badges instead of
   * beside them in the two-column story row. See `stackedVisualSections`. */
  stacked?: boolean;
}) {
  const content = (
    <div className={`${styles.storyContent} ${tone === "subtle" ? styles.storyContentSubtle : ""}`}>
      <SectionHeading eyebrow={eyebrow} title={section.title} />
      <div className={styles.itemRow}>
        {section.items.map((item) => (
          <Badge key={item} variant="neutral">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );

  if (stacked && visual) {
    return (
      <Section id={id} spacing="compact">
        <Container>
          <div className={styles.stackedBlock}>
            {content}
            <div className={styles.stackedVisual}>{visual}</div>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section id={id} spacing="compact">
      <Container>
        <div className={storyRowClass(visual, reverse)}>
          {content}
          {visual ? <div className={styles.sectionVisual}>{visual}</div> : null}
        </div>
      </Container>
    </Section>
  );
}

function FeatureBlock({
  id,
  eyebrow,
  section,
  visual,
  reverse,
}: {
  id: string;
  eyebrow: string;
  section: ProductFeatureSection;
  visual?: ReactNode;
  reverse?: boolean;
}) {
  return (
    <Section id={id} spacing="compact">
      <Container>
        <div className={storyRowClass(visual, reverse)}>
          <div className={styles.storyContent}>
            <SectionHeading eyebrow={eyebrow} title={section.title} />
            <div className={styles.featureGrid}>
              {section.items.map((item) => (
                <div key={item.name} className={styles.featureItem}>
                  <p className="text-h4">{item.name}</p>
                  <p className={`text-body-sm ${styles.featureDescription}`}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          {visual ? <div className={styles.sectionVisual}>{visual}</div> : null}
        </div>
      </Container>
    </Section>
  );
}

/**
 * The frozen ten-part product-story structure (Products Index / Template
 * milestone §7): Product Hero, Why We Built It, The Problem, Product Vision,
 * What It Does, Experience, How It Works, Engineering, Where We're Going,
 * CTA. Hero and CTA always render; the eight middle sections render only
 * when a product actually supplies content for them — nothing here is
 * product-specific, every section is driven entirely by the `content` prop
 * (verified by ProductPageTemplate.test.tsx's generic-content-object case).
 * Each section carries a stable anchor id so a hero CTA can link deeper into
 * the page (e.g. "#what-it-does") instead of exposing a separate route.
 *
 * `sectionVisuals` (P2.1) lets a product pass a companion visual per
 * section — purely presentational, generic across any future product. The
 * template itself makes no accessibility decision for these: each visual
 * component is responsible for its own aria-hidden/real-text tradeoff
 * (decorative SVG shapes hidden; any label unique to the diagram kept as
 * real, accessible text rather than baked into hidden SVG `<text>`).
 *
 * P2.2: at desktop, section visuals alternate left/right by section (a
 * fixed, generic rhythm decision — not a per-product option) so a page with
 * several visual sections reads as a zigzag story rather than a repeated
 * "text left, image right" pattern. Mobile/tablet always keep text before
 * visual regardless of this, since `reverse` only takes effect inside the
 * template's desktop-only CSS breakpoint.
 *
 * P2.3: TextBlock, ListBlock and FeatureBlock all build their row through
 * the same `storyRowClass` helper and the same `.storyRow`/`.hasVisual`/
 * `.reverseVisual` CSS, so no section can end up with its own column ratio,
 * gap or alignment rule. ListBlock/FeatureBlock now wrap their heading
 * together with the badges/feature grid in one `.storyContent` column
 * (previously the heading sat outside the two-column row entirely, which is
 * why a companion visual centered against the row below the heading instead
 * of against the section's whole content block). Product Vision is the
 * template's one deliberately visual-less "breathing" section, so it alone
 * uses `spacing="default"` instead of "compact" — a second, intentional
 * spacing tier for a genuine pause, not a one-off gap invented per section.
 *
 * P3: added one new optional slot, `trust` (a ListBlock, same shape as
 * `engineering`), between How It Works and Engineering. Named generically —
 * any product with a real privacy/security story can use it, not just
 * Mindra — so the frozen ten-part structure gains an eleventh optional slot
 * rather than a Mindra-specific field being hard-coded into the contract.
 *
 * P3.1: two more generic, opt-in row treatments. `editorial` (TextBlock) —
 * only meaningful without a visual — widens and centers the reading column
 * so a text-only "breathing" section reads as a deliberate pause instead of
 * a narrow paragraph in a wide empty container; used by Product Vision.
 * `tone="subtle"` (ListBlock) wraps the heading+badges in a very light
 * surface panel so two adjacent, structurally-identical ListBlock sections
 * (e.g. a trust list next to an engineering list) can read as visually
 * distinct without a new diagram; used by `trust`, not `engineering`, so
 * the two keep a subtle surface difference on any product that has both.
 *
 * P5.1: added one more optional slot, `overview` (a TextBlock, same shape
 * as `productVision`/`whyWeBuiltIt`), between Product Vision and What It
 * Does — for a product that wants one especially large "see it all
 * together" flagship visual bridging the brand statement and the capability
 * grid (Arooraa Smart Home's two-floor home-at-a-glance illustration). Named
 * generically, like `trust` before it, so any future product can use the
 * same slot; omitted entirely by MESA/Mindra/Smart Mirror.
 */
export function ProductPageTemplate({
  content,
  heroVisual,
  sectionVisuals,
  stackedVisualSections,
}: ProductPageTemplateProps) {
  const stacked = new Set(stackedVisualSections ?? []);
  return (
    <main>
      <Section id="hero" spacing="default">
        <Container width={heroVisual ? "wide" : "content"}>
          <div className={heroVisual ? styles.heroGrid : undefined}>
            <div className={styles.hero}>
              {content.hero.eyebrow ? <Eyebrow>{content.hero.eyebrow}</Eyebrow> : null}
              <h1 className="text-display">{content.hero.title}</h1>
              {content.hero.status ? <Badge variant="accent">{content.hero.status}</Badge> : null}
              <p className="text-body-lg">{content.hero.supporting}</p>
              {content.hero.primaryCta || content.hero.secondaryCta ? (
                <div className={styles.heroCtaRow}>
                  {content.hero.primaryCta ? (
                    <Button href={content.hero.primaryCta.href} variant="primary">
                      {content.hero.primaryCta.label}
                    </Button>
                  ) : null}
                  {content.hero.secondaryCta ? (
                    <Button href={content.hero.secondaryCta.href} variant="secondary">
                      {content.hero.secondaryCta.label}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
            {heroVisual ? (
              <div className={styles.heroVisual} aria-hidden="true">
                {heroVisual}
              </div>
            ) : null}
          </div>
        </Container>
      </Section>

      {content.whyWeBuiltIt ? (
        <TextBlock
          id="why-we-built-it"
          eyebrow="Why We Built It"
          section={content.whyWeBuiltIt}
          visual={sectionVisuals?.whyWeBuiltIt}
        />
      ) : null}
      {content.theProblem ? (
        <TextBlock
          id="the-problem"
          eyebrow="The Problem"
          section={content.theProblem}
          visual={sectionVisuals?.theProblem}
          reverse
          stacked={stacked.has("theProblem")}
        />
      ) : null}
      {content.productVision ? (
        <TextBlock
          id="product-vision"
          eyebrow="Product Vision"
          section={content.productVision}
          visual={sectionVisuals?.productVision}
          spacing="default"
          editorial
        />
      ) : null}
      {content.overview ? (
        <TextBlock
          id="overview"
          eyebrow="Overview"
          section={content.overview}
          visual={sectionVisuals?.overview}
          stacked={stacked.has("overview")}
        />
      ) : null}
      {content.whatItDoes ? (
        <FeatureBlock
          id="what-it-does"
          eyebrow="What It Does"
          section={content.whatItDoes}
          visual={sectionVisuals?.whatItDoes}
        />
      ) : null}
      {content.experience ? (
        <TextBlock
          id="experience"
          eyebrow="Experience"
          section={content.experience}
          visual={sectionVisuals?.experience}
          reverse
          stacked={stacked.has("experience")}
        />
      ) : null}
      {content.howItWorks ? (
        <ListBlock
          id="how-it-works"
          eyebrow="How It Works"
          section={content.howItWorks}
          visual={sectionVisuals?.howItWorks}
        />
      ) : null}
      {content.trust ? (
        <ListBlock
          id="privacy-trust"
          eyebrow="Privacy & Trust"
          section={content.trust}
          visual={sectionVisuals?.trust}
          tone="subtle"
        />
      ) : null}
      {content.engineering ? (
        <ListBlock
          id="engineering"
          eyebrow="Engineering"
          section={content.engineering}
          visual={sectionVisuals?.engineering}
          stacked={stacked.has("engineering")}
        />
      ) : null}
      {content.whereWereGoing ? (
        <TextBlock
          id="where-were-going"
          eyebrow="Where We're Going"
          section={content.whereWereGoing}
          visual={sectionVisuals?.whereWereGoing}
        />
      ) : null}

      <Section id="cta" tone="dark" spacing="default">
        <Container width="content">
          <SectionHeading
            title={content.cta.title ?? content.cta.primary.label}
            description={content.cta.supporting}
            align="center"
          />
          <div className={styles.ctaActions}>
            <Button href={content.cta.primary.href} variant="primary">
              {content.cta.primary.label}
            </Button>
            {content.cta.secondary ? (
              <Button href={content.cta.secondary.href} variant="secondary">
                {content.cta.secondary.label}
              </Button>
            ) : null}
          </div>
        </Container>
      </Section>
    </main>
  );
}
