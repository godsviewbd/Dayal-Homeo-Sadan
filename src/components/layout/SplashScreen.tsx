
'use client';

import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onSkip?: () => void;
}

export function SimpleSplashScreen({ onSkip }: SplashScreenProps) {
  // Path definitions for SVG tendrils
  // These are simple curves; more complex paths can be designed
  const tendrilPaths = [
    { d: "M0,50 Q50,0 100,50 T200,50", delay: "0.3s" },
    { d: "M0,50 Q50,100 100,50 T200,50", delay: "0.5s", transform: "scale(1, -1) translate(0, -100)"}, // Flipped and shifted
    { d: "M50,0 Q0,50 50,100 T50,200", delay: "0.7s", transform: "scale(-1, 1) translate(-100, 0)" }, // Flipped horizontally
  ];

  return (
    <div
      role="status"
      aria-label="দয়াল হোমিও সদন is starting, please wait"
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden",
        "bg-gradient-to-b from-splash-bg-light-start to-splash-bg-light-end",
        "dark:from-splash-bg-dark-start dark:to-splash-bg-dark-end",
        "cursor-pointer"
      )}
      onClick={onSkip}
    >
      {/* Central Pulsing Glow - Animates with 'pulse-glow' from globals.css */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full",
          "bg-splash-glow-light dark:bg-splash-glow-dark",
          "opacity-0 motion-safe:animate-pulse-glow motion-safe:[animation-delay:0.1s]"
        )}
      />

      {/* SVG Container for Growing Tendrils */}
      <svg 
        width="300" 
        height="300" 
        viewBox="-50 -50 300 300" /* Adjusted viewBox for centering paths around origin */
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:0.2s]"
        style={{ zIndex: 1 }} /* Ensure SVGs are above glow but below logo */
      >
        {tendrilPaths.map((path, index) => (
          <path
            key={index}
            d={path.d}
            stroke="hsl(var(--splash-tendril-light))"
            className="dark:!stroke-splash-tendril-dark" /* Using !important to override inline stroke if needed, or ensure specificity */
            strokeWidth="3"
            fill="transparent"
            strokeLinecap="round"
            style={{ animationDelay: path.delay, transform: path.transform || 'none' }}
            // Applying the path-drawing class defined in globals.css
            // Tailwind animation utility 'animate-draw-path' refers to this
            // The actual animation (drawPath) is defined in globals.css
            // We need a way for Tailwind to apply this custom animation.
            // The animate-draw-path utility in tailwind.config.js should correctly apply the 'drawPath' animation.
            // However, direct class might be needed if Tailwind doesn't pick it up due to dynamic stroke-dasharray/offset.
            // Let's rely on animate-draw-path from tailwind config first.
            // If it doesn't work, we'd use className="path-drawing" and ensure globals.css is processed.
            // For now, using Tailwind's utility.
            // UPDATE: Tailwind's animation utility should work if defined correctly.
            // Let's use the class directly that refers to the @keyframes in globals.css for clarity.
            // This is a common pattern for complex CSS animations not easily mapped by Tailwind variants.
            // Forcing Tailwind to recognize path-drawing
            // Using the generated Tailwind animation class for consistency
            // Tailwind should generate 'animate-draw-path' from the config.
            // Using a custom class to be safe with SVG specific properties
            // Class 'path-drawing' is defined in globals.css with @keyframes
            // The actual animation "drawPath" is applied through this class
            // The `animate-draw-path` utility should now apply this
          />
        ))}
      </svg>
      
      {/* Logo and Text Content - Higher z-index */}
      <div className="relative flex flex-col items-center text-center" style={{ zIndex: 10 }}>
        {/* Initial faint leaf, fades out as main logo appears */}
         <Leaf
          className={cn(
            "mb-3 h-16 w-16 md:h-20 md:w-20",
            "text-splash-logo-text-light/30 dark:text-splash-logo-text-dark/30", // Faint
            "opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:0.2s]",
            "motion-safe:[animation-duration:0.5s]", // Quick fade in
            // This leaf will be replaced by the 'blossoming' one.
            // We need a way to fade this out when the main logo appears.
            // For now, let it persist slightly longer and overlap.
            // A more complex solution would use JS to toggle classes.
            // Simpler: just let the main logo animation cover it.
          )}
        />

        {/* Main Leaf Logo - Blossoms in */}
        <div className="opacity-0 motion-safe:animate-logoBlossom motion-safe:[animation-delay:1.5s]">
          <Leaf
            className={cn(
              "mb-3 h-20 w-20 md:h-24 md:w-24",
              "text-splash-logo-text-light dark:text-splash-logo-text-dark"
            )}
          />
        </div>
        <h1
          className={cn(
            "text-3xl font-semibold md:text-4xl",
            "text-splash-logo-text-light dark:text-splash-logo-text-dark",
            "opacity-0 motion-safe:animate-textEmerge motion-safe:[animation-delay:1.8s]"
          )}
        >
          দয়াল হোমিও সদন
        </h1>
        <p
          className={cn(
            "mt-2 text-sm md:text-base",
            "text-splash-logo-text-light/80 dark:text-splash-logo-text-dark/80",
            "opacity-0 motion-safe:animate-textEmerge motion-safe:[animation-delay:2.0s]"
          )}
        >
          Your Homeopathic Inventory Companion
        </p>
      </div>

      {/* Indeterminate Progress Bar - appears after main animations */}
      <div className="absolute bottom-[20%] md:bottom-[22%] w-48 h-1.5 bg-teal-600/30 dark:bg-teal-400/30 rounded-full overflow-hidden opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:2.2s]">
        <div className="h-full w-1/3 bg-teal-500 dark:bg-teal-300 rounded-full motion-safe:animate-indeterminateProgress"></div>
      </div>
      
      {/* "Loading..." Text - appears with progress bar */}
      <p
        className={cn(
          "absolute bottom-12 px-4 text-center text-xs",
          "text-teal-600/80 dark:text-teal-400/80",
           "opacity-0 motion-safe:animate-subtlePulse motion-safe:[animation-delay:2.2s]"
        )}
      >
        Loading your inventory…
      </p>

      {/* "Tap to continue" Text - appears last */}
      <p
        className={cn(
          "absolute bottom-6 px-4 text-center text-xs", 
          "text-teal-600 dark:text-teal-400",
          "opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:2.5s]"
        )}
      >
        Tap to continue
      </p>
    </div>
  );
}

    