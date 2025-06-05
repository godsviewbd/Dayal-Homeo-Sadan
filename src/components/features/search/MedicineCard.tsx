
import type { Medicine } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuantityBadge } from "@/components/shared/QuantityBadge";
import { Layers, MapPin, Info } from "lucide-react"; // CalendarDays, Tag removed
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MedicineCardProps {
  medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-xl card-transition rounded-lg overflow-hidden">
      <CardHeader className="p-4 border-b bg-card">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-grow">
            <CardTitle className="font-headline text-lg md:text-xl font-medium text-foreground leading-tight">
              {medicine.name}
            </CardTitle>
            <CardDescription className="flex items-center mt-1 text-sm text-muted-foreground">
              <Layers className="h-4 w-4 mr-1.5 shrink-0" />
              {medicine.potency} - {medicine.preparation}
            </CardDescription>
          </div>
          <div className="shrink-0 mt-0.5">
            <QuantityBadge quantity={medicine.quantity} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-3 text-sm">
        <div className="flex items-center text-foreground/90">
          <MapPin className="h-4 w-4 mr-2 text-primary shrink-0" />
          <span>Location: {medicine.location || "N/A"}</span>
        </div>
        {medicine.supplier && (
          <div className="flex items-center text-foreground/90">
            <Info className="h-4 w-4 mr-2 text-primary shrink-0" />
            <span>Supplier: {medicine.supplier}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t bg-card">
        <Button variant="outline" size="sm" asChild className="w-full h-9 btn-transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
          <Link href={`/inventory/${medicine.id}/edit`}>View/Edit Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
