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
  webpack: (config, { isServer }) => {
    // Example: Split chunks further
    config.optimization.splitChunks = {
      chunks: "all",
      minSize: 20000, // Minimum size for a chunk (in bytes)
      maxSize: 100000, // Maximum size for a chunk (in bytes)
    };

    // Example: Remove moment.js locales to reduce size
    if (!isServer) {
      config.resolve.alias["moment"] = "moment/min/moment-with-locales";
    }

    return config;
  },
  async rewrites() {
    // console.log("Applying rewrite rule for sitemap"); // Add this line for logging
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
