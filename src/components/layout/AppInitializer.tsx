
'use client';

import { useState, useEffect, type ReactNode, useRef } from 'react';
import { SimpleSplashScreen } from './SplashScreen'; // Import the HTML/CSS splash screen
import { cn } from '@/lib/utils';

interface AppInitializerProps {
  children: ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [canRenderSplash, setCanRenderSplash] = useState(false); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCanRenderSplash(true); 
  }, []);

  const handleSkipSplash = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current); 
    }
    setIsAppReady(true); 
  };

  useEffect(() => {
    if (canRenderSplash) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Standard splash duration
      timerRef.current = setTimeout(() => {
        setIsAppReady(true);
      }, 2500); // Adjust as needed, e.g., 2500ms

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [canRenderSplash]);

  return (
    <>
      {/* Render SimpleSplashScreen (HTML/CSS version) */}
      {!isAppReady && canRenderSplash && <SimpleSplashScreen onSkip={handleSkipSplash} />}
      
      <div className={cn(
        'transition-opacity duration-500 ease-in-out', // Main app content fade-in
        isAppReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        {children}
      </div>
    </>
  );
}
