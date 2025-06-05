
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SimpleSplashScreen() { // Function name kept for consistency with AppInitializer, content is new
  return (
    <div
      role="status"
      aria-label="HomeoWise is starting, please wait"
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden",
        "bg-gradient-to-b from-[#E5F2F0] to-[#F9FAFB]", // Light mode gradient
        "dark:from-[#1F2A37] dark:to-[#111827]" // Dark mode gradient
      )}
    >
      {/* Logo + Name + Tagline */}
      <div className="flex flex-col items-center text-center motion-safe:animate-fadeInUpDelayed">
        <Leaf
          className={cn(
            "mb-4 h-20 w-20 md:h-28 md:w-28", // Adjusted size for responsiveness
            "text-teal-600 dark:text-teal-400" // Using teal shades from theme for better contrast
          )}
        />
        <h1
          className={cn(
            "text-3xl font-semibold md:text-4xl",
            "text-gray-900 dark:text-gray-100"
          )}
        >
          HomeoWise
        </h1>
        <p
          className={cn(
            "mt-2 text-sm md:text-base",
            "text-gray-700 dark:text-gray-300"
          )}
        >
          Your Homeopathic Inventory Companion
        </p>
      </div>

      {/* Loading Indicator - Pulsing Dot */}
      <div
        className={cn(
          "absolute",
          "bottom-[20%] md:bottom-[25%]" // Positioned roughly 2/3 down, adjusted for different text
        )}
      >
        <div
          className={cn(
            "h-3 w-3 rounded-full motion-safe:animate-pulse",
            "bg-teal-500 dark:bg-teal-300" // Primary Teal colors
          )}
        />
      </div>

      {/* Bottom Status Text */}
      <p
        className={cn(
          "absolute bottom-6 px-4 text-center text-xs",
          "text-teal-600 dark:text-teal-400"
        )}
      >
        Loading your inventory…
      </p>
    </div>
  );
}
