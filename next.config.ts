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

  // Cache management to prevent CSS breaking
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Webpack configuration for better cache management
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable aggressive caching in development
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
