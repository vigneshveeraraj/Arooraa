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

const nextConfig: NextConfig = isDev
  ? {
      async rewrites() {
        return [
          {
            source: "/api/admin/:path*",
            destination: "http://localhost:8090/api/v1/admin/:path*",
          },
        ];
      },
    }
  : {
      output: "export",
      images: { unoptimized: true },
    };

export default nextConfig;
