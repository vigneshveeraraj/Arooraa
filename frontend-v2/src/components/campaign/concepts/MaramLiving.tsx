import { CampaignIcon } from "../CampaignIcon";
import styles from "./MaramLiving.module.css";

/** Fictional furniture showroom — website design concept. Decorative (frame is aria-hidden). */

const PRODUCTS = [
  ["sofa", "Aalam Sofa", 640],
  ["lounge-chairs", "Kaavi Lounge Chair", 540],
  ["coffee-table", "Vellai Coffee Table", 640],
] as const;

export function MaramLivingDesktop() {
  return (
    <div className={styles.site}>
      <div className={styles.nav}>
        <div className={styles.links}>
          <span>Living</span>
          <span>Dining</span>
          <span>Bedroom</span>
        </div>
        <div className={styles.logo}>Maram Living</div>
        <div className={styles.right}>
          <span>Showroom</span>
          <b>Enquire</b>
        </div>
      </div>
      <div className={styles.hero}>
        <div>
          <div className={styles.kicker}>Solid wood · Handcrafted</div>
          <h4>Crafted for everyday living.</h4>
          <p>Sofas, dining and storage in teak and sheesham — visit the showroom or enquire online.</p>
          <div className={styles.row}>
            <span>Shop the collection</span>
            <span>Visit showroom</span>
          </div>
        </div>
        <img src="/images/campaign/maram-living/living-room.webp" alt="" width={960} height={640} loading="lazy" decoding="async" />
      </div>
      <div className={styles.products}>
        {PRODUCTS.map(([file, name, height]) => (
          <figure key={file}>
            <img src={`/images/campaign/maram-living/${file}.webp`} alt="" width={960} height={height} loading="lazy" decoding="async" />
            <figcaption>
              {name}
              <span>Enquire</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function MaramLivingMobile() {
  return (
    <div className={styles.mobile}>
      <img src="/images/campaign/maram-living/sofa.webp" alt="" width={960} height={640} loading="lazy" decoding="async" />
      <div className={styles.mBody}>
        <div className={styles.kicker}>Living room</div>
        <h4>Aalam 3-seater sofa</h4>
        <p>Solid teak frame with linen upholstery and removable covers.</p>
        <div className={styles.chips}>
          <span>Teak frame</span>
          <span>Linen fabric</span>
        </div>
        <div className={styles.specs}>
          <span>
            <b>Size</b>210 × 90 × 85 cm
          </span>
          <span>
            <b>Finish</b>Natural oak
          </span>
        </div>
        <div className={styles.swatches}>
          <i style={{ background: "#cdbfa8" }} />
          <i style={{ background: "#7b8f8a" }} />
          <i style={{ background: "#3d3a36" }} />
        </div>
      </div>
      <div className={styles.mCta}>
        <CampaignIcon name="whatsapp" className={styles.mIcon} />
        Enquire on WhatsApp
      </div>
    </div>
  );
}
