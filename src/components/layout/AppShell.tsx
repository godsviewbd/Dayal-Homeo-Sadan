import type React from 'react';
import Link from 'next/link';
import { Leaf, Search, Package, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  // In a real scenario, you might have logic to determine active tab
  const activePath = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 shadow-sm backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="mr-6 flex items-center space-x-2" aria-label="HomeoWise Home">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-semibold tracking-tight text-foreground">HomeoWise</span>
          </Link>
          <nav className="flex flex-1 items-center space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium sm:text-base h-10 px-3 sm:px-4 hover:bg-accent/20",
                activePath === '/' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href="/">
                <Search className="mr-1.5 h-4 w-4" />
                Search
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium sm:text-base h-10 px-3 sm:px-4 hover:bg-accent/20",
                activePath.startsWith('/inventory') ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href="/inventory">
                <Package className="mr-1.5 h-4 w-4" />
                Inventory
              </Link>
            </Button>
          </nav>
          <Button asChild size="sm" className="h-10 btn-transition shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Link href="/inventory/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Medicine
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        {/* Mobile: px-4, Tablet: px-6, Desktop: px-8 / py-6, sm:py-8, lg:py-12 */}
        <div className="container py-6 px-4 sm:py-8 md:px-6 lg:py-12 lg:px-8">
         {children}
        </div>
      </main>
      <footer className="py-6 border-t border-border/60 bg-background/80">
        <div className="container flex flex-col items-center justify-center gap-2 text-center md:h-16 md:flex-row md:text-left">
          <p className="text-xs leading-loose text-muted-foreground">
            © {new Date().getFullYear()} HomeoWise. Advanced Homeopathic Inventory.
          </p>
        </div>
      </footer>
    </div>
  );
}
