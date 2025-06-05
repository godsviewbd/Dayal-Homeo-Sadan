
'use client';

import { useState, useEffect, type ReactNode, useRef } from 'react';
import { SimpleSplashScreen } from '@/components/layout/SplashScreen';
import { cn } from '@/lib/utils';

interface AppInitializerProps {
  children: ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isAppReady, setIsAppReady] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Ref to hold the timer

  const handleSkipSplash = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current); // Clear the existing timer
    }
    setIsAppReady(true); // Immediately set app as ready
  };

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      // Clear any existing timer before setting a new one (e.g., on hot reload)
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setIsAppReady(true);
      }, 2500); // Splash screen visible for 2.5 seconds

      // Cleanup function to clear the timer if the component unmounts
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, []);

  return (
    <>
      {!isAppReady && <SimpleSplashScreen onSkip={handleSkipSplash} />}
      
      <div className={cn(
        'transition-opacity duration-500 ease-in-out',
        isAppReady ? 'opacity-100' : 'opacity-0 pointer-events-none' // Added pointer-events-none when hidden
      )}>
        {/* Render children only when ready to avoid premature rendering issues and allow content to be present for fade-in */}
        {children}
      </div>
    </>
  );
}
