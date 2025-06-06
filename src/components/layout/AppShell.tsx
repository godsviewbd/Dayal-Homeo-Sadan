
'use client';
import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Search, Package, PlusCircle, Sun, Moon, Menu, Facebook, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      const initialTheme = systemPrefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
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
    return <div className="flex min-h-screen flex-col bg-background text-foreground items-center justify-center">Loading theme...</div>;
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
      {/* Mobile Header - Centered brand */}
      <header className="sticky top-0 z-40 grid h-12 grid-cols-3 items-center border-b border-gray-200 bg-white/80 px-4 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80 md:hidden">
        <div className="flex justify-start">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-3/4 max-w-xs p-0 md:hidden overflow-y-auto"
              aria-describedby="sheet-about-app-description" // Added aria-describedby
            >
              <SheetHeader className="border-b p-4 sticky top-0 bg-background z-10">
                <SheetTitle className="text-lg">অ্যাপ পরিচিতি — দয়াল হোমিও সদন</SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-3 text-sm text-muted-foreground">
                <p id="sheet-about-app-description">
                  দয়াল হোমিও সদন একটি সহজ, পরিষ্কার এবং বিশ্বস্ত হোমিওপ্যাথিক ওষুধ ব্যবস্থাপনার অ্যাপ। এটি ঘরোয়া চিকিৎসকদের এবং পরিবারের সদস্যদের জন্য তৈরি, যারা তাঁদের নিজস্ব ওষুধের তালিকা ও অবস্থান দ্রুত খুঁজে পেতে চান।
                </p>
                <p>এই অ্যাপের মাধ্যমে আপনি—</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>সহজে ওষুধ খুঁজে পেতে পারবেন</li>
                  <li>কোন ওষুধ কোন বাক্সে আছে তা দেখতে পারবেন</li>
                  <li>স্টকে থাকা ওষুধের পরিমাণ জানতে পারবেন</li>
                  <li>প্রয়োজনীয় ওষুধ নতুন করে যোগ করতে পারবেন</li>
                </ul>
                <p>
                  অ্যাপটি বিশেষভাবে ডিজাইন করা হয়েছে যাতে এটি মোবাইল-ফার্স্ট, দ্রুতগতির এবং ব্যবহারবান্ধব হয় — যেকোনো বয়সের ব্যবহারকারীর জন্য সহজবোধ্য।
                </p>
                
                <h3 className="text-md font-semibold text-foreground pt-3">👤 অ্যাপ নির্মাতা</h3>
                <p>
                  এই অ্যাপটি ভালোবাসা ও যত্নে তৈরি করেছেন <a href="https://www.facebook.com/share/1ASLPZfn9V/" target="_blank" rel="noopener noreferrer" className="underline text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">Sozib Sorkar</a> 💚.
                </p>
                <p>
                  আপনি চাইলে ফেসবুকে যোগাযোগ করতে পারেন তার সঙ্গে, যেকোনো মতামত বা সাহায্যের জন্য।
                </p>

                <h3 className="text-md font-semibold text-foreground pt-3">🔐 গোপনীয়তা</h3>
                <p>
                  দয়াল হোমিও সদন অ্যাপ আপনার ব্যক্তিগত তথ্য যেমন নাম, ইমেইল বা ফোন নম্বর সংগ্রহ করে না। এই অ্যাপের সকল ডেটা (যেমন আপনার ওষুধের তালিকা) আপনার ডিভাইসে অ্যাপ্লিকেশনের নিজস্ব CSV ফাইলে নিরাপদে সংরক্ষিত থাকে এবং সম্পূর্ণরূপে আপনার নিয়ন্ত্রণে থাকে। আপনি যদি ভবিষ্যতে Firebase-এর মতো ক্লাউড পরিষেবা ব্যবহার করেন, তাহলে সেই ডেটাও আপনার ব্যক্তিগত অ্যাকাউন্টের অধীনে সুরক্ষিত থাকবে, যা আপনি নিয়ন্ত্রণ করবেন।
                </p>

                <h3 className="text-md font-semibold text-foreground pt-3">📩 মতামত ও সহায়তা</h3>
                <p>অ্যাপ ব্যবহারে যদি কোনো সমস্যা হয় বা নতুন কোনো ফিচারের প্রস্তাব দিতে চান, তাহলে যোগাযোগ করুন:</p>
                <ul className="space-y-2">
                  <li>
                    <a href="https://www.facebook.com/share/1ASLPZfn9V/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                      <Facebook className="h-4 w-4" /> Sozib Sorkar
                    </a>
                  </li>
                  <li>
                    <a href="mailto:sozibsarker57@gmail.com" className="flex items-center gap-2 underline text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                      <Mail className="h-4 w-4" /> sozibsarker57@gmail.com
                    </a>
                  </li>
                  <li>
                    <a href="https://wa.me/8801303347173" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                      <Smartphone className="h-4 w-4" /> +8801303347173 (WhatsApp)
                    </a>
                  </li>
                </ul>

                <p className="pt-4">
                  এই অ্যাপের উদ্দেশ্য খুবই সরল — হোমিও চিকিৎসা ব্যবস্থাপনাকে সবার জন্য সহজ, সুন্দর এবং নির্ভরযোগ্য করে তোলা।
                </p>
                <p>আপনার প্রয়োজনে পাশে আছি। ধন্যবাদ! 🌿</p>
                 <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t mt-4">
                    <p>সংস্করণ: 1.0.0</p>
                    <p>© {new Date().getFullYear()} দয়াল হোমিও সদন। সর্বস্বত্ব সংরক্ষিত।</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2" aria-label="দয়াল হোমিও সদন Home">
            <Leaf className="h-5 w-5 text-primary-500 dark:text-primary-300" />
            <span className="whitespace-nowrap text-base font-semibold text-gray-900 dark:text-gray-100">দয়াল হোমিও সদন</span>
          </Link>
        </div>
        <div className="flex justify-end">
          <ThemeToggleButton className="h-8 w-8" />
        </div>
      </header>

      {/* Desktop Header */}
      <header className="sticky top-0 z-50 hidden h-16 w-full border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80 md:flex">
        <div className="container mx-auto flex h-full items-center px-8">
          <Link href="/" className="mr-8 flex items-center space-x-2" aria-label="দয়াল হোমিও সদন Home">
            <Leaf className="h-6 w-6 text-primary-500 dark:text-primary-300" />
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">দয়াল হোমিও সদন</span>
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
          <ThemeToggleButton className="mr-2 h-10 w-10" />
          <Button
            asChild
            variant="default" 
            className="h-11 min-h-[44px] px-4 py-2"
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
        {/* Adjusted padding for mobile header & bottom nav */}
        <div className="pb-14 pt-0 md:pb-0 md:pt-0"> 
             {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900 md:hidden">
        <Link href="/" passHref legacyBehavior>
          <a className={cn(
            "flex w-1/3 flex-col items-center justify-center py-1 text-xs", 
            pathname === '/' ? "text-teal-500 dark:text-teal-300" : "text-gray-700 hover:text-teal-500 dark:text-gray-300 dark:hover:text-teal-300"
          )}>
            <Search className="h-6 w-6" />
            <span>Search</span>
          </a>
        </Link>
        
        <div className="relative w-14 flex-shrink-0"> 
          <Link href="/inventory/add" passHref legacyBehavior>
            <a 
              aria-label="Add Medicine"
              className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 transform items-center justify-center rounded-full bg-teal-500 text-white shadow-lg transition-transform duration-150 hover:bg-teal-600 active:scale-95 dark:bg-teal-400 dark:text-gray-900 dark:hover:bg-teal-500"
            >
              <PlusCircle className="h-7 w-7" />
            </a>
          </Link>
        </div>

        <Link href="/inventory" passHref legacyBehavior>
          <a className={cn(
            "flex w-1/3 flex-col items-center justify-center py-1 text-xs", 
            (pathname === '/inventory' || pathname.startsWith('/inventory/')) ? "text-teal-500 dark:text-teal-300" : "text-gray-700 hover:text-teal-500 dark:text-gray-300 dark:hover:text-teal-300"
          )}>
            <Package className="h-6 w-6" />
            <span>Inventory</span>
          </a>
        </Link>
      </nav>

      {/* Footer - Now visible on desktop screens only */}
      <footer className="hidden border-t border-gray-200 bg-white py-4 dark:border-gray-700 dark:bg-gray-900 md:block">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} দয়াল হোমিও সদন. Advanced Homeopathic Inventory.
          </p>
           <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Created by <a href="https://www.facebook.com/share/1ASLPZfn9V/" target="_blank" rel="noopener noreferrer" className="underline text-primary-500 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-400">Sozib Sorkar</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
