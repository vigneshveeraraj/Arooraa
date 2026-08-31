"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { JOB_DETAIL_CONTENT } from "@/lib/content/careers";

/** Copies the current page URL — no external share SDK, no fabricated share counts. */
export function ShareRoleButton() {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silently no-op
      // rather than showing a confusing error for a non-essential action.
    }
  };

  return (
    <Button variant="ghost" onClick={handleClick}>
      {copied ? "Link copied" : JOB_DETAIL_CONTENT.shareCta}
    </Button>
  );
}
