import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CUSTOMER_PROVIDER_BRIDGE } from "@/lib/content/about";
import { CustomerProviderBridgeVisual } from "./CustomerProviderBridgeVisual";
import styles from "./CustomerProviderBridgeSection.module.css";

/** Chapter 05 — Customer + provider bridge (W3.1 §11), one of the page's signature visuals. */
export function CustomerProviderBridgeSection() {
  return (
    <Section id="bridge" spacing="default">
      <Container width="wide">
        <SectionHeading title={CUSTOMER_PROVIDER_BRIDGE.heading} description={CUSTOMER_PROVIDER_BRIDGE.intro} />
        <ul className={styles.examples}>
          {CUSTOMER_PROVIDER_BRIDGE.examples.map((example) => (
            <li key={example}>{example}</li>
          ))}
        </ul>
        <CustomerProviderBridgeVisual />
        <div className={styles.body}>
          {CUSTOMER_PROVIDER_BRIDGE.bodyLines.map((line) => (
            <p key={line} className="text-body-lg">
              {line}
            </p>
          ))}
          <p className={`text-h3 ${styles.strongLine}`}>{CUSTOMER_PROVIDER_BRIDGE.strongLine}</p>
        </div>
      </Container>
    </Section>
  );
}
