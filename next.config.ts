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
        hostname: "gdzqgrfitiixbhlhppef.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    minimumCacheTTL: 31536000,
    qualities: [25, 40, 60, 75],
    formats: ["image/webp"],
    deviceSizes: [231, 358, 471, 600, 750, 900, 1200],
    imageSizes: [200, 250, 400],
  },
  experimental: {
    optimizeCss: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      resourceQuery: /raw/,
      type: "asset/source",
    });
    return config;
  },
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
            value: [
              "default-src 'self';",
              "img-src 'self' data: https://cdn.mosaic.photography https://storage.ko-fi.com https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms;",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https:;",
              "style-src 'self' 'unsafe-inline' https:;",
              "font-src 'self' data: https:;",
              [
                "connect-src 'self'",
                "https://cdn.mosaic.photography",
                "https://*.supabase.co",
                "wss://*.supabase.co",
                "https://storage.ko-fi.com",
                "https://www.googletagmanager.com",
                "https://www.google-analytics.com",
                "https://region1.google-analytics.com",
                "https://region2.google-analytics.com",
                "https://region3.google-analytics.com",
                "https://region4.google-analytics.com",
                "https://region5.google-analytics.com",
                "https://region6.google-analytics.com",
                "https://region7.google-analytics.com",
                "https://region8.google-analytics.com",
                "https://region9.google-analytics.com",
                "https://region10.google-analytics.com",
                "https://www.clarity.ms;",
              ].join(" "),
            ].join(" "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
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
    disable: isDev,
    ...pwaConfig,
  })(nextConfig)
);
