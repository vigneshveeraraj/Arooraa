import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import styles from "./not-found.module.css";

// A 404 is a non-result, not a page worth surfacing in search — never indexed.
export const metadata: Metadata = {
  title: "Page Not Found | AROORAA",
  robots: { index: false, follow: false },
};

/**
 * W4.1 Phase 15 — the production Nginx config already falls back to this
 * page's static export (`out/404.html`) for any unmatched path. Deliberately
 * restrained: no marketing sections, just a way back to the site.
 */
export default function NotFound() {
  return (
    <main className={styles.main}>
      <Container width="content" className={styles.content}>
        <Wordmark size="compact" />
        <h1 className={styles.heading}>Page not found</h1>
        <p className={styles.body}>The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
        <div className={styles.actions}>
          <Button href="/" variant="primary">
            Home
          </Button>
          <Button href="/products" variant="secondary">
            Products
          </Button>
          <Button href="/start-project" variant="ghost">
            Start a Project
          </Button>
        </div>
      </Container>
    </main>
  );
}
