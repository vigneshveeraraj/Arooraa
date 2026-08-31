import type { CSSProperties } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CAREER_FAMILIES } from "@/lib/careers/families";
import { formatOpenRolesCount } from "@/lib/careers/filter";
import { getJobBySlug, getOpenJobs } from "@/lib/careers/jobs";
import { CAREER_FAMILIES_HEADING } from "@/lib/content/careers";
import { FAMILY_ACCENTS } from "./family-accents";
import {
  AiDataIcon,
  BackendEngineeringIcon,
  FrontendEngineeringIcon,
  MarketingGrowthIcon,
  ProductDesignIcon,
  SalesIcon,
} from "./icons/CareerFamilyIcons";
import styles from "./CareerFamiliesSection.module.css";

const FAMILY_ICONS = {
  "ai-data": AiDataIcon,
  "backend-engineering": BackendEngineeringIcon,
  "frontend-engineering": FrontendEngineeringIcon,
  "product-design": ProductDesignIcon,
  sales: SalesIcon,
  "marketing-growth": MarketingGrowthIcon,
} as const;

/**
 * Six visually distinct career families (W3.3A §5), each showing an
 * open-role count derived from the live job dataset (never a hardcoded
 * number) and linking to its one representative role.
 */
export function CareerFamiliesSection() {
  const openJobs = getOpenJobs();

  return (
    <Section id="career-families" tone="dark">
      <Container>
        <SectionHeading eyebrow={CAREER_FAMILIES_HEADING.eyebrow} title={CAREER_FAMILIES_HEADING.title} />

        <ul className={styles.grid}>
          {CAREER_FAMILIES.map((family) => {
            const Icon = FAMILY_ICONS[family.id];
            const accent = FAMILY_ACCENTS[family.id];
            const relatedJob = getJobBySlug(family.relatedJobSlug);
            const openCount = openJobs.filter((job) => job.slug === family.relatedJobSlug).length;
            const accentStyle = { "--family-accent": accent.color, "--family-accent-bg": accent.background } as CSSProperties;

            return (
              <li key={family.id} className={styles.card} style={accentStyle}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon />
                </span>
                <h3 className="text-h4">{family.name}</h3>
                <p className={`text-body-sm ${styles.description}`}>{family.description}</p>
                <p className={`text-label ${styles.count}`}>{formatOpenRolesCount(openCount)}</p>
                {relatedJob ? (
                  <Link href={`/careers/${relatedJob.slug}`} className={styles.link}>
                    {openCount > 0 ? `View role: ${relatedJob.title}` : `Career path: ${relatedJob.title}`}
                    <span aria-hidden="true"> →</span>
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
