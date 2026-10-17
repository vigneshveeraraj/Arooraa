import { whatsAppUrlFor, type WhatsAppLocale } from "@/lib/whatsapp/config";
import { WhatsAppIcon } from "./WhatsAppIcon";
import styles from "./WhatsAppLink.module.css";

/** Screen-reader suffix: the link leaves the site and opens WhatsApp in a new tab or the app. */
const OPENS: Record<WhatsAppLocale, string> = {
  en: "(opens WhatsApp in a new tab)",
  ta: "(WhatsApp புதிய தாவலில் திறக்கும்)",
};

interface WhatsAppLinkProps {
  /** Visible text. */
  label: string;
  /**
   * button — filled WhatsApp-green pill (light surfaces).
   * link — inline text link with the glyph; `tone="dark"` for dark sections.
   * header — compact header action.
   */
  appearance?: "button" | "link" | "header";
  tone?: "light" | "dark";
  /** Language of the prefilled opening message and of the screen-reader hint. */
  locale?: WhatsAppLocale;
  className?: string;
}

/**
 * The website's one WhatsApp call to action. Every instance points at the single configured
 * destination (lib/whatsapp/config.ts) with a neutral, encoded opening message; it only opens the
 * chat — the visitor presses Send. It never promises an instant or automated reply: whether the
 * WhatsApp assistant answers depends on sender onboarding, not on this link.
 */
export function WhatsAppLink({ label, appearance = "link", tone = "light", locale = "en", className }: WhatsAppLinkProps) {
  const classes = [styles.base, styles[appearance], tone === "dark" ? styles.dark : null, className]
    .filter(Boolean)
    .join(" ");
  return (
    <a
      href={whatsAppUrlFor(locale)}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      // Starts with the visible text (WCAG 2.5.3), then says where the link goes.
      aria-label={`${label} ${OPENS[locale]}`}
      data-whatsapp-cta={appearance}
    >
      <WhatsAppIcon size={appearance === "header" ? 18 : 20} className={styles.icon} />
      <span>{label}</span>
    </a>
  );
}

/**
 * Mobile and tablet only (below the 1120px header breakpoint, where the header shows its own
 * WhatsApp action): a round button fixed bottom-left, clear of the Aura launcher bottom-right,
 * under the mobile menu and the Aura panel, and above the iOS home indicator.
 */
export function WhatsAppFloatingButton({ locale = "en" }: { locale?: WhatsAppLocale }) {
  return (
    <a
      href={whatsAppUrlFor(locale)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.floating}
      aria-label={locale === "ta"
        ? "WhatsApp-இல் AROORAA-வுடன் பேசுங்கள் (புதிய தாவலில் திறக்கும்)"
        : "Chat with AROORAA on WhatsApp (opens in a new tab)"}
      data-whatsapp-cta="floating"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
