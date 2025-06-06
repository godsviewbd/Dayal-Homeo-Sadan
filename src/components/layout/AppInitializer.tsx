
'use client';

import { useState, useEffect, type ReactNode, useRef } from 'react';
// Updated import path if SplashScreenWebGL.tsx exports SimpleSplashScreen
import { SimpleSplashScreen } from '@/components/layout/SplashScreenWebGL'; 
import { cn } from '@/lib/utils';

interface AppInitializerProps {
  children: ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isAppReady, setIsAppReady] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSkipSplash = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current); 
    }
    setIsAppReady(true); 
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Keeping existing duration, user wanted to keep splash screen logic as-is for now regarding duration.
      // This duration now applies to the WebGL splash.
      timerRef.current = setTimeout(() => {
        setIsAppReady(true);
      }, 2500); 

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
        isAppReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        {children}
      </div>
    </>
  );
}
