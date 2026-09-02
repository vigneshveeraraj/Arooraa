import type { ReactNode } from "react";
import { AuraWidget } from "@/components/aura/AuraWidget";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Aura is mounted here rather than per page, for two reasons: it is present on every public page
 * without any page having to know about it, and it survives navigation between them — so a
 * conversation started on the home page is still going when the visitor reaches /products/mesa and
 * asks "tell me more about this". The admin app has its own layout and deliberately does not get it.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <AuraWidget />
    </>
  );
}
