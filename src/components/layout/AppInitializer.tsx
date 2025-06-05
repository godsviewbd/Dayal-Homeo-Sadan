
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { SimpleSplashScreen } from '@/components/layout/SplashScreen';
import { cn } from '@/lib/utils';

interface AppInitializerProps {
  children: ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setIsAppReady(true);
      }, 2500); // Splash screen visible for 2.5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {!isAppReady && <SimpleSplashScreen />}
      
      {/* Content will fade in */}
      <div className={cn(
        'transition-opacity duration-500 ease-in-out', // Matches spec: fade out splash, app fades in
        isAppReady ? 'opacity-100' : 'opacity-0'
      )}>
        {isAppReady ? children : null /* Render children only when ready to avoid premature rendering issues */}
      </div>
    </>
  );
}
