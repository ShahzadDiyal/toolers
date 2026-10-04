import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Zero backend by design: everything renders client-side from localStorage.
  // (Static export is deliberately NOT used so dynamic routes + streaming stay available
  // for Phase 2 calculator pages.)
  poweredByHeader: false,
  reactStrictMode: true,
  // Phase 2 moved tools from /tools/[category]/[slug] to /tools/[slug].
  // Keep old links working permanently.
  async redirects() {
    return [
      {
        source: "/tools/:category/:slug",
        destination: "/tools/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    // No remote images needed in Phase 1; local assets only.
    remotePatterns: [],
  },
};

export default nextConfig;
