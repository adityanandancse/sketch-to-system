import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  devIndicators: false,
  // Kept from the create-next-app scaffold: this is how Tailwind v4 is
  // compiled in this Next.js version (no PostCSS config is generated).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
