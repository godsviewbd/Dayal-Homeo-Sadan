
'use client';
import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Search, Package, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Search', icon: Search },
    { href: '/inventory', label: 'Inventory', icon: Package },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 hidden h-16 w-full border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80 md:flex">
        <div className="container mx-auto flex h-full items-center px-8">
          <Link href="/" className="mr-8 flex items-center space-x-2" aria-label="HomeoWise Home">
            <Leaf className="h-6 w-6 text-primary-500 dark:text-primary-300" />
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">HomeoWise</span>
          </Link>
          <nav className="flex flex-1 items-center space-x-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn(
                  "nav-link-desktop h-10 px-4 text-base font-medium text-gray-800 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-300",
                  pathname === link.href && "active text-primary-500 dark:text-primary-300"
                )}
              >
                <Link href={link.href}>
                  <link.icon className="mr-2 h-5 w-5" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
          <Button
            asChild
            className="h-11 min-h-[44px] rounded-full bg-primary-500 px-4 py-2 text-base font-medium text-white shadow-md hover:bg-primary-600 active:scale-95 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-500"
          >
            <Link href="/inventory/add">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Medicine
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        {/* Mobile: px-4, Tablet: px-6, Desktop: px-8 / py-6, sm:py-8, lg:py-12 */}
        {/* Padding applied by child pages based on spec */}
        <div className="pb-14 md:pb-0"> {/* Padding bottom for mobile bottom nav */}
            {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900 md:hidden">
        <Link href="/" passHref legacyBehavior>
          <a className={cn(
            "flex flex-1 flex-col items-center justify-center text-xs",
            pathname === '/' ? "text-primary-500 dark:text-primary-300" : "text-gray-700 dark:text-gray-300"
          )}>
            <Search className="h-6 w-6" />
            <span>Search</span>
          </a>
        </Link>
        
        {/* Floating Action Button for Add */}
        <div className="relative flex-1">
          <Link href="/inventory/add" passHref legacyBehavior>
            <a className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 transform items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 active:scale-95 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-500">
              <PlusCircle className="h-7 w-7" />
              <span className="sr-only">Add Medicine</span>
            </a>
          </Link>
        </div>

        <Link href="/inventory" passHref legacyBehavior>
          <a className={cn(
            "flex flex-1 flex-col items-center justify-center text-xs",
            pathname.startsWith('/inventory') ? "text-primary-500 dark:text-primary-300" : "text-gray-700 dark:text-gray-300"
          )}>
            <Package className="h-6 w-6" />
            <span>Inventory</span>
          </a>
        </Link>
      </nav>

      {/* Desktop Footer */}
      <footer className="hidden border-t border-gray-200 bg-white py-4 dark:border-gray-700 dark:bg-gray-900 md:block">
        <div className="container mx-auto flex flex-col items-center justify-center text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} HomeoWise. Advanced Homeopathic Inventory.
          </p>
        </div>
      </footer>
    </div>
  );
}
