import { MedicineTable } from "@/components/features/inventory/MedicineTable";
import { getMedicines } from "@/lib/data"; // Using server-side data fetching
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function InventoryPage() {
  const medicines = await getMedicines();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* This title is now part of the MedicineTable card, can be removed if redundant */}
        {/* <h1 className="text-3xl font-bold font-headline">Medicine Inventory</h1> */}
        {/* The "Add Medicine" button is now in the AppShell header */}
        {/* 
        <Button asChild>
          <Link href="/inventory/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Medicine
          </Link>
        </Button>
        */}
      </div>
      <MedicineTable medicines={medicines} />
    </div>
  );
}
