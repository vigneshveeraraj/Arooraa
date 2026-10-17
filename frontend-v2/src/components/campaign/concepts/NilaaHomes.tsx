import { CampaignIcon } from "../CampaignIcon";
import styles from "./NilaaHomes.module.css";

/** Fictional home builder — the hero's website concept. Decorative (its frame is aria-hidden). */

export function NilaaHomesDesktop() {
  return (
    <div className={styles.site}>
      <div className={styles.nav}>
        <div className={styles.logo}>
          NILAA<small>HOMES</small>
        </div>
        <div className={styles.links}>
          <span>Projects</span>
          <span>Amenities</span>
          <span>Site updates</span>
          <span>Contact</span>
        </div>
        <div className={styles.navCta}>Book a site visit</div>
      </div>
      <div className={styles.hero}>
        <img
          src="/images/campaign/nilaa-homes/villa.webp"
          alt=""
          width={960}
          height={720}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>Villas · Apartments</div>
          <h4>Homes designed around the way you live.</h4>
          <p>Thoughtful plans, quality construction and clear updates at every stage.</p>
          <div className={styles.row}>
            <span className={styles.light}>Explore projects</span>
            <span className={styles.wa}>WhatsApp us</span>
          </div>
        </div>
      </div>
      <div className={styles.cards}>
        {[
          ["apartments", "2 & 3 BHK Apartments", "Floor plans · Brochure"],
          ["villas", "Independent Villas", "Elevations · Specifications"],
          ["site-plans", "Construction Updates", "Photos · Progress"],
        ].map(([file, title, meta]) => (
          <div key={file} className={styles.card}>
            <img src={`/images/campaign/nilaa-homes/${file}.webp`} alt="" width={960} height={640} loading="lazy" decoding="async" />
            <div>
              <b>{title}</b>
              <span>{meta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NilaaHomesMobile() {
  return (
    <div className={styles.mobile}>
      <div className={styles.mTop}>
        <div className={styles.logo}>
          NILAA<small>HOMES</small>
        </div>
        <span className={styles.mBurger}>
          <i />
        </span>
      </div>
      <div className={styles.mHero}>
        <img src="/images/campaign/nilaa-homes/villa.webp" alt="" width={960} height={720} loading="eager" decoding="async" />
        <div className={styles.mHeroCopy}>
          <div className={styles.kicker}>Villas · Apartments</div>
          <h4>Homes designed around you.</h4>
        </div>
      </div>
      <div className={styles.mList}>
        {[
          ["apartments", "Apartments", "2 & 3 BHK · Brochure"],
          ["villas", "Villas", "Elevations · Specs"],
        ].map(([file, title, meta]) => (
          <div key={file}>
            <img src={`/images/campaign/nilaa-homes/${file}.webp`} alt="" width={960} height={640} loading="lazy" decoding="async" />
            <span>
              <b>{title}</b>
              {meta}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.mWhatsapp}>
        <CampaignIcon name="whatsapp" className={styles.mIcon} />
        Enquire on WhatsApp
      </div>
    </div>
  );
}
