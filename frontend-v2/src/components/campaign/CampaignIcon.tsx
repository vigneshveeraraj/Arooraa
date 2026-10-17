import type { ReactNode } from "react";
import { WHATSAPP_ICON_PATH } from "@/components/whatsapp/WhatsAppIcon";

/**
 * Line icons for the Tamil campaign page (/grow-your-business): 24px grid, 1.75 stroke,
 * round joins. WhatsApp is the only filled glyph, because its mark is only recognisable
 * filled. Kept separate from the main site's components so the campaign stays isolated.
 */
const PATHS = {
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M7 7l10 10M17 7 7 17" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4M7 8.5h6M7 11.5h4" />
    </>
  ),
  message: (
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9.5L4 20V5.5ZM8 9h8M8 12.5h5" />
  ),
  sparkles: (
    <path d="m11 3.5 1.9 4.6 4.6 1.9-4.6 1.9L11 16.5l-1.9-4.6L4.5 10l4.6-1.9L11 3.5ZM18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
  ),
  megaphone: (
    <path d="M3.5 10.5v3a1 1 0 0 0 1 1H7l7 4.5V5L7 9.5H4.5a1 1 0 0 0-1 1ZM17.5 9a4 4 0 0 1 0 6M7 14.5l1.2 5h2.4l-1-4.2" />
  ),
  trendingUp: <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />,
  appWindow: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 8.5h18M7.5 12.5h4M7.5 15.5h9" />
    </>
  ),
  headset: (
    <path d="M4 15v-3a8 8 0 0 1 16 0v3M4 15a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2v1ZM20 15a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2v1ZM18 17v.5a2.5 2.5 0 0 1-2.5 2.5H13" />
  ),
  phone: (
    <path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  store: <path d="M4 10v10h16V10M3 10l1.8-6h14.4L21 10H3ZM9.5 20v-5.5h5V20" />,
  factory: <path d="M3 20V11l5 3v-3l5 3v-3l5 3V4h3v16H3ZM7 17h2M12 17h2" />,
  building: <path d="M5 20V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M15 10h3a1 1 0 0 1 1 1v9M3 20h18M8.5 8h3M8.5 11.5h3M8.5 15h3" />,
  health: (
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20ZM8 12h2l1.2-2 1.6 4 1.2-2h2" />
  ),
  education: <path d="M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9ZM6.5 11v4.5c1.5 1.4 3.4 2 5.5 2s4-.6 5.5-2V11M21.5 9v5" />,
  coffee: <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5V6M12 3.5V6" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13" />,
  sliders: (
    <>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </>
  ),
  sprout: (
    <path d="M12 20v-8M12 12c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5ZM12 14.5c0-3-2.3-5-5.5-5 0 3 2.3 5 5.5 5Z" />
  ),
  layers: <path d="m12 3.5 9 4.5-9 4.5L3 8l9-4.5ZM3 12.5l9 4.5 9-4.5M3 16.5 12 21l9-4.5" />,
  shield: <path d="M12 3.5 19 6v5.5c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6l7-2.5ZM9 12l2.2 2.2L15.5 10" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
} satisfies Record<string, ReactNode>;


export type CampaignIconName = keyof typeof PATHS | "whatsapp";

type CampaignIconProps = {
  name: CampaignIconName;
  size?: number;
  className?: string;
};

/** Decorative by default — the adjacent text always carries the meaning. */
export function CampaignIcon({ name, size = 24, className }: CampaignIconProps) {
  if (name === "whatsapp") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
        <path d={WHATSAPP_ICON_PATH} />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
