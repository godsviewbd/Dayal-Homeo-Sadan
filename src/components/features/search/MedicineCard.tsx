
import type { Medicine } from "@/types";
import { QuantityBadge } from "@/components/shared/QuantityBadge";
import { Layers, MapPin, Info, Pill } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MedicineCardProps {
  medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <div className="card-base flex h-full flex-col justify-between overflow-hidden p-6 transition-all duration-200 ease-out hover:scale-[1.01] hover:shadow-xl dark:bg-gray-800">
      {/* Top section: Name, Badge, and Details */}
      <div>
        {/* Container for Name and Badge - Using Flexbox */}
        <div className="mb-3 flex items-start justify-between gap-x-3">
          {/* Medicine Name - takes available space and wraps */}
          <h3 className="flex-grow min-w-0 text-xl font-semibold text-gray-900 dark:text-gray-100 break-words">
            {medicine.name}
          </h3>
          {/* Quantity Badge - does not shrink, aligned with top of name */}
          <div className="flex-shrink-0 mt-1">
            <QuantityBadge quantity={medicine.quantity} />
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Layers className="mr-2 h-4 w-4 flex-shrink-0 text-primary-500 dark:text-primary-300" />
            <span className="mr-1.5 min-w-[60px] font-medium text-gray-600 dark:text-gray-400">Potency:</span>
            <span className="truncate font-semibold text-gray-800 dark:text-gray-200" title={medicine.potency}>{medicine.potency}</span>
          </div>

          <div className="flex items-center">
            <Pill className="mr-2 h-4 w-4 flex-shrink-0 text-primary-500 dark:text-primary-300" />
            <span className="mr-1.5 min-w-[60px] font-medium text-gray-600 dark:text-gray-400">Form:</span>
            <span className="truncate font-semibold text-gray-800 dark:text-gray-200" title={medicine.preparation}>{medicine.preparation}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-primary-500 dark:text-primary-300" />
            <span className="mr-1.5 min-w-[60px] font-medium text-gray-600 dark:text-gray-400">Box:</span>
            <span className="truncate font-semibold text-gray-800 dark:text-gray-200" title={medicine.location || "N/A"}>{medicine.location || "N/A"}</span>
          </div>

          {medicine.supplier && (
            <div className="flex items-center">
              <Info className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
              <span className="mr-1.5 min-w-[60px] font-medium text-gray-600 dark:text-gray-400">Supplier:</span>
              <span className="truncate font-semibold text-gray-800 dark:text-gray-200" title={medicine.supplier}>{medicine.supplier}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom section for the button, pushed to the end */}
      <div className="mt-auto pt-4"> {/* mt-auto pushes this to bottom, pt-4 for spacing */}
        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          className="btn-outline h-10 w-full !rounded-full border-primary-500 text-primary-500 hover:bg-primary-50 dark:border-primary-300 dark:text-primary-300 dark:hover:bg-primary-900/20"
        >
          <Link href={`/inventory/${medicine.id}/edit`}>View / Edit</Link>
        </Button>
      </div>
    </div>
  );
}
