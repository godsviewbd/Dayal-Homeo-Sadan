
import type { Medicine } from "@/types";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Table will be used for desktop
import { QuantityBadge } from "@/components/shared/QuantityBadge";
import { Edit3, MapPin, Info, Trash2, PackageOpen } from "lucide-react";
import { DeleteMedicineButton } from "./DeleteMedicineButton"; // This button will be styled
import { cn } from "@/lib/utils";

interface MedicineTableProps {
  medicines: Medicine[];
  isMobile: boolean; // To switch between table and card view
}

// Mobile Card View for a single medicine item
const MobileMedicineCard = ({ medicine }: { medicine: Medicine }) => (
  <div className="mb-4 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800/70">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{medicine.name}</h3>
        <div className="mt-1 flex items-center space-x-2">
          <span className="inline-block rounded-full border border-primary-500 bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-500 dark:border-primary-300 dark:bg-primary-900/20 dark:text-primary-300">
            {medicine.potency}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-500">· {medicine.preparation}</span>
        </div>
      </div>
      <div className="ml-2 shrink-0">
        <QuantityBadge quantity={medicine.quantity} />
      </div>
    </div>
    <div className="mt-3 flex items-center text-sm text-gray-700 dark:text-gray-300">
      <MapPin className="mr-1 h-4 w-4" /> Box: {medicine.location}
      {medicine.supplier && (
        <span className="ml-4 flex items-center">
          <Info className="mr-1 h-4 w-4" /> {medicine.supplier}
        </span>
      )}
    </div>
    <div className="mt-4 flex justify-end space-x-2">
      <Link href={`/inventory/${medicine.id}/edit`} passHref legacyBehavior>
        <a 
          aria-label={`Edit ${medicine.name}`} 
          className="btn-outline h-9 rounded-lg border-primary-500 px-3 py-1 text-sm !text-primary-500 hover:bg-primary-50 dark:border-primary-300 dark:!text-primary-300 dark:hover:bg-primary-900/20"
        >
          Edit
        </a>
      </Link>
      {/* The DeleteMedicineButton component itself handles the AlertDialog */}
      {/* We need to pass props to style the trigger button here */}
      <DeleteMedicineButton 
        medicineId={medicine.id} 
        medicineName={medicine.name}
        // Custom class for the trigger button in mobile card:
        // Note: DeleteMedicineButton needs to accept and pass `className` to its `AlertDialogTrigger`'s child Button
        // For now, assuming DeleteMedicineButton is updated or this button will need custom styling wrapper.
        // This is an example of where direct component styling might be needed if not easily passable.
      />
    </div>
  </div>
);


export function MedicineTable({ medicines, isMobile }: MedicineTableProps) {
  // This empty state is handled by InventoryClientView now
  // if (medicines.length === 0) {
  //   return (
  //     <div className="py-12 text-center px-4 md:px-6">
  //       <PackageOpen className="mx-auto h-12 w-12 text-primary/70 mb-4" />
  //       <h3 className="text-xl font-medium text-foreground mb-1">No Medicines Found</h3>
  //       <p className="text-muted-foreground text-sm">
  //         Your search returned no results, or your inventory is currently empty.
  //       </p>
  //     </div>
  //   );
  // }

  if (isMobile) {
    return (
      <div>
        {medicines.map((med) => (
          <MobileMedicineCard key={med.id} medicine={med} />
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader className="bg-gray-100 dark:bg-gray-700">
          <TableRow>
            <TableHead className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">Name</TableHead>
            <TableHead className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">Potency</TableHead>
            <TableHead className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">Preparation</TableHead>
            <TableHead className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-200">Quantity</TableHead>
            <TableHead className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">Location</TableHead>
            <TableHead className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-200">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicines.map((med) => (
            <TableRow key={med.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
              <TableCell className="px-4 py-4 text-base font-medium text-gray-900 dark:text-gray-100">{med.name}</TableCell>
              <TableCell className="px-4 py-4">
                <span className="inline-block rounded-full border border-primary-500 bg-primary-50 px-2 py-1 text-xs font-medium text-primary-500 dark:border-primary-300 dark:bg-primary-900/20 dark:text-primary-300">
                  {med.potency}
                </span>
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-700 dark:text-gray-300">{med.preparation}</TableCell>
              <TableCell className="px-4 py-4 text-right">
                <QuantityBadge quantity={med.quantity} />
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <MapPin className="mr-1.5 h-4 w-4 text-primary-500 dark:text-primary-400" />
                   {med.location}
                </div>
              </TableCell>
              <TableCell className="px-4 py-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Link href={`/inventory/${med.id}/edit`} passHref legacyBehavior>
                     <a 
                        aria-label={`Edit ${med.name}`} 
                        title={`Edit ${med.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-primary-500 p-2 text-primary-500 hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 dark:border-primary-300 dark:text-primary-300 dark:hover:bg-gray-700"
                      >
                       <Edit3 className="h-5 w-5" />
                     </a>
                  </Link>
                  <DeleteMedicineButton medicineId={med.id} medicineName={med.name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

