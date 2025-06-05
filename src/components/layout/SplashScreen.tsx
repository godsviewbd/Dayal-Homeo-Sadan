
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onSkip?: () => void;
}

export function SimpleSplashScreen({ onSkip }: SplashScreenProps) {
  return (
    <div
      role="status"
      aria-label="দয়াল হোমিও সদন is starting, please wait"
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden", // Added overflow-hidden
        "bg-gradient-to-b from-[#E5F2F0] to-[#F9FAFB]",
        "dark:from-[#1F2A37] dark:to-[#111827]"
      )}
      onClick={onSkip} // Added onClick handler for "tap to skip"
    >
      {/* Frosted Glass Panel (behind logo/text) */}
      <div
        className={cn(
          "absolute motion-safe:animate-frostedReveal",
          "w-72 h-48 md:w-96 md:h-64", // Responsive size for the panel
          "bg-white/20 dark:bg-gray-800/30",
          "backdrop-blur-md rounded-3xl", // Using backdrop-blur-md as a good general value
          "opacity-0" // Initial state for animation
        )}
      />

      {/* Logo + Name + Tagline - Centered and on top */}
      <div className="relative flex flex-col items-center text-center">
        <div className="motion-safe:animate-logoPopIn opacity-0"> {/* Wrapper for logo animation */}
          <Leaf
            className={cn(
              "mb-3 h-20 w-20 md:h-24 md:w-24",
              "text-teal-600 dark:text-teal-400"
            )}
          />
        </div>
        <h1
          className={cn(
            "text-3xl font-semibold md:text-4xl",
            "text-gray-900 dark:text-gray-100",
            "motion-safe:animate-textEmerge opacity-0 motion-safe:[animation-delay:0.5s]" // Staggered animation
          )}
        >
          দয়াল হোমিও সদন
        </h1>
        <p
          className={cn(
            "mt-2 text-sm md:text-base",
            "text-gray-700 dark:text-gray-300",
            "motion-safe:animate-textEmerge opacity-0 motion-safe:[animation-delay:0.7s]" // Staggered animation
          )}
        >
          Your Homeopathic Inventory Companion
        </p>
      </div>

      {/* Indeterminate Progress Bar */}
      <div className="absolute bottom-[20%] md:bottom-[22%] w-48 h-1.5 bg-teal-600/30 dark:bg-teal-400/30 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-teal-500 dark:bg-teal-300 rounded-full motion-safe:animate-indeterminateProgress"></div>
      </div>
      
      {/* "Tap to continue" Text - Fades in after a delay */}
      <p
        className={cn(
          "absolute bottom-8 px-4 text-center text-xs",
          "text-teal-600 dark:text-teal-400",
          "opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:1.2s]"
        )}
      >
        Tap to continue
      </p>

      {/* Bottom Status Text (Original) - Can be kept or removed based on preference with progress bar */}
      <p
        className={cn(
          "absolute bottom-3 px-4 text-center text-xs",
          "text-teal-600/80 dark:text-teal-400/80",
           "opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:0.9s]" // Fades in
        )}
      >
        Loading your inventory…
      </p>
    </div>
  );
}
