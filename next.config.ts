
import type {NextConfig} from 'next';

// PWA specific options
const pwaConfigOptions = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in dev to avoid HMR issues
};

// Your base Next.js configuration
const baseNextConfig: NextConfig = {
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

let finalConfig: NextConfig | ((phase: string, defaultConfig: any) => NextConfig) = baseNextConfig;

try {
  const pwaPluginModule = require('@ducanh2912/next-pwa');
  let pwaActualPlugin: any = null; 

  // Determine the actual plugin function from the required module
  if (typeof pwaPluginModule === 'function') {
    pwaActualPlugin = pwaPluginModule;
  } else if (pwaPluginModule && typeof pwaPluginModule.default === 'function') {
    pwaActualPlugin = pwaPluginModule.default;
  }

  // Check if we successfully found a PWA plugin function
  if (typeof pwaActualPlugin === 'function') {
    const withPWA = pwaActualPlugin(pwaConfigOptions); // Step 1: Configure the PWA plugin

    // Check if the configured PWA plugin returned a valid wrapper function
    if (typeof withPWA === 'function') {
      finalConfig = withPWA(baseNextConfig); // Step 2: Apply the PWA wrapper to the Next.js config
      console.log("Successfully loaded and applied @ducanh2912/next-pwa to Next.js config.");
    } else {
      console.warn(
        "Warning: @ducanh2912/next-pwa did not return a valid wrapper function after initialization. PWA features might be disabled."
      );
      // finalConfig remains baseNextConfig
    }
  } else {
    console.warn(
        "Warning: @ducanh2912/next-pwa module could not be resolved to an executable PWA plugin function. PWA features will be disabled."
    );
    // finalConfig remains baseNextConfig
  }
} catch (error) {
  console.warn(
    "Warning: Error during PWA setup with @ducanh2912/next-pwa. PWA features will be disabled. Error details:",
    error
  );
  // finalConfig remains baseNextConfig in case of any error
}

module.exports = finalConfig;
