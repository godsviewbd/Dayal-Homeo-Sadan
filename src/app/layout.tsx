
"use client"; // Add this directive

import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { SimpleSplashScreen } from '@/components/layout/SplashScreen'; // Updated import
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'HomeoWise - Homeopathic Inventory Management',
  description: 'Efficiently manage your homeopathic medicine inventory with AI-powered insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setIsAppReady(true);
      }, 2000); // Splash screen visible for 2 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* System fonts are now primary via Tailwind config, no direct link needed */}
      </head>
      {/* font-sans is now the system font stack from tailwind.config.ts */}
      <body className="font-sans antialiased bg-background text-foreground">
         <a href="#main-content" className="skip-link">Skip to content</a>

        {!isAppReady && <SimpleSplashScreen />}
        
        {/* AppShell and children will fade in */}
        <div className={cn(
          'transition-opacity duration-500 ease-in-out',
          isAppReady ? 'opacity-100' : 'opacity-0'
        )}>
          <AppShell>{children}</AppShell>
        </div>
        
        <Toaster />
      </body>
    </html>
  );
}
