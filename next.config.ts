
import type {NextConfig} from 'next';

// Directly require the PWA plugin
const pwaPlugin = require('@ducanh2912/next-pwa');

// PWA specific options
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in dev to avoid HMR issues
  // You can add other PWA options here if needed
};

// Initialize the PWA plugin with its options
const withPWA = pwaPlugin(pwaConfig);

// Your base Next.js configuration
const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// Export the Next.js config wrapped with the PWA plugin
export default withPWA(nextConfig);
