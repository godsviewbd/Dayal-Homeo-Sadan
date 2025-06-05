
'use client';

import type { Medicine } from '@/types';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { MedicineTable } from './MedicineTable';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface InventoryClientViewProps {
  initialMedicines: Medicine[];
}

export function InventoryClientView({ initialMedicines }: InventoryClientViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialMedicines;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return initialMedicines.filter(medicine =>
      medicine.name.toLowerCase().includes(lowerCaseQuery) ||
      medicine.potency.toLowerCase().includes(lowerCaseQuery) ||
      medicine.location.toLowerCase().includes(lowerCaseQuery)
    );
  }, [initialMedicines, searchQuery]);

  return (
    <Card className="shadow-xl overflow-hidden">
      <CardHeader className="p-4 md:p-6 border-b bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle className="font-headline text-2xl text-foreground">Medicine Inventory</CardTitle>
                <CardDescription className="text-muted-foreground mt-1 text-sm">
                  View, manage, and filter your homeopathic medicines.
                  <span className="hidden sm:inline"> Total items: {initialMedicines.length}</span>
                </CardDescription>
            </div>
            <div className="relative w-full sm:w-auto sm:min-w-[280px] mt-2 sm:mt-0">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                    type="text"
                    placeholder="Search by name, potency, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 text-base w-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    aria-label="Search inventory"
                />
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-0"> {/* Table will have its own padding if needed */}
        <MedicineTable medicines={filteredMedicines} />
      </CardContent>
    </Card>
  );
}
