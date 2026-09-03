import type { ReactNode } from "react";
import { AuraWidget } from "@/components/aura/AuraWidget";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Whether Aura is on the public site at all (A8) — the frontend half of the kill switch.
 *
 * <p>The backend switches are the ones that matter for safety: with `aura.chat.enabled` false the
 * API returns 404 and Aura can say nothing. But a launcher that is still on the page when the
 * service behind it is off is worse than no launcher — a visitor opens it, types a question, and
 * gets an apology. Turning Aura off should mean it is not there.
 *
 * <p>A production build has to be told to include Aura rather than told to leave it out, which is
 * the right way round for something the owner has not yet approved for the public. `next dev`
 * includes it unless explicitly told not to, so local review needs no configuration at all.
 *
 * <p><b>What this does and does not do.</b> It decides whether the widget is mounted: off, there is
 * no launcher in the rendered HTML, nothing can be opened, and no request is ever made to
 * aura-service. It does <em>not</em> remove the widget's code from the bundle — measured rather
 * than assumed: building with the variable unset and with it set to "false" both leave the
 * launcher's chunk in `out/`, referenced by no page. Turbopack does not eliminate the import, and
 * this comment previously claimed that it did.
 *
 * <p>The distinction matters for how far this switch is trusted. It is a render switch, and a
 * complete one for what a visitor experiences. It is not the kind of exclusion the design-system
 * review pages get, where a production build genuinely has no route and no file. If Aura's code
 * must not be in the deployed bundle at all, that is a separate change to make deliberately.
 */
const AURA_ENABLED =
  process.env.NEXT_PUBLIC_AURA_ENABLED === "true" ||
  (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_AURA_ENABLED !== "false");

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
      {AURA_ENABLED ? <AuraWidget /> : null}
    </>
  );
}
