
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
      {/* Desktop Header - Section 1.2 */}
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
                  "nav-link-desktop h-10 px-4 text-base font-medium text-gray-800 hover:text-teal-600 dark:text-gray-100 dark:hover:text-teal-300",
                  pathname === link.href && "active text-primary-500 dark:text-primary-300" // 'active' class for CSS rule
                )}
                data-active={pathname === link.href} // data-active for CSS rule if needed
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
            // Styling from Section 1.2 for "Add Medicine" button (Desktop)
            className="h-11 min-h-[44px] rounded-full bg-teal-500 px-4 py-2 text-base font-medium text-white shadow-md hover:bg-teal-600 active:scale-95 dark:bg-teal-400 dark:text-gray-900 dark:hover:bg-teal-500 transition-transform duration-150"
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
        {/* Padding applied by child pages based on spec */}
        {/* pb-14 for mobile bottom nav (h-14), md:pb-0 to remove it on larger screens */}
        <div className="pb-14 md:pb-0"> 
            {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar - Section 1.1 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900 md:hidden">
        <Link href="/" passHref legacyBehavior>
          <a className={cn(
            "flex flex-1 flex-col items-center justify-center text-xs",
            pathname === '/' ? "text-teal-500 dark:text-teal-300" : "text-gray-700 dark:text-gray-300"
          )}>
            <Search className="h-6 w-6" />
            <span>Search</span>
          </a>
        </Link>
        
        {/* Floating Action Button for Add - Section 1.1 */}
        {/* Relative positioning for the container, absolute for the button itself */}
        <div className="relative flex flex-1 items-center justify-center"> {/* flex-1 to take up space */}
          <Link href="/inventory/add" passHref legacyBehavior>
            <a 
              aria-label="Add Medicine" // UX Writing Guideline 15.1
              className="absolute -top-7 flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg transition-transform duration-150 hover:bg-teal-600 active:scale-95 dark:bg-teal-400 dark:text-gray-900 dark:hover:bg-teal-500"
            >
              <PlusCircle className="h-7 w-7" />
            </a>
          </Link>
        </div>

        <Link href="/inventory" passHref legacyBehavior>
          <a className={cn(
            "flex flex-1 flex-col items-center justify-center text-xs",
            pathname.startsWith('/inventory') ? "text-teal-500 dark:text-teal-300" : "text-gray-700 dark:text-gray-300"
          )}>
            <Package className="h-6 w-6" />
            <span>Inventory</span>
          </a>
        </Link>
      </nav>

      {/* Desktop Footer - Section 1.3 */}
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
