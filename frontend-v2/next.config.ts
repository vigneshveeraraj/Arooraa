import type { NextConfig } from "next";

// Static export from day one, matching how the public site is actually deployed
// (see ops/nginx/arooraa.com.conf + .github/workflows/deploy.yml on the legacy
// frontend).
//
// W3.2D.1: the admin app moved into this codebase, and admin APIs are
// deliberately never CORS-enabled (session cookie + CSRF requires
// same-origin — see backend SecurityConfig). In `next dev` there is no
// reverse proxy in front of this app, so without help, a request to
// /api/admin/* from http://localhost:3000 would be cross-origin to the
// backend on :8090 and get silently blocked. The safe fix is the same one
// the legacy frontend already uses for this exact problem: a dev-only
// Next.js rewrite that proxies /api/admin/* to the backend server-side, so
// the browser only ever sees a same-origin request. This must NOT be
// solved by adding an admin CORS origin — that would defeat the same-origin
// session model on every environment, not just localhost.
//
// A static export build must not declare rewrites at all (Next's export
// validator rejects the build if the key is merely present), so this is
// gated to dev only; production keeps using the real Nginx proxy at the
// same relative path (/api/admin/** -> the backend), which already exists
// and needs no change now that this app owns the admin routes.
const isDev = process.env.NODE_ENV !== "production";

// A8: the internal review pages are not routes in a production build.
//
// `/design-system` and `/design-system/aura` exist to be looked at during development — every
// component on one page, every Aura state on the other. Neither has ever been part of the public
// site, and both carry `robots: noindex`. That is not enough: noindex asks a crawler not to list a
// page that is nonetheless sitting on the server, reachable by anyone who types the URL, and the
// Aura page in particular renders states a visitor is never meant to see assembled in one place.
//
// So they are named `page.review.tsx` and that extension is a page extension only in development.
// In a production build Next does not see a `page` file in those directories, so there is no route
// to render, nothing is emitted into `out/`, and the pages cannot be served because they do not
// exist — rather than existing and asking politely not to be indexed. `robots.ts` keeps disallowing
// the path anyway, for anything already in an index.
//
// The defaults have to be repeated here: setting this key replaces the list rather than adding to
// it, and every other page, layout and not-found file in the app uses them.
const DEFAULT_PAGE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];

const nextConfig: NextConfig = isDev
  ? {
      pageExtensions: [...DEFAULT_PAGE_EXTENSIONS, "review.tsx"],
      async rewrites() {
        return [
          {
            source: "/api/admin/:path*",
            destination: "http://localhost:8090/api/v1/admin/:path*",
          },
          // A4: the same trick for Aura, and for a simpler reason than the admin one above — the
          // chat API has no cookies or CSRF to protect, it is just on a different port (8091) in
          // local development. Proxying it server-side keeps every browser request same-origin, so
          // `next dev` needs no CORS at all and no component contains a localhost URL. Production
          // will do the same thing with the real Nginx proxy at the same relative path, which is
          // out of scope for A4 (nothing is deployed).
          //
          // aura-service also ships an opt-in CORS allowance for anyone who would rather point
          // NEXT_PUBLIC_AURA_API_BASE_URL straight at :8091 — see aura.cors.allowed-origins. It is
          // empty by default, so this rewrite is the path that works out of the box.
          {
            source: "/api/aura/:path*",
            destination: "http://localhost:8091/api/v1/aura/:path*",
          },
        ];
      },
    }
  : {
      pageExtensions: DEFAULT_PAGE_EXTENSIONS,
      output: "export",
      images: { unoptimized: true },
    };

export default nextConfig;
