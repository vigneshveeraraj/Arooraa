import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Business Website, AI & Automation Solutions | AROORAA",
  description: "Professional websites, customer enquiries, business automation and AI solutions for growing businesses across Tamil Nadu. Talk to AROORAA Technologies.",
  alternates: { canonical: "https://www.arooraa.com/grow-your-business" },
  openGraph: {
    title: "உங்கள் Business-ஐ Digital-ஆ மாற்றலாம் | AROORAA",
    description: "Website முதல் AI & Automation வரை — உங்கள் business-க்கு தேவையான technology solutions.",
    url: "https://www.arooraa.com/grow-your-business",
    type: "website",
  },
};
const phone = "+918760223447";
const whatsapp = "https://wa.me/918760223447?text=" + encodeURIComponent("Hi AROORAA, I'm interested in a website or digital solution for my business. Please contact me.");
const services = [
  ["◈", "Website Development", "Modern, mobile-friendly websites designed around your business."],
  ["◎", "Customer Enquiries", "Make it easier for customers to reach your team and request a quote."],
  ["✦", "AI & Automation", "Explore practical automation for repetitive work and customer workflows."],
  ["↗", "Marketing & Leads", "Connect your digital presence with measurable marketing efforts."],
  ["▦", "Business Applications", "Custom tools and integrations when your business needs them."],
  ["◉", "Technical Support", "Discuss ongoing maintenance and support requirements."],
];
const industries = [
  ["Retail & Showrooms", "Product showcases, enquiries and store information", "🛍️"],
  ["Manufacturing", "Company profiles, catalogues and distributor enquiries", "🏭"],
  ["Construction & Interiors", "Project portfolios and consultation enquiries", "🏗️"],
  ["Healthcare & Clinics", "Services, location and appointment enquiries", "🏥"],
  ["Education & Training", "Course information and admissions enquiries", "🎓"],
  ["Restaurants & Cafés", "Digital presence, menus and customer enquiries", "☕"],
];
const steps = [
  ["01", "Understand your business", "We discuss your customers, goals, processes and requirements."],
  ["02", "Design & develop", "We propose and build a solution suited to your needs and budget."],
  ["03", "Integrate where useful", "We assess enquiry handling, AI and automation opportunities."],
  ["04", "Launch & improve", "We test, launch and discuss support and future improvements."],
];
export default function GrowYourBusinessPage() {
  return (
    <main className={styles.page} lang="ta">
      <header className={styles.header}>
        <div className={styles.shell + " " + styles.nav}>
          <a className={styles.logo} href="/" aria-label="AROORAA Technologies main website"><span className={styles.logoMark}>A</span><span>AROORAA<small>TECHNOLOGIES</small></span></a>
          <nav className={styles.links} aria-label="Campaign navigation">
            <a href="/">Main Website</a><a href="#solutions">Solutions</a><a href="#industries">Industries</a><a href="#process">How It Works</a>
          </nav>
          <a className={styles.navCta} href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us ↗</a>
        </div>
      </header>
      <section className={styles.hero}>
        <div className={styles.shell + " " + styles.heroGrid}>
          <div>
            <span className={styles.eyebrow}>AROORAA • BUSINESS GROWTH SOLUTIONS</span>
            <h1>உங்கள் Business-ஐ<br/><em>Digital-ஆ</em> மாற்றலாம்</h1>
            <p className={styles.heroLead}>Professional Website, AI மற்றும் Automation மூலம் உங்கள் Business-க்கு அதிக Enquiries, நல்ல Customer Experience மற்றும் திறமையான Operations உருவாக்க உதவுகிறோம்.</p>
            <div className={styles.serviceGrid}>{services.map(([icon,title])=><div key={title} className={styles.serviceMini}><span>{icon}</span>{title}</div>)}</div>
            <div className={styles.actions}><a className={styles.primary} href={whatsapp} target="_blank" rel="noopener noreferrer">✆ &nbsp; Let's Discuss <span>→</span></a><a className={styles.secondary} href="#contact">Get Free Consultation →</a></div>
            <p className={styles.trust}>Business-focused approach &nbsp; • &nbsp; Secure development &nbsp; • &nbsp; Practical solutions</p>
          </div>
          <div className={styles.visual} aria-label="Illustration of business website, enquiries, marketing and automation">
            <div className={styles.visualGlow}></div>
            <div className={styles.floating + " " + styles.floatOne}>🌐 Website</div>
            <div className={styles.floating + " " + styles.floatTwo}>💬 Enquiries</div>
            <div className={styles.floating + " " + styles.floatThree}>✦ AI Automation</div>
            <div className={styles.floating + " " + styles.floatFour}>↗ Marketing</div>
            <div className={styles.screen}><div className={styles.screenBar}><span>AROORAA</span><span>Overview &nbsp; Services &nbsp; Contact</span></div><div className={styles.screenBody}><span className={styles.screenEyebrow}>DIGITAL BUSINESS</span><strong>Your Business.<br/>Smarter Technology.</strong><span>Build trust. Capture enquiries.<br/>Simplify operations.</span><div className={styles.screenButton}>Explore Solutions →</div></div></div>
            <div className={styles.phone}><div className={styles.phoneTop}></div><span>Business insights</span><strong>Enquiries</strong><div className={styles.metric}>+24% <small>Sample illustration</small></div><div className={styles.bars}><i/><i/><i/><i/><i/></div></div>
            <div className={styles.growth}>↗ &nbsp; Visibility · Enquiries · Efficiency</div>
          </div>
        </div>
      </section>
      <section className={styles.problems}><div className={styles.shell + " " + styles.problemGrid}>
        <div><span className={styles.eyebrow}>YOUR BUSINESS TODAY</span><h2>இன்னும் இப்படித்தான்<br/>manage பண்றீங்களா?</h2><ul>{["Website இல்லையா அல்லது outdated-ஆ இருக்கா?","Enquiries சரியாக track ஆகுதா?","Customer follow-up miss ஆகுதா?","Marketing results தெரியலையா?","Manual work அதிகமாக இருக்கா?"].map(x=><li key={x}><b className={styles.cross}>×</b>{x}</li>)}</ul></div>
        <div><span className={styles.eyebrow}>WITH AROORAA</span><h2>உங்கள் Business-க்கு<br/>சரியான Digital Solution</h2><ul>{["Modern, mobile-friendly website","Customer enquiry capture & management","Marketing and lead generation integrations","AI & automation where it adds value","Technical support options"].map(x=><li key={x}><b className={styles.check}>✓</b>{x}</li>)}</ul></div>
      </div></section>
      <section className={styles.section} id="solutions"><div className={styles.shell}><span className={styles.eyebrow}>OUR SOLUTIONS</span><h2>More Than a Website</h2><p className={styles.sectionLead}>A technology partner for your next stage of business growth.</p><div className={styles.cards}>{services.map(([icon,title,desc])=><article className={styles.card} key={title}><span className={styles.cardIcon}>{icon}</span><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>
      <section className={styles.section + " " + styles.tint} id="industries"><div className={styles.shell}><span className={styles.eyebrow}>INDUSTRIES WE SERVE</span><h2>Built Around Your Business</h2><div className={styles.industries}>{industries.map(([name,desc,emoji])=><article className={styles.industry} key={name}><div className={styles.industryArt}>{emoji}</div><h3>{name}</h3><p>{desc}</p></article>)}</div></div></section>
      <section className={styles.section} id="process"><div className={styles.shell}><span className={styles.eyebrow}>HOW IT WORKS</span><h2>From Enquiry to Launch</h2><div className={styles.steps}>{steps.map(([number,title,desc])=><article className={styles.step} key={number}><span>{number}</span><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>
      <section className={styles.section + " " + styles.tint}><div className={styles.shell}><span className={styles.eyebrow}>WHY AROORAA</span><h2>More Than a Website — A Technology Partner</h2><div className={styles.cards}>{[["◎","Business-focused","We start by understanding the problem before suggesting technology."],["◈","Modern engineering","Responsive design, performance and maintainable solutions."],["⚙","Tailored delivery","The right scope for your business, without unnecessary complexity."],["◉","Long-term thinking","A foundation that can evolve as your requirements grow."]].map(([icon,title,desc])=><article className={styles.card} key={title}><span className={styles.cardIcon}>{icon}</span><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>
      <section className={styles.contact} id="contact"><div className={styles.shell + " " + styles.contactGrid}><div><span className={styles.eyebrow}>LET'S TALK</span><h2>Ready to Take Your Business Online?</h2><p>உங்கள் requirements பற்றி பேசலாம். Website, AI அல்லது Automation — உங்கள் Business-க்கு பொருத்தமான approach-ஐ கண்டுபிடிப்போம்.</p></div><div className={styles.contactActions}><a className={styles.primary} href={whatsapp} target="_blank" rel="noopener noreferrer">✆ &nbsp; WhatsApp Now →</a><a className={styles.outline} href={"tel:"+phone}>Request a Call ↗</a><a className={styles.email} href="mailto:support@arooraa.com">support@arooraa.com</a></div></div></section>
      <footer className={styles.footer}><div className={styles.shell + " " + styles.footerGrid}><div><a className={styles.logo} href="/"><span className={styles.logoMark}>A</span><span>AROORAA<small>TECHNOLOGIES</small></span></a><p>Technology solutions for businesses ready to move forward.</p></div><div><strong>Explore AROORAA</strong><a href="/">Main Website</a><a href="/#services">Services</a><a href="/#products">Products</a></div><div><strong>Contact</strong><a href={"tel:"+phone}>+91 87602 23447</a><a href="mailto:support@arooraa.com">support@arooraa.com</a><span>Chennai, Tamil Nadu</span></div></div><div className={styles.copyright}>© {new Date().getFullYear()} AROORAA Technologies. All rights reserved.</div></footer>
    </main>
  );
}
