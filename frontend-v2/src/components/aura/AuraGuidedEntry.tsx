"use client";

import {
  AURA_GUIDED_LINKS,
  AURA_GUIDED_PRODUCTS,
  AURA_GUIDED_SERVICES,
  type AuraGuidedProduct,
  type AuraGuidedService,
} from "@/lib/aura/guided-entry";
import { AuraVoiceCue } from "./AuraVoiceCue";
import styles from "./AuraGuidedEntry.module.css";

export type AuraGuidedSection = "root" | "products" | "services";

interface AuraGuidedEntryProps {
  section: AuraGuidedSection;
  /** Only the very first open shows the welcome line — a reopened ("Explore") menu goes straight
   * to the choices, since the visitor has already met Aura. */
  withWelcome: boolean;
  onOpenSection: (section: AuraGuidedSection) => void;
  onBack: () => void;
  onSelectProduct: (product: AuraGuidedProduct) => void;
  onSelectService: (service: AuraGuidedService) => void;
  onStartIdea: () => void;
  onNavigateOnly: (href: string) => void;
  onDismiss: () => void;
  /** Shows the "speak naturally" cue. True only when voice is actually working (A5). */
  voiceAvailable?: boolean;
}

/**
 * The guided first-open experience (A4.1, owner finding 2): four deliberate openings — Products,
 * Services, "I have a product idea", About — rather than an empty composer, plus two quieter escape
 * hatches (Careers, Contact) and a way out to freeform chat. Products and Services each open a
 * second, nested level in place; every destination in it comes from {@link AURA_GUIDED_PRODUCTS} /
 * {@link AURA_GUIDED_SERVICES}, which are themselves built from the site's own route data — nothing
 * here invents a URL or a product/service name of its own.
 *
 * <p>Reused for both the empty-conversation first-open and the "Explore" reopening mid-conversation
 * (see `withWelcome`), so the taxonomy is defined once.
 */
export function AuraGuidedEntry({
  section,
  withWelcome,
  onOpenSection,
  onBack,
  onSelectProduct,
  onSelectService,
  onStartIdea,
  onNavigateOnly,
  onDismiss,
  voiceAvailable = false,
}: AuraGuidedEntryProps) {
  return (
    <div className={styles.guided}>
      {withWelcome ? <p className={styles.welcome}>Hi — what would you like to explore?</p> : null}

      {section === "root" ? (
        <>
          <div className={styles.primary}>
            <button type="button" className={styles.primaryChoice} onClick={() => onOpenSection("products")}>
              Products
            </button>
            <button type="button" className={styles.primaryChoice} onClick={() => onOpenSection("services")}>
              Services
            </button>
            <button type="button" className={styles.primaryChoice} onClick={onStartIdea}>
              I have a product idea
            </button>
            <button
              type="button"
              className={styles.primaryChoice}
              onClick={() => onNavigateOnly(AURA_GUIDED_LINKS.about)}
            >
              About AROORAA
            </button>
          </div>
          <div className={styles.secondary}>
            <button
              type="button"
              className={styles.secondaryChoice}
              onClick={() => onNavigateOnly(AURA_GUIDED_LINKS.careers)}
            >
              Careers
            </button>
            <button
              type="button"
              className={styles.secondaryChoice}
              onClick={() => onNavigateOnly(AURA_GUIDED_LINKS.contact)}
            >
              Contact
            </button>
            <button type="button" className={styles.secondaryChoice} onClick={onDismiss}>
              Ask something else
            </button>
          </div>
          {/* Below the choices, not above them: the openings are the point of this screen, and the
              cue is a quiet reassurance for anyone who would rather talk than pick. */}
          {voiceAvailable ? <AuraVoiceCue className={styles.voiceCue} /> : null}
        </>
      ) : null}

      {section === "products" ? (
        <div className={styles.subList}>
          <button type="button" className={styles.back} onClick={onBack}>
            <span aria-hidden="true">‹</span> Back
          </button>
          {AURA_GUIDED_PRODUCTS.map((product) => (
            <button
              key={product.id}
              type="button"
              className={styles.subChoice}
              onClick={() => onSelectProduct(product)}
            >
              <span className={styles.subName}>{product.name}</span>
              <span className={styles.subTagline}>{product.tagline}</span>
            </button>
          ))}
        </div>
      ) : null}

      {section === "services" ? (
        <div className={styles.subList}>
          <button type="button" className={styles.back} onClick={onBack}>
            <span aria-hidden="true">‹</span> Back
          </button>
          {AURA_GUIDED_SERVICES.map((service) => (
            <button
              key={service.id}
              type="button"
              className={styles.subChoice}
              onClick={() => onSelectService(service)}
            >
              <span className={styles.subName}>{service.name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
