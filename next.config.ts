import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js to bundle for Vercel correctly
  output: "standalone",

  // (Optional but recommended) keep Turbopack safe
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
};

export default nextConfig;
