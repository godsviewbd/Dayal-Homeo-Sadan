
'use client';

import { useState, useEffect, type ReactNode, useRef } from 'react';
import dynamic from 'next/dynamic'; // Ensure dynamic is imported here
import { cn } from '@/lib/utils';

// Dynamically import SimpleSplashScreen (WebGL component) with ssr: false
// This is the correct place for ssr: false, as AppInitializer is a Client Component.
const DynamicSplashScreen = dynamic(
  () => import('@/components/layout/SplashScreenWebGL').then((mod) => mod.SimpleSplashScreen),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#1A1D2A] to-[#11131E] text-white">
        {/* Minimal fallback while the WebGL component chunk loads */}
      </div>
    ),
  }
);

interface AppInitializerProps {
  children: ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isAppReady, setIsAppReady] = useState(false);
  // canRenderSplash is useful to ensure this component itself has mounted before trying to render DynamicSplashScreen
  const [canRenderSplash, setCanRenderSplash] = useState(false); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // This ensures AppInitializer has mounted on the client
    setCanRenderSplash(true); 
  }, []);

  const handleSkipSplash = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current); 
    }
    setIsAppReady(true); 
  };

  useEffect(() => {
    // Only run the timer if we can render the splash (i.e., client-side)
    if (canRenderSplash) {
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
      {/* Render DynamicSplashScreen only on the client, after AppInitializer has mounted and if app is not ready */}
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
