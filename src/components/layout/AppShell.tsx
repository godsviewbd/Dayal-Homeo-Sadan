import type React from 'react';
import Link from 'next/link';
import { Home, Package, Leaf, Search, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="font-bold font-headline text-xl tracking-tight">HomeoWise</span>
          </Link>
          <nav className="flex flex-1 items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" asChild className="text-sm sm:text-base">
              <Link href="/">
                <Search className="mr-1.5 h-4 w-4" />
                Search
              </Link>
            </Button>
            <Button variant="ghost" asChild className="text-sm sm:text-base">
              <Link href="/inventory">
                <Package className="mr-1.5 h-4 w-4" />
                Inventory
              </Link>
            </Button>
          </nav>
          <Button asChild size="sm">
            <Link href="/inventory/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Medicine
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6 sm:py-8">
         {children}
        </div>
      </main>
      <footer className="py-6 border-t bg-background/95">
        <div className="container flex flex-col items-center justify-center gap-2 md:h-16 md:flex-row">
          <p className="text-center text-xs leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} HomeoWise. Your trusted homeopathic inventory partner.
          </p>
        </div>
      </footer>
    </div>
  );
}
