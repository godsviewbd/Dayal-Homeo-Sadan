
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface MedicineTableProps {
  medicines: Medicine[];
}

export function MedicineTable({ medicines }: MedicineTableProps) {
  if (medicines.length === 0) {
    return (
      <Card className="mt-4 shadow">
        <CardHeader>
           <CardTitle className="font-headline flex items-center"><PackageOpen className="mr-2 h-6 w-6 text-primary" />No Medicines Found</CardTitle>
           <CardDescription>No medicines match your current filter or the inventory is empty.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Try adjusting your search terms. If your inventory is empty, use the "Add New Medicine" button in the header.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Potency</TableHead>
            <TableHead className="hidden md:table-cell">Preparation</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="hidden md:table-cell">Location (Box No.)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicines.map((med) => (
            <TableRow key={med.id}>
              <TableCell className="font-medium">{med.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{med.potency}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{med.preparation}</TableCell>
              <TableCell className="text-right">
                <QuantityBadge quantity={med.quantity} />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center">
                  <MapPinIcon className="mr-1.5 h-4 w-4 text-muted-foreground" />
                   {med.location}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="icon" asChild title={`Edit ${med.name}`}>
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
