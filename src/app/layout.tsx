
import type { Metadata } from 'next';
// Import AppInitializer directly. Since AppInitializer is a Client Component,
// Next.js will handle the client boundary correctly.
import { AppInitializer } from '@/components/layout/AppInitializer';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'দয়াল হোমিও সদন - Homeopathic Inventory Management',
  description: 'Efficiently manage your homeopathic medicine inventory with AI-powered insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* System fonts are now primary via Tailwind config, no direct link needed */}
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
         <a href="#main-content" className="skip-link">Skip to content</a>

        {/* AppInitializer is imported directly. It's a Client Component. */}
        <AppInitializer>
          <AppShell>{children}</AppShell>
        </AppInitializer>
        
        <Toaster />
      </body>
    </html>
  );
}
