
'use client';

import { useState, useEffect, type ReactNode, useRef } from 'react';
// Removed dynamic import from next/dynamic
import { SimpleSplashScreen } from '@/components/layout/SplashScreenWebGL'; // Direct import
import { cn } from '@/lib/utils';

interface AppInitializerProps {
  children: ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [canRenderSplash, setCanRenderSplash] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCanRenderSplash(true); // Allow splash rendering only after AppInitializer has mounted
  }, []);

  const handleSkipSplash = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current); 
    }
    setIsAppReady(true); 
  };

  useEffect(() => {
    if (canRenderSplash && typeof window !== 'undefined') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Retain existing splash duration for now
      timerRef.current = setTimeout(() => {
        setIsAppReady(true);
      }, 2500); 

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [canRenderSplash]);

  return (
    <>
      {/* Render SimpleSplashScreen directly, controlled by isAppReady and canRenderSplash */}
      {!isAppReady && canRenderSplash && <SimpleSplashScreen onSkip={handleSkipSplash} />}
      
      <div className={cn(
        'transition-opacity duration-500 ease-in-out',
        isAppReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        {children}
      </div>
    </>
  );
}
