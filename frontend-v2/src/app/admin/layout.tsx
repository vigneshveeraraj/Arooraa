import type { Metadata } from "next";
import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";
import "@/styles/admin-tokens.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "AROORAA Admin",
  robots: { index: false, follow: false },
};

/**
 * W3.2D.1 — the admin app's own root. Deliberately does NOT render
 * SiteHeader/SiteFooter (Phase 3: "must not reuse the public website
 * header/navigation") — AdminShell (rendered per-page, since unauthenticated
 * pages like /admin/login don't want the authenticated chrome) is the only
 * navigation admin routes ever show.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root} data-admin-root="true">
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </div>
  );
}
