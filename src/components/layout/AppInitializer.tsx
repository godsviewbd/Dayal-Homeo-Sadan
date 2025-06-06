'use client';

import { useState, useEffect, type ReactNode, useRef } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Dynamically import the WebGL splash screen to ensure it's client-side only
const DynamicSplashScreen = dynamic(
  () => import('@/components/layout/SplashScreenWebGL').then(mod => mod.SimpleSplashScreen),
  { 
    ssr: false,
    // No loading fallback needed here as AppInitializer controls visibility directly
  } 
);

interface AppInitializerProps {
  children: ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [canRenderSplash, setCanRenderSplash] = useState(false); // New state
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure splash is only attempted to render client-side after mount
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
    // This effect now only runs if canRenderSplash is true
    if (canRenderSplash && typeof window !== 'undefined') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setIsAppReady(true);
      }, 2500); // Keep existing duration for now

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [canRenderSplash]); // Depend on canRenderSplash

  return (
    <>
      {!isAppReady && canRenderSplash && <DynamicSplashScreen onSkip={handleSkipSplash} />}
      
      <div className={cn(
        'transition-opacity duration-500 ease-in-out',
        isAppReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        {children}
      </div>
    </>
  );
}
