import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ allows deployment even with TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ⚠️ skips lint errors during build
  },
};

export default nextConfig;