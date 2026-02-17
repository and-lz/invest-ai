import { execSync } from "child_process";
import type { NextConfig } from "next";

function getLastCommitMessage(): string {
  try {
    return execSync("git log -1 --format=%s", { encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

const cabecalhosSeguranca = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LAST_COMMIT_MESSAGE: getLastCommitMessage(),
  },
  poweredByHeader: false,
  eslint: {
    // Linting is already enforced by the pre-commit hook (eslint --max-warnings 0).
    // Skipping it during build avoids redundant work on Vercel deploys.
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ["recharts"],
  },
  outputFileTracingIncludes: {
    "/api/reports": ["./node_modules/@neslinesli93/qpdf-wasm/dist/*.wasm"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: cabecalhosSeguranca,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
