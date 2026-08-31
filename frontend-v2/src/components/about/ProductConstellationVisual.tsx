import { ABOUT_PRODUCTS, PRODUCT_SPINE } from "@/lib/content/about";
import { MesaIcon, MindraIcon, SmartMirrorIcon, SmartHomeIcon } from "./AboutProductIcons";
import styles from "./ProductConstellationVisual.module.css";

const ICONS = {
  mesa: MesaIcon,
  mindra: MindraIcon,
  "smart-mirror": SmartMirrorIcon,
  "smart-home": SmartHomeIcon,
} as const;

const ACCENT_CLASS: Record<string, string> = {
  mesa: "accentAmber",
  mindra: "accentLavender",
  "smart-mirror": "accentCyan",
  "smart-home": "accentGreen",
};

/**
 * The product constellation (W3.1 §8) — four products, each in its own
 * visual "world" (own accent, own glyph), staggered rather than four
 * identical cards, resting on a shared Real Problem → Product Thinking →
 * Engineering spine.
 */
export function ProductConstellationVisual() {
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        {ABOUT_PRODUCTS.map((product, index) => {
          const Icon = ICONS[product.slug as keyof typeof ICONS];
          const accentClass = ACCENT_CLASS[product.slug]!;
          return (
            <div
              key={product.slug}
              className={`${styles.card} ${styles[accentClass]} ${index % 2 === 1 ? styles.cardOffset : ""}`}
            >
              <span className={styles.iconChip} aria-hidden="true">
                <Icon />
              </span>
              <p className={`text-label ${styles.world}`}>{product.world}</p>
              <h3 className={`text-h4 ${styles.name}`}>{product.name}</h3>
              <p className={`text-body-sm ${styles.description}`}>{product.description}</p>
            </div>
          );
        })}
      </div>

      <ol className={styles.spine}>
        {PRODUCT_SPINE.map((stage) => (
          <li key={stage} className={styles.spineStage}>
            {stage}
          </li>
        ))}
      </ol>
    </div>
  );
}
