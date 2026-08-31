import styles from "./SmartMirrorEngineeringVisual.module.css";

const HARDWARE_SUMMARY = [
  {
    name: "Reflective acrylic surface",
    description: "Allows the product to remain a mirror while the display can appear through it.",
  },
  {
    name: "Digital display",
    description: "Provides the glanceable visual layer behind the reflective surface.",
  },
  {
    name: "Raspberry Pi 5 edge platform",
    description: "Runs the prototype's local computing and product experience.",
  },
  {
    name: "Slim frame",
    description: "Brings the mirror and display into one physical product form.",
  },
  {
    name: "Rear mounting system",
    description: "Supports the core hardware behind the mirror.",
  },
];

/**
 * The Engineering section's visual (P4.2) — promoted to a full-width
 * flagship treatment via the template's `stackedVisualSections`, since the
 * exploded-construction photograph is one of the page's strongest proof
 * points and read as too constrained inside the normal ~0.85fr companion
 * column. The baked-in image labels aren't relied on as the only source of
 * meaning: a real, accessible `<dl>` beneath the image restates the same
 * five high-level hardware ideas as text, public-safe (no dimensions,
 * ports, cabling, PSU or BOM detail).
 */
export function SmartMirrorEngineeringVisual() {
  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>
        A reflective acrylic surface sits in front of the digital display. When the interface is quiet, the product
        behaves like a mirror. When useful information appears, the display becomes visible through the reflective
        surface. The prototype direction uses Raspberry Pi 5 as the edge-computing foundation behind the Smart Mirror
        experience.
      </p>

      <img
        src="/images/products/smart-mirror/smart-mirror-build-exploded.webp"
        alt="Exploded Smart Mirror concept showing reflective acrylic surface, display panel, Raspberry Pi 5 and rear mounting system."
        width={1440}
        height={1080}
        className={styles.image}
        loading="lazy"
      />

      <dl className={styles.summary}>
        {HARDWARE_SUMMARY.map((item) => (
          <div key={item.name} className={styles.summaryItem}>
            <dt className={styles.summaryName}>{item.name}</dt>
            <dd className={styles.summaryDescription}>{item.description}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
