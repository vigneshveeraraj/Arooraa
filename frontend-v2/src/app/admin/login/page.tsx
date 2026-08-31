"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  const { status, login } = useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin");
    }
  }, [status, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.ok) {
      router.replace("/admin");
    } else {
      setError(result.message);
    }
  }

  // Already authenticated (redirect effect above is about to fire) or the
  // session check is still in flight — never flash the login form either way.
  if (status === "authenticated" || status === "loading") {
    return null;
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleSubmit} className={styles.card} noValidate>
        <p className="text-eyebrow">AROORAA Admin</p>
        <h1 className={`text-h2 ${styles.heading}`}>Log in</h1>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <Button type="submit" disabled={submitting} className={styles.submitBtn}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </div>
  );
}
