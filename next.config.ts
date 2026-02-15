import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/reports": ["./node_modules/@neslinesli93/qpdf-wasm/dist/*.wasm"],
  },
};

export default nextConfig;
