
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'HomeoWise - Homeopathic Inventory Management',
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
        {/* PT Sans is defined as --font-sans in globals.css, loaded via Tailwind config */}
        {/* No need for direct Google Fonts link if relying on system fonts or already configured in Tailwind */}
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
         <a href="#main-content" className="skip-link">Skip to content</a>
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
