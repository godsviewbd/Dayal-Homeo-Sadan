
// Removed "use client";

import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
// Removed SimpleSplashScreen import, it will be handled by AppInitializer
import { Toaster } from "@/components/ui/toaster";
// Removed useState, useEffect
import { cn } from '@/lib/utils';
import { AppInitializer } from '@/components/layout/AppInitializer'; // New import

export const metadata: Metadata = { // This can now stay
  title: 'HomeoWise - Homeopathic Inventory Management',
  description: 'Efficiently manage your homeopathic medicine inventory with AI-powered insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Removed isAppReady state and useEffect for splash screen

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* System fonts are now primary via Tailwind config, no direct link needed */}
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
         <a href="#main-content" className="skip-link">Skip to content</a>

        <AppInitializer>
          <AppShell>{children}</AppShell>
        </AppInitializer>
        
        <Toaster />
      </body>
    </html>
  );
}
