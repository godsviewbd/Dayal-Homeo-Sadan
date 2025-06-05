
'use client';
import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Search, Package, PlusCircle, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    // Moved theme initialization to a separate effect to run once on mount
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      // Default to light theme if nothing is stored
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);


  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  }, []);


  const navLinks = [
    { href: '/', label: 'Search', icon: Search },
    { href: '/inventory', label: 'Inventory', icon: Package },
  ];

  if (theme === null) {
    // Still determining theme, render minimal UI or a loader
    // For simplicity, we'll render a slimmed-down version or null to avoid layout shifts.
    // Or better, a skeleton for the shell itself. For now, return a simple placeholder.
    return <div className="flex min-h-screen flex-col bg-background text-foreground">Loading theme...</div>;
  }

  const ThemeToggleButton = ({ className }: { className?: string }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={cn("h-10 w-10 text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-300", className)}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Mobile Header - Section 1.1 */}
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-gray-200 bg-white/80 px-4 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80 md:hidden">
        <Link href="/" className="flex items-center space-x-2" aria-label="HomeoWise Home">
          <Leaf className="h-5 w-5 text-primary-500 dark:text-primary-300" />
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">HomeoWise</span>
        </Link>
        <ThemeToggleButton className="h-8 w-8" />
      </header>

      {/* Desktop Header - Section 1.2 */}
      <header className="sticky top-0 z-50 hidden h-16 w-full border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80 md:flex">
        <div className="container mx-auto flex h-full items-center px-8">
          <Link href="/" className="mr-8 flex items-center space-x-2" aria-label="HomeoWise Home">
            <Leaf className="h-6 w-6 text-primary-500 dark:text-primary-300" />
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">HomeoWise</span>
          </Link>
          <nav className="flex flex-1 items-center space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === "/inventory" && pathname.startsWith("/inventory"));
              return (
                <Button
                  key={link.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "nav-link-desktop h-10 px-4 text-base font-medium text-gray-800 hover:text-teal-600 dark:text-gray-100 dark:hover:text-teal-300",
                    isActive && "active text-primary-500 dark:text-primary-300"
                  )}
                  data-active={isActive}
                >
                  <Link href={link.href}>
                    <link.icon className="mr-2 h-5 w-5" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
          <ThemeToggleButton className="mr-2" />
          <Button
            asChild
            className="btn-primary h-11 min-h-[44px] !rounded-full px-4 py-2 text-base"
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
        <div className="pb-14 pt-0 md:pb-0 md:pt-0">
             {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar - Section 1.1 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900 md:hidden">
        <Link href="/" passHref legacyBehavior>
          <a className={cn(
            "flex flex-col items-center justify-center py-1 text-xs w-1/3",
            pathname === '/' ? "text-teal-500 dark:text-teal-300" : "text-gray-700 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-300"
          )}>
            <Search className="h-6 w-6" />
            <span>Search</span>
          </a>
        </Link>
        
        <div className="relative w-14 flex-shrink-0"> {/* Container for FAB, to take up space */}
          <Link href="/inventory/add" passHref legacyBehavior>
            <a 
              aria-label="Add Medicine"
              className="absolute -top-8 left-1/2 flex h-14 w-14 -translate-x-1/2 transform items-center justify-center rounded-full bg-teal-500 text-white shadow-lg transition-transform duration-150 hover:bg-teal-600 active:scale-95 dark:bg-teal-400 dark:text-gray-900 dark:hover:bg-teal-500"
            >
              <PlusCircle className="h-7 w-7" />
            </a>
          </Link>
        </div>

        <Link href="/inventory" passHref legacyBehavior>
          <a className={cn(
            "flex flex-col items-center justify-center py-1 text-xs w-1/3",
            (pathname === '/inventory' || pathname.startsWith('/inventory/')) ? "text-teal-500 dark:text-teal-300" : "text-gray-700 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-300"
          )}>
            <Package className="h-6 w-6" />
            <span>Inventory</span>
          </a>
        </Link>
      </nav>

      {/* Footer - Now visible on all screen sizes */}
      <footer className="border-t border-gray-200 bg-white py-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} HomeoWise. Advanced Homeopathic Inventory.
          </p>
        </div>
      </footer>
    </div>
  );
}
