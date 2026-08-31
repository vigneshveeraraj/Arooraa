import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactSection } from "@/components/contact/ContactSection";
import { pageMetadata } from "@/lib/seo/metadata";

// No LocalBusiness structured data (W3.4 §17, reaffirmed W4.1 Phase 11) — that requires
// factual business-location data (address, hours) that isn't approved for publication yet.
// Kept indexable with plain unique title/description/canonical metadata instead.
export const metadata: Metadata = pageMetadata({
  title: "Contact AROORAA | Product Engineering & Innovation",
  description:
    "Get in touch with AROORAA about a general question, a partnership, a product, or anything else. Have a project in mind? Start a Project is the faster path.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactSection />
    </main>
  );
}
