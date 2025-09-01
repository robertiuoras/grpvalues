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

  // Webpack configuration to prevent module resolution errors
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable aggressive caching in development to prevent module errors
      config.cache = false;
      
      // Better chunk management to prevent './985.js' errors
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Create more stable chunks
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
      
      // Disable webpack 5 persistent caching that causes issues
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: '.next/cache',
        compression: 'gzip',
        maxAge: 172800000, // 2 days
        store: 'pack',
        version: '1.0.0',
      };
    }
    
    // Better module resolution
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      },
    };
    
    return config;
  },
};

export default nextConfig;
