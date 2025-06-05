
import type { Medicine } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuantityBadge } from "@/components/shared/QuantityBadge";
import { Package, MapPin, CalendarDays, Tag, Layers, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MedicineCardProps {
  medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl">{medicine.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Layers className="h-4 w-4 mr-1.5 text-muted-foreground" />
              {medicine.potency} - {medicine.preparation}
            </CardDescription>
          </div>
          <QuantityBadge quantity={medicine.quantity} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>Location: {medicine.location}</span>
        </div>
        {/* Batch Number and Expiration Date removed as per request */}
        {medicine.supplier && (
          <div className="flex items-center">
            <Info className="h-4 w-4 mr-2 text-primary" />
            <span>Supplier: {medicine.supplier}</span>
          </div>
        )}
        {medicine.alternateNames && medicine.alternateNames.length > 0 && (
          <div className="flex items-start">
            <Tag className="h-4 w-4 mr-2 mt-0.5 text-primary shrink-0" />
            <div>
              <span>Alt Names: </span>
              {medicine.alternateNames.map((altName, index) => (
                <Badge key={index} variant="secondary" className="mr-1 mb-1">{altName}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/inventory/${medicine.id}/edit`}>View/Edit Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
