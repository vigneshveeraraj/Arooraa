import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Static export builds must not declare rewrites/redirects/headers at all —
// Next.js's export validator rejects the build if the keys are merely present.
// Local dev instead proxies same-origin `/api/leads/*` calls to the backend so
// the browser never needs cross-origin requests or hard-coded ports.
const nextConfig: NextConfig = isDev
  ? {
      async rewrites() {
        return [
          {
            source: "/api/leads/:path*",
            destination: "http://localhost:8090/api/v1/:path*",
          },
        ];
      },
    }
  : {
      output: "export",
      images: { unoptimized: true },
    };

export default nextConfig;
