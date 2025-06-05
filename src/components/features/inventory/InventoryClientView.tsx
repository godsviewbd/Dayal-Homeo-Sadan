
'use client';

import type { Medicine } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MedicineTable } from './MedicineTable'; // This will handle desktop table / mobile cards
import { Search, PackageOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile'; // Assuming this hook exists or will be created

interface InventoryClientViewProps {
  initialMedicines: Medicine[];
}

export function InventoryClientView({ initialMedicines }: InventoryClientViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile(); // Hook to detect mobile screen size

  useEffect(() => {
    setIsClient(true); // Avoid hydration mismatch for isMobile
  }, []);
  
  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialMedicines;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return initialMedicines.filter(medicine =>
      medicine.name.toLowerCase().includes(lowerCaseQuery) ||
      (medicine.potency && medicine.potency.toLowerCase().includes(lowerCaseQuery)) ||
      (medicine.location && medicine.location.toLowerCase().includes(lowerCaseQuery))
    );
  }, [initialMedicines, searchQuery]);

  const isInventoryEmpty = initialMedicines.length === 0;
  const noResultsFromSearch = !isInventoryEmpty && filteredMedicines.length === 0;

  if (!isClient) {
    // Render a basic skeleton or null during SSR to avoid hydration issues with isMobile
    return (
      <div className="px-4 pt-6 pb-24 md:px-8">
        <div className="mx-auto w-full rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 md:p-8">
          <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-2 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-6 h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 md:w-1/3"></div>
          <div className="mt-8 h-64 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 md:px-8"> {/* Container padding */}
      <div className="mx-auto w-full rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 md:p-8"> {/* Main card */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Medicine Inventory</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              View and manage your homeopathic medicines.
            </p>
          </div>
          <div className="relative w-full md:w-1/3">
            <label htmlFor="inventory-search" className="sr-only">Filter inventory by name</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="inventory-search"
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-10"
              aria-label="Search inventory"
            />
          </div>
        </div>

        {filteredMedicines.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-6 text-center dark:bg-gray-800/50 ">
            <PackageOpen className="mx-auto h-12 w-12 text-primary-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              {isInventoryEmpty ? "Your Inventory is Empty" : "No Medicines Found"}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isInventoryEmpty 
                ? "Tap the '+' button to add your first medicine." 
                : "No medicines match your search. Try a different name or check spelling."}
            </p>
          </div>
        ) : (
          <MedicineTable medicines={filteredMedicines} isMobile={isMobile} />
        )}
      </div>
    </div>
  );
}
