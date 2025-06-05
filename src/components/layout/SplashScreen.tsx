
import { Leaf } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center animate-fadeInScale">
        <Leaf className="h-16 w-16 text-primary-500 dark:text-primary-300 mb-4" />
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          HomeoWise
        </h1>
      </div>
    </div>
  );
}

// Add a simple keyframe and animation utility directly in tailwind.config.ts if more complex animations are needed
// For now, a simple presence and timed removal + app fade-in will be handled in layout.tsx.
// The animate-fadeInScale is a placeholder for a potential animation to be defined in tailwind.config.ts or globals.css
// If not defined, it will just appear. Let's remove it for now for simplicity and rely on AppShell fade-in.

// Re-simplifying:
export function SimpleSplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <Leaf className="h-16 w-16 text-primary-500 dark:text-primary-300 mb-4" />
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
        HomeoWise
      </h1>
    </div>
  );
}
