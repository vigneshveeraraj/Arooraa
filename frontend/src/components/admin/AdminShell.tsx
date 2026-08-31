"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "./AdminAuthContext";
import styles from "./AdminShell.module.css";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAdminAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/admin" className={styles.brand}>
            AROORAA <span className={styles.brandSub}>Admin</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/admin" className={styles.navLink}>
              Dashboard
            </Link>
            <Link href="/admin/leads" className={styles.navLink}>
              Leads
            </Link>
            <Link href="/admin/project-enquiries" className={styles.navLink}>
              Project Enquiries
            </Link>
          </nav>
          <div className={styles.userArea}>
            {admin && <span className={styles.userName}>{admin.displayName}</span>}
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
