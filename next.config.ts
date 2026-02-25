import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  turbopack: {},
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
};

export default pwaConfig(nextConfig);
