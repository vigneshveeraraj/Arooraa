import styles from "./SmartHomeOverviewVisual.module.css";

const FIRST_FLOOR = [
  { room: "First Floor Bedroom", status: "AC On", detail: "24°C" },
  { room: "Kids Room", status: "AC Off" },
];

const GROUND_FLOOR = [
  { room: "Ground Floor Bedroom", status: "Last month usage" },
  { room: "Living Room", status: "Lights On" },
  { room: "Kitchen", status: "Lights On" },
];

/**
 * The Overview section's flagship visual (P5.1) — the real two-floor
 * "home at a glance" concept render, given full-width flagship treatment
 * via stackedVisualSections. The image communicates its story visually, but
 * per the brief's own accessibility rule ("do not rely on text baked into
 * images"), the same room/floor/water-tank story is restated below as real,
 * always-visible HTML — not hidden behind a mobile-only breakpoint, and not
 * a live-state claim (labeled "Example home view").
 */
export function SmartHomeOverviewVisual() {
  return (
    <figure className={styles.figure}>
      <img
        src="/images/products/smart-home/smart-home-house-overview-concept.webp"
        alt="Concept visualization of a two-floor Arooraa Smart Home showing room status, AC state, energy usage and water-tank information."
        width={1400}
        height={1050}
        className={styles.image}
        loading="lazy"
      />
      <figcaption className={styles.caption}>Arooraa Smart Home experience concept</figcaption>

      <div className={styles.storyWrap}>
        <p className={styles.storyLabel}>Example home view</p>

        <div className={styles.floorGroup}>
          <p className={styles.floorLabel}>First Floor</p>
          <div className={styles.cardRow}>
            {FIRST_FLOOR.map((item) => (
              <div key={item.room} className={styles.card}>
                <p className={styles.roomName}>{item.room}</p>
                <p className={styles.roomStatus}>
                  {item.status}
                  {item.detail ? <span className={styles.roomDetail}> · {item.detail}</span> : null}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.floorGroup}>
          <p className={styles.floorLabel}>Ground Floor</p>
          <div className={styles.cardRow}>
            {GROUND_FLOOR.map((item) => (
              <div key={item.room} className={styles.card}>
                <p className={styles.roomName}>{item.room}</p>
                <p className={styles.roomStatus}>{item.status}</p>
              </div>
            ))}
            <div className={styles.card}>
              <p className={styles.roomName}>Water Tank</p>
              <p className={styles.roomStatus}>Level visible</p>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
