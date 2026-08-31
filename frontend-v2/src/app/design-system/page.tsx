import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Wordmark } from "@/components/ui/Wordmark";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Design System — Internal Review",
  robots: { index: false, follow: false },
};

const SPACING_STEPS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function DesignSystemPage() {
  return (
    <main>
      <div className={styles.devBanner}>
        Internal design-system review page — not part of public navigation. Remove before production cutover.
      </div>

      <Section spacing="compact">
        <Container>
          <Eyebrow>Design System — M1</Eyebrow>
          <h1 className="text-h1">AROORAA Design Foundation</h1>
          <p className={`text-body-lg ${styles.muted} ${styles.intro}`}>
            Tokens and primitives only — no production page content. For manual visual review at mobile (~375px),
            tablet (~768px) and desktop (~1440px) widths.
          </p>
        </Container>
      </Section>

      <Section spacing="compact" className={styles.demoSection}>
        <Container>
          <SectionHeading
            eyebrow="Typography"
            title="Type scale"
            description="Responsive via clamp() — no per-page overrides required."
          />
          <div className={styles.stack}>
            <p className="text-display">Display — Turn ideas into products</p>
            <p className="text-h1">Heading 1 — Product Engineering</p>
            <p className="text-h2">Heading 2 — Architecture before implementation</p>
            <p className="text-h3">Heading 3 — Discovery to production</p>
            <p className="text-h4">Heading 4 — Continuous engineering</p>
            <p className="text-body-lg">
              Body large — From product discovery and design to engineering, AI, cloud deployment and continuous
              support.
            </p>
            <p className="text-body">
              Body — We turn ideas and business problems into production-ready digital products.
            </p>
            <p className="text-body-sm">Body small — Supporting detail text and secondary descriptions.</p>
            <p className="text-eyebrow">Eyebrow label</p>
            <p className="text-label">Label text</p>
            <p className="text-code">const status = &quot;production-ready&quot;;</p>
          </div>
        </Container>
      </Section>

      <Section spacing="compact" className={styles.demoSection}>
        <Container>
          <SectionHeading
            eyebrow="Wordmark"
            title="Textual wordmark"
            description="Clean text treatment only — no icon/mark, no gradient. The final brand mark is a separate decision."
          />
          <div className={styles.wordmarkRow}>
            <div className={styles.wordmarkExample}>
              <Wordmark />
              <span className={`text-label ${styles.muted}`}>Primary — hero / header</span>
            </div>
            <div className={styles.wordmarkExample}>
              <Wordmark size="compact" />
              <span className={`text-label ${styles.muted}`}>Compact — footer / constrained UI</span>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="compact" className={styles.demoSection}>
        <Container>
          <SectionHeading eyebrow="Buttons" title="Button variants" />
          <div className={styles.row}>
            <Button variant="primary">Start a Project</Button>
            <Button variant="secondary">Secondary action</Button>
            <Button variant="ghost">Ghost / text action</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" href="/design-system">
              Link-as-button
            </Button>
          </div>
          <p className={`text-body-sm ${styles.muted} ${styles.hint}`}>
            Tab through the row above to verify keyboard focus visibility.
          </p>
        </Container>
      </Section>

      <Section spacing="compact" className={styles.demoSection}>
        <Container>
          <SectionHeading eyebrow="Badges" title="Badge variants" />
          <div className={styles.row}>
            <Badge>Neutral</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        </Container>
      </Section>

      <Section spacing="compact" className={styles.demoSection}>
        <Container>
          <SectionHeading eyebrow="Surfaces" title="Cards" />
          <div className={styles.cardGrid}>
            <Card>
              <p className={`text-h4 ${styles.cardTitle}`}>Static card</p>
              <p className={`text-body-sm ${styles.muted}`}>Flat, hairline border, no shadow by default.</p>
            </Card>
            <Card interactive>
              <p className={`text-h4 ${styles.cardTitle}`}>Interactive card</p>
              <p className={`text-body-sm ${styles.muted}`}>
                Cursor + border emphasis at rest, elevation and background on hover.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      <Section spacing="compact" className={styles.demoSection}>
        <Container>
          <SectionHeading eyebrow="Spacing" title="Spacing & container widths" />
          <div className={styles.spacingScale}>
            {SPACING_STEPS.map((step) => (
              <div key={step} className={styles.spacingRow}>
                <span className={`text-label ${styles.spacingLabel}`}>--space-{step}</span>
                <span className={styles.spacingSwatch} style={{ width: `var(--space-${step})` }} />
              </div>
            ))}
          </div>
        </Container>
        {/* Deliberately outside the section's own wide Container — nesting these
            inside it would cap them at 1280px before their own width could be
            compared against the viewport. */}
        <div className={styles.containerDemo}>
          <Container width="content" className={styles.containerBlock}>
            <span className={`text-body-sm ${styles.muted}`}>content (720px max)</span>
          </Container>
          <Container width="wide" className={styles.containerBlock}>
            <span className={`text-body-sm ${styles.muted}`}>wide (1280px max)</span>
          </Container>
          <Container width="full" className={styles.containerBlock}>
            <span className={`text-body-sm ${styles.muted}`}>full (no max-width)</span>
          </Container>
        </div>
      </Section>

      <Section tone="dark" spacing="compact" className={styles.demoSection}>
        <Container>
          <SectionHeading
            eyebrow="Dark section"
            title="Intentional dark tone"
            description="Used sparingly and deliberately — not a global dark mode. Tokens remap automatically inside a dark Section — including the primary button, which switches to a light chip so it stays clearly visible against near-black."
          />
          <div className={styles.row}>
            <Button variant="primary">Primary on dark</Button>
            <Button variant="secondary">Secondary on dark</Button>
            <Button variant="ghost">Ghost on dark</Button>
            <Badge variant="accent">Accent badge on dark</Badge>
          </div>
          <Card className={styles.darkCard}>
            <p className={`text-h4 ${styles.cardTitle}`}>Card inside a dark section</p>
            <p className={`text-body-sm ${styles.muted}`}>
              Surface/border/text tokens all remap through the section&apos;s data-tone scope.
            </p>
          </Card>
        </Container>
      </Section>

      <Section spacing="compact" className={styles.demoSection}>
        <Container>
          <SectionHeading
            eyebrow="Motion & focus"
            title="Reduced motion + focus states"
            description="Enable your OS 'reduce motion' setting and re-check the hover/active transitions above. Tab through this page to confirm every interactive element shows a visible focus ring."
          />
        </Container>
      </Section>
    </main>
  );
}
