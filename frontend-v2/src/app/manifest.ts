import type { MetadataRoute } from "next";

// Required for output:"export" — this route has no per-request data, so it's
// safe to prerender once at build time like every other static page here.
export const dynamic = "force-static";

/**
 * Minimal web-app manifest (W3.BRAND.1 §15) — exists to declare the 192×192
 * and 512×512 icon sizes for future app-icon/home-screen use. Not a PWA
 * feature build-out (no offline/service-worker behavior implied).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AROORAA",
    short_name: "AROORAA",
    icons: [
      { src: "/images/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: "#0d0e13",
    background_color: "#ffffff",
    display: "standalone",
  };
}
