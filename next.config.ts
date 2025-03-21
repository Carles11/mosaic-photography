import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.mosaic.photography",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.ko-fi.com",
        port: "",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 2678400, // 31 days
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig); // Configuring PWA with Next.js configuration
