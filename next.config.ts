import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js to bundle for Vercel correctly
  output: "standalone",

  // Image optimization configuration for external domains
  images: {
    // Allow external domains for image optimization
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
    // Specific domains for Firebase Storage and Google services
    domains: [
      "drive.google.com",
      "lh3.googleusercontent.com",
      "docs.google.com",
      "storage.googleapis.com",
      "firebasestorage.googleapis.com",
      "firebaseapp.com",
    ],
    // Enhanced image optimization settings for Firebase Storage
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Firebase Storage specific settings
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

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
