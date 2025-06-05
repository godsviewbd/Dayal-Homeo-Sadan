
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
      medicine.name.toLowerCase().includes(lowerCaseQuery)
    );
  }, [initialMedicines, searchQuery]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle className="font-headline text-2xl">Medicine Inventory</CardTitle>
                <CardDescription>Overview of all medicines. Use the search below to filter.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72 mt-2 sm:mt-0">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by medicine name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full" 
                />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <MedicineTable medicines={filteredMedicines} />
      </CardContent>
    </Card>
  );
}
