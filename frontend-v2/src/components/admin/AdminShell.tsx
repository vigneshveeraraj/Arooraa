"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "./AdminAuthContext";
import styles from "./AdminShell.module.css";

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Project Enquiries", href: "/admin/project-enquiries" },
];

/**
 * The admin app's only navigation chrome (W3.2D.1 Phase 3) — a dedicated
 * shell, never the public SiteHeader. Rendered per-page (inside
 * RequireAdmin) rather than in app/admin/layout.tsx, since /admin/login
 * intentionally has no authenticated nav to show.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <Link href="/admin" className={styles.brand}>
            AROORAA <span className={styles.brandSub}>Admin</span>
          </Link>

          <div className={styles.userArea}>
            {admin && <span className={styles.userName}>{admin.displayName}</span>}
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Admin">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
