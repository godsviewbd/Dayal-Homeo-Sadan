
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
        {/* System fonts are now primary via Tailwind config, no direct link needed */}
      </head>
      {/* font-sans is now the system font stack from tailwind.config.ts */}
      <body className="font-sans antialiased bg-background text-foreground">
         <a href="#main-content" className="skip-link">Skip to content</a>
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
