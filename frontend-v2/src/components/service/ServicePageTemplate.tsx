import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import type { ReactNode } from "react";
import type {
  ServiceCapabilitySection,
  ServiceComparisonSection,
  ServiceFaqSection,
  ServiceListSection,
  ServicePageContent,
  ServiceSectionVisuals,
  ServiceTextSection,
} from "@/lib/content/service-page";
import styles from "./ServicePageTemplate.module.css";

function SectionVisual({ visual }: { visual?: ReactNode }) {
  return visual ? <div className={styles.sectionVisual}>{visual}</div> : null;
}

function TextBlock({
  id,
  eyebrow,
  section,
  visual,
}: {
  id: string;
  eyebrow: string;
  section: ServiceTextSection;
  visual?: ReactNode;
}) {
  const heading = (
    <SectionHeading eyebrow={section.eyebrow ?? eyebrow} title={section.title} description={section.body} />
  );

  if (section.layout === "featured" && visual) {
    return (
      <Section id={id} tone={section.tone ?? "light"} spacing="compact">
        <Container width="wide">
          <div className={styles.serviceContainer}>
            <div className={styles.featuredSplit}>
              {heading}
              <div className={styles.featuredVisual}>{visual}</div>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section id={id} tone={section.tone ?? "light"} spacing="compact">
      <Container width="wide">
        <div className={styles.serviceContainer}>
          {heading}
          <SectionVisual visual={visual} />
        </div>
      </Container>
    </Section>
  );
}

function ListBlock({
  id,
  eyebrow,
  section,
  tone,
  visual,
  layout = "stacked",
}: {
  id: string;
  eyebrow: string;
  section: ServiceListSection;
  tone?: "plain" | "subtle";
  visual?: ReactNode;
  /** "split" puts the heading beside its list instead of above it — for a
   * list that reads more like a second column of content (e.g. Discovery
   * Sprint's activities) than a wrapped item grid. Opt-in; default matches
   * every ListBlock's prior behavior. */
  layout?: "stacked" | "split";
}) {
  const list = (
    <ul className={`${styles.plainList} ${layout === "split" ? styles.splitList : ""}`}>
      {section.items.map((item) => (
        <li key={item} className={styles.plainListItem}>
          {item}
        </li>
      ))}
    </ul>
  );
  const note = section.note ? <p className={styles.listNote}>{section.note}</p> : null;

  return (
    <Section id={id} spacing="compact">
      <Container width="wide">
        <div className={styles.serviceContainer}>
          <div className={tone === "subtle" ? styles.subtlePanel : undefined}>
            {layout === "split" ? (
              <div className={styles.splitRow}>
                <SectionHeading eyebrow={section.eyebrow ?? eyebrow} title={section.title} />
                <div>
                  {list}
                  {note}
                </div>
              </div>
            ) : (
              <>
                <SectionHeading eyebrow={section.eyebrow ?? eyebrow} title={section.title} />
                {list}
                {note}
              </>
            )}
          </div>
          <SectionVisual visual={visual} />
        </div>
      </Container>
    </Section>
  );
}

function CapabilityBlock({
  id,
  eyebrow,
  section,
  visual,
  columns = 2,
}: {
  id: string;
  eyebrow: string;
  section: ServiceCapabilitySection;
  visual?: ReactNode;
  /** Opt-in wider grid for a short proof row (e.g. related-work's four
   * products); every other CapabilityBlock keeps the default two columns. */
  columns?: 2 | 4;
}) {
  return (
    <Section id={id} spacing="compact">
      <Container width="wide">
        <div className={styles.serviceContainer}>
          <SectionHeading eyebrow={section.eyebrow ?? eyebrow} title={section.title} />
          <div className={`${styles.capabilityGrid} ${columns === 4 ? styles.capabilityGridWide : ""}`}>
            {section.items.map((item) => (
              <div key={item.name} className={styles.capabilityItem}>
                <p className="text-h4">{item.name}</p>
                <p className={`text-body-sm ${styles.capabilityDescription}`}>{item.description}</p>
              </div>
            ))}
          </div>
          {section.note ? <p className={styles.listNote}>{section.note}</p> : null}
          <SectionVisual visual={visual} />
        </div>
      </Container>
    </Section>
  );
}

function ComparisonBlock({
  id,
  eyebrow,
  section,
  visual,
}: {
  id: string;
  eyebrow: string;
  section: ServiceComparisonSection;
  visual?: ReactNode;
}) {
  return (
    <Section id={id} spacing="compact">
      <Container width="wide">
        <div className={styles.serviceContainer}>
          <SectionHeading eyebrow={section.eyebrow ?? eyebrow} title={section.title} />
          <div className={styles.comparisonGrid}>
            {[section.left, section.right].map((side) => (
              <div key={side.label} className={styles.comparisonSide}>
                <p className={styles.comparisonLabel}>{side.label}</p>
                <ul className={styles.comparisonList}>
                  {side.items.map((item) => (
                    <li key={item} className={styles.comparisonListItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <SectionVisual visual={visual} />
        </div>
      </Container>
    </Section>
  );
}

function FaqBlock({ id, eyebrow, section }: { id: string; eyebrow: string; section: ServiceFaqSection }) {
  return (
    <Section id={id} spacing="compact">
      <Container width="wide">
        <div className={styles.serviceContainer}>
          <SectionHeading eyebrow={eyebrow} title={section.title} />
          <dl className={styles.faqList}>
            {section.items.map((item) => (
              <div key={item.question} className={styles.faqItem}>
                <dt className={styles.faqQuestion}>{item.question}</dt>
                <dd className={styles.faqAnswer}>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}

/**
 * The shared service-detail-page architecture (S1). Mirrors
 * ProductPageTemplate's own conventions (Section/Container/SectionHeading,
 * optional middle sections, stable per-section anchor ids) without a
 * visual/image slot system — service pages are text/list-led by design, not
 * lifestyle-visual-led like the product pages. Every middle section is
 * optional; only Hero and CTA always render, matching ProductPageTemplate's
 * own "don't force empty sections" rule.
 *
 * S1 validated this template with a test-only fake ServicePageContent
 * object; S2 (Product Strategy & Discovery) is the first real page and
 * added the optional `sectionVisuals` prop below plus upgraded
 * audience/outcomes/relatedWork to the richer CapabilityBlock shape — see
 * service-page.ts's own doc comment for why both are additive, not hacks.
 *
 * S2.1: every section now renders inside a wider Container ("wide", not
 * "content") with an inner `.serviceContainer` cap (1080px) for section
 * layout, while SectionHeading's own existing 640px self-cap keeps
 * title/description text readable regardless — section layout can be wide,
 * text reading width stays controlled. Two small opt-in layout variants
 * were added for content shapes that need them: ListBlock's `layout="split"`
 * (heading beside its list, not above) and CapabilityBlock's `columns={4}`
 * (a short proof row instead of the default two columns). CTA deliberately
 * kept its original "content" container — no layout change requested there.
 *
 * S4 (AI, Data & Automation) added a hero visual slot (two-column on
 * desktop when `sectionVisuals.hero` is supplied, stacked on mobile —
 * omitted keeps the hero exactly as before), a new ComparisonBlock for
 * side-by-side content, and several new optional sections. Every new
 * section slot below is inserted around Product Discovery's existing,
 * already-approved section order rather than into it — `approach` and
 * `engineeringProof` deliberately keep their original relative position so
 * that page's section order is untouched; new slots fill the gaps around
 * them instead.
 */
export function ServicePageTemplate({
  content,
  sectionVisuals,
  heroLayout = "default",
}: {
  content: ServicePageContent;
  sectionVisuals?: ServiceSectionVisuals;
  /**
   * S8.2 — opt-in hero column ratio. "default" keeps the original 1.1fr/0.9fr
   * text-led split every page has always used; "balanced" gives the visual
   * column equal width (a true 50/50 split) for the one page whose hero
   * visual needs to read as a substantial flagship moment. Only applied when
   * `sectionVisuals.hero` is also supplied; every page that doesn't pass
   * this prop renders with the exact same hero layout as before.
   */
  heroLayout?: "default" | "balanced";
}) {
  return (
    <main>
      <Section id="hero" spacing="default">
        <Container width="wide">
          <div className={styles.serviceContainer}>
            <div
              className={
                sectionVisuals?.hero ? (heroLayout === "balanced" ? styles.heroGridBalanced : styles.heroGrid) : undefined
              }
            >
              <div className={styles.hero}>
                {content.hero.eyebrow ? <Eyebrow>{content.hero.eyebrow}</Eyebrow> : null}
                <h1 className={`text-display ${styles.heroHeadline}`}>{content.hero.title}</h1>
                <p className={`text-body-lg ${styles.heroSupporting}`}>{content.hero.supporting}</p>
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
              {sectionVisuals?.hero ? <div className={styles.heroVisualSlot}>{sectionVisuals.hero}</div> : null}
            </div>
          </div>
        </Container>
      </Section>

      {content.businessProblem ? (
        <TextBlock
          id="business-problem"
          eyebrow="Business Problem"
          section={content.businessProblem}
          visual={sectionVisuals?.businessProblem}
        />
      ) : null}
      {content.audience ? (
        <CapabilityBlock id="who-its-for" eyebrow="Who It's For" section={content.audience} visual={sectionVisuals?.audience} />
      ) : null}
      {content.problems ? (
        <ListBlock
          id="problems-we-solve"
          eyebrow="Problems We Solve"
          section={content.problems}
          visual={sectionVisuals?.problems}
        />
      ) : null}
      {content.transformation ? (
        <TextBlock
          id="transformation"
          eyebrow="The Shift"
          section={content.transformation}
          visual={sectionVisuals?.transformation}
        />
      ) : null}
      {content.outcomes ? (
        <CapabilityBlock id="outcomes" eyebrow="Outcomes" section={content.outcomes} visual={sectionVisuals?.outcomes} />
      ) : null}
      {content.capabilities ? (
        <CapabilityBlock
          id="capabilities"
          eyebrow="Capabilities"
          section={content.capabilities}
          visual={sectionVisuals?.capabilities}
        />
      ) : null}
      {content.collaboration ? (
        <ComparisonBlock
          id="human-and-machine"
          eyebrow="Human + Machine"
          section={content.collaboration}
          visual={sectionVisuals?.collaboration}
        />
      ) : null}
      {content.agenticAi ? <TextBlock id="agentic-ai" eyebrow="Agentic AI" section={content.agenticAi} /> : null}
      {content.dataStory ? <TextBlock id="data-and-context" eyebrow="Data & Context" section={content.dataStory} /> : null}
      {content.intelligenceSystem ? (
        <TextBlock
          id="how-it-fits-together"
          eyebrow="How It Fits Together"
          section={content.intelligenceSystem}
          visual={sectionVisuals?.intelligenceSystem}
        />
      ) : null}
      {content.examples ? (
        <CapabilityBlock id="example-use-cases" eyebrow="Example Use Cases" section={content.examples} />
      ) : null}
      {content.approach ? (
        <TextBlock id="approach" eyebrow="Approach" section={content.approach} visual={sectionVisuals?.approach} />
      ) : null}
      {content.engineeringProof ? (
        <ListBlock
          id="engineering-proof"
          eyebrow="Engineering Proof"
          section={content.engineeringProof}
          tone="subtle"
          visual={sectionVisuals?.engineeringProof}
        />
      ) : null}
      {content.safety ? (
        <ListBlock id="ai-boundaries" eyebrow="AI Boundaries" section={content.safety} tone="subtle" />
      ) : null}
      {content.relatedWork ? (
        <CapabilityBlock
          id="related-work"
          eyebrow="Related Products / Work"
          section={content.relatedWork}
          visual={sectionVisuals?.relatedWork}
          columns={4}
        />
      ) : null}
      {content.innovation ? (
        <TextBlock
          id="engineering-meets-imagination"
          eyebrow="Perspective"
          section={content.innovation}
          visual={sectionVisuals?.innovation}
        />
      ) : null}
      {content.engagement ? (
        <ListBlock
          id="engagement-model"
          eyebrow="Engagement Model"
          section={content.engagement}
          visual={sectionVisuals?.engagement}
          layout="split"
        />
      ) : null}
      {content.indicativeRange ? (
        <TextBlock id="indicative-range" eyebrow="Indicative Range" section={content.indicativeRange} />
      ) : null}
      {content.faq ? <FaqBlock id="faq" eyebrow="FAQ" section={content.faq} /> : null}

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
