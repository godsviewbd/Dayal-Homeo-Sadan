
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
  
  let pwaInitializerFunction;
  // Check if the module itself is the function (common for CJS modules)
  if (typeof pwaPluginModule === 'function') {
    pwaInitializerFunction = pwaPluginModule;
  } 
  // Check if it's an object with a .default function (common for ESM transpiled to CJS)
  else if (pwaPluginModule && typeof pwaPluginModule.default === 'function') {
    pwaInitializerFunction = pwaPluginModule.default;
  } 
  // If neither, the module structure is unexpected
  else {
    throw new Error(
      '@ducanh2912/next-pwa module resolved, but it is not a function and has no .default function.'
    );
  }

  // Initialize the PWA plugin with its options
  const withPWA = pwaInitializerFunction(pwaConfigOptions);
  
  // Wrap the base Next.js config with the PWA plugin
  finalConfig = withPWA(baseNextConfig);
  console.log("Successfully loaded and applied @ducanh2912/next-pwa to Next.js config.");

} catch (error) {
  console.warn(
    "Warning: Could not load or apply @ducanh2912/next-pwa. PWA features might be disabled. Error details:",
    error
  );
  // finalConfig remains the baseNextConfig if PWA plugin fails
}

module.exports = finalConfig;
