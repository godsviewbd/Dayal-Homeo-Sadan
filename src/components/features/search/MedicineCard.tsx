
import type { Medicine } from "@/types";
import { QuantityBadge } from "@/components/shared/QuantityBadge";
import { Layers, MapPin, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Will use new .btn-primary etc.
import { cn } from "@/lib/utils";

interface MedicineCardProps {
  medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <div className="card-base relative cursor-pointer overflow-hidden transition-all duration-200 ease-out hover:scale-[1.01] hover:shadow-xl dark:bg-gray-800">
      <div className="absolute right-4 top-4 z-10">
        <QuantityBadge quantity={medicine.quantity} />
      </div>
      
      <div className="p-6"> {/* Content padding now part of card-base */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 pr-20"> {/* Padding right to avoid overlap with badge */}
          {medicine.name}
        </h3>

        <div className="mt-2 flex items-center space-x-2">
          <Layers className="h-5 w-5 text-primary-500 dark:text-primary-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            {medicine.potency} – {medicine.preparation}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <MapPin className="mr-2 h-5 w-5 text-primary-500 dark:text-primary-300" />
            <span>Box: {medicine.location || "N/A"}</span>
          </div>
          {medicine.supplier && (
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <Info className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span>Supplier: {medicine.supplier}</span>
            </div>
          )}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          className="btn-outline mt-6 h-10 w-full !rounded-full border-primary-500 text-primary-500 hover:bg-primary-50 dark:border-primary-300 dark:text-primary-300 dark:hover:bg-primary-900/20"
        >
          <Link href={`/inventory/${medicine.id}/edit`}>View / Edit</Link>
        </Button>
      </div>
    </div>
  );
}
