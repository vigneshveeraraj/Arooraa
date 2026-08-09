import type { Metadata } from "next";
import { StartProjectForm } from "@/components/project-enquiry/StartProjectForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Start a Project — Arooraa",
  description:
    "Tell us about your idea or business problem and our engineering team will review it and get in touch.",
  // A lead-capture form isn't useful search-engine content on its own; kept followable
  // so link equity still flows to it, just not indexed as a landing page.
  robots: { index: false, follow: true },
};

export default function StartProjectPage() {
  return (
    <main className={styles.page}>
      <div className="container">
        <p className="eyebrow">Start a Project</p>
        <h1 className={styles.heading}>Tell us what you&apos;re building.</h1>
        <p className={styles.subtitle}>
          A few quick steps about your idea, your project, and how to reach you. We&apos;ll review your
          requirement and contact you using your preferred contact method.
        </p>
        <StartProjectForm />
      </div>
    </main>
  );
}
