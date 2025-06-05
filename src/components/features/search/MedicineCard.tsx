
import type { Medicine } from "@/types";
import { QuantityBadge } from "@/components/shared/QuantityBadge";
import { Layers, MapPin, Info, Pill } from "lucide-react"; // Added Pill icon
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MedicineCardProps {
  medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <div className="card-base relative flex flex-col justify-between cursor-pointer overflow-hidden transition-all duration-200 ease-out hover:scale-[1.01] hover:shadow-xl dark:bg-gray-800 h-full">
      {/* Top section including name and badge */}
      <div>
        <div className="absolute right-4 top-4 z-10">
          <QuantityBadge quantity={medicine.quantity} />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 pr-36 mb-3"> {/* Changed pr-28 to pr-36 */}
          {medicine.name}
        </h3>

        {/* Details Section */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Layers className="mr-2 h-4 w-4 text-primary-500 dark:text-primary-300 flex-shrink-0" />
            <span className="font-medium text-gray-600 dark:text-gray-400 mr-1.5 min-w-[60px]">Potency:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={medicine.potency}>{medicine.potency}</span>
          </div>

          <div className="flex items-center">
            <Pill className="mr-2 h-4 w-4 text-primary-500 dark:text-primary-300 flex-shrink-0" />
            <span className="font-medium text-gray-600 dark:text-gray-400 mr-1.5 min-w-[60px]">Form:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={medicine.preparation}>{medicine.preparation}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-primary-500 dark:text-primary-300 flex-shrink-0" />
            <span className="font-medium text-gray-600 dark:text-gray-400 mr-1.5 min-w-[60px]">Box:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={medicine.location || "N/A"}>{medicine.location || "N/A"}</span>
          </div>

          {medicine.supplier && (
            <div className="flex items-center">
              <Info className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-600 dark:text-gray-400 mr-1.5 min-w-[60px]">Supplier:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={medicine.supplier}>{medicine.supplier}</span>
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
