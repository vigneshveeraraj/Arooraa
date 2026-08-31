"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchSession, login as apiLogin, logout as apiLogout } from "@/lib/admin/api";
import type { AdminSession } from "@/lib/admin/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type LoginResult = { ok: true } | { ok: false; message: string; rateLimited: boolean };

interface AdminAuthContextValue {
  status: AuthStatus;
  admin: AdminSession | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [admin, setAdmin] = useState<AdminSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSession().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setAdmin(result.data);
        setStatus("authenticated");
      } else {
        setAdmin(null);
        setStatus("unauthenticated");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const result = await apiLogin(email, password);
    if (result.ok) {
      setAdmin(result.data);
      setStatus("authenticated");
      return { ok: true };
    }
    return { ok: false, message: result.error.message, rateLimited: result.error.kind === "RATE_LIMITED" };
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setAdmin(null);
    setStatus("unauthenticated");
  }, []);

  return <AdminAuthContext.Provider value={{ status, admin, login, logout }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
