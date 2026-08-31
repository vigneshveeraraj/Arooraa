"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "./AdminAuthContext";
import styles from "./RequireAdmin.module.css";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className={styles.loading} role="status">
        Loading…
      </div>
    );
  }

  // Unauthenticated: render nothing while the redirect above takes effect —
  // never flash protected content, even for a frame.
  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
