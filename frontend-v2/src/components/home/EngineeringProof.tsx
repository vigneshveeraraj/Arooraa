import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { CAPABILITY_GROUPS, ENGINEERING_HEADING, ENGINEERING_LABEL } from "@/lib/content/engineering";
import styles from "./EngineeringProof.module.css";

export function EngineeringProof() {
  return (
    <Section spacing="compact" className={styles.engineering}>
      <Container>
        <SectionHeading
          eyebrow={ENGINEERING_HEADING.eyebrow}
          title={ENGINEERING_HEADING.title}
          description={ENGINEERING_HEADING.description}
        />

        <p className={`text-eyebrow ${styles.techLabel}`}>{ENGINEERING_LABEL}</p>

        <div className={styles.grid}>
          {CAPABILITY_GROUPS.map((group) => (
            <div key={group.id} className={styles.item}>
              <p className="text-h4">{group.name}</p>
              <div className={styles.badgeRow}>
                {group.items.map((item) => (
                  <Badge key={item} variant="neutral">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
