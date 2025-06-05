
import type { Medicine } from "@/types";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuantityBadge } from "@/components/shared/QuantityBadge";
import { Edit3, PackageOpen, MapPinIcon } from "lucide-react";
import { DeleteMedicineButton } from "./DeleteMedicineButton";

interface MedicineTableProps {
  medicines: Medicine[];
}

export function MedicineTable({ medicines }: MedicineTableProps) {
  if (medicines.length === 0) {
    return (
      <div className="text-center py-12 px-4 md:px-6">
        <PackageOpen className="mx-auto h-12 w-12 text-primary/70 mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-1">No Medicines Found</h3>
        <p className="text-muted-foreground text-sm">
          Your search returned no results, or your inventory is currently empty.
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Try adjusting your search terms or <Link href="/inventory/add" className="text-primary hover:underline">add a new medicine</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap sm:w-auto w-2/5">Name</TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Potency</TableHead>
            <TableHead className="hidden md:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Preparation</TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">Quantity</TableHead>
            <TableHead className="hidden sm:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Location</TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicines.map((med) => (
            <TableRow key={med.id} className="hover:bg-muted/30 transition-colors duration-150">
              <TableCell className="px-4 py-3 font-medium text-foreground whitespace-nowrap sm:w-auto w-2/5">{med.name}</TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap">
                <Badge variant="outline" className="text-xs font-normal border-primary/50 text-primary bg-primary/10">{med.potency}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell px-4 py-3 text-muted-foreground whitespace-nowrap">{med.preparation}</TableCell>
              <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                <QuantityBadge quantity={med.quantity} />
              </TableCell>
              <TableCell className="hidden sm:table-cell px-4 py-3 text-muted-foreground whitespace-nowrap">
                <div className="flex items-center">
                  <MapPinIcon className="mr-1.5 h-4 w-4 text-primary/70 shrink-0" />
                   {med.location}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="icon" asChild title={`Edit ${med.name}`} className="h-9 w-9 btn-transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                    <Link href={`/inventory/${med.id}/edit`}>
                      <Edit3 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
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
