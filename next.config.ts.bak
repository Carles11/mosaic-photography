import type { NextConfig } from "next";
import withPWA from "next-pwa";
import withBundleAnalyzer from "@next/bundle-analyzer";
import pwaConfig from "./pwa.config";

const isDev = process.env.NODE_ENV === "development";

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
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dktizqbky/image/upload/**",
      },
    ],
    minimumCacheTTL: 31536000, // 1 year
  },
  webpack: (config, { isServer }) => {
    config.optimization.splitChunks = {
      chunks: "all",
      minSize: 20000,
      maxSize: 100000,
    };

    if (!isServer) {
      config.resolve.alias["moment"] = "moment/min/moment-with-locales";
    }

    return config;
  },

  // ✅ Headers for static asset access and SEO crawling
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:;",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      // Allow bots and tools to access _next static files
      {
        source: "/_next/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Optional: Improve preloadability of your manifest file
      {
        source: "/site.webmanifest",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
    ];
  },
};
console.log({ isDev });
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(
  withPWA({
    dest: "public",
    register: !isDev,
    disable: isDev, // Keep disabled unless going full PWA
    ...pwaConfig,
  })(nextConfig),
);
