
"use client";

import type { Medicine, Potency, Preparation } from "@/types";
import { POTENCIES, PREPARATIONS, medicineSchema } from "@/types"; // Import medicineSchema from @/types
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MedicineFormState } from "@/lib/actions"; // Keep type import from actions
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, SaveIcon, Loader2 } from "lucide-react";

interface MedicineFormProps {
  action: (
    prevState: MedicineFormState,
    formData: FormData
  ) => Promise<MedicineFormState>;
  initialData?: Medicine | null;
  formType: "add" | "edit";
}

type MedicineFormData = Omit<Medicine, 'id' | 'alternateNames'> & { alternateNames?: string };


export function MedicineForm({ action, initialData, formType }: MedicineFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [state, formAction] = useFormState(action, null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: initialData?.name || "",
      potency: initialData?.potency || "",
      preparation: initialData?.preparation || "Pellets",
      batchNumber: initialData?.batchNumber || "",
      expirationDate: initialData?.expirationDate || "",
      location: initialData?.location || "",
      quantity: initialData?.quantity || 0,
      supplier: initialData?.supplier || "",
      alternateNames: initialData?.alternateNames?.join(", ") || "",
    },
  });
  
  useEffect(() => {
    if (state?.success) {
      toast({
        title: formType === "add" ? "Medicine Added" : "Medicine Updated",
        description: state.message,
      });
      router.push("/inventory");
    } else if (state?.message && !state.success) {
      toast({
        title: "Error",
        description: state.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [state, router, toast, formType]);


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          {formType === "add" ? "Add New Medicine" : "Edit Medicine"}
        </CardTitle>
        <CardDescription>
          {formType === "add"
            ? "Fill in the details to add a new medicine to the inventory."
            : `Editing medicine: ${initialData?.name || ""}`}
        </CardDescription>
      </CardHeader>
      <form action={formAction} onSubmit={handleSubmit((data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        formAction(formData);
      })}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Medicine Name</Label>
              <Input id="name" {...register("name")} placeholder="e.g., Arnica Montana" />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              {(state?.errors?.name && !errors.name) && <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
            <div>
              <Label htmlFor="potency">Potency</Label>
               <Controller
                name="potency"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="potency">
                      <SelectValue placeholder="Select potency" />
                    </SelectTrigger>
                    <SelectContent>
                      {POTENCIES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.potency && <p className="text-sm text-destructive mt-1">{errors.potency.message}</p>}
              {(state?.errors?.potency && !errors.potency) && <p className="text-sm text-destructive mt-1">{state.errors.potency[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="preparation">Preparation</Label>
              <Controller
                name="preparation"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="preparation">
                      <SelectValue placeholder="Select preparation" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREPARATIONS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.preparation && <p className="text-sm text-destructive mt-1">{errors.preparation.message}</p>}
              {(state?.errors?.preparation && !errors.preparation) && <p className="text-sm text-destructive mt-1">{state.errors.preparation[0]}</p>}
            </div>
             <div>
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input id="batchNumber" {...register("batchNumber")} placeholder="e.g., BN12345" />
              {errors.batchNumber && <p className="text-sm text-destructive mt-1">{errors.batchNumber.message}</p>}
              {(state?.errors?.batchNumber && !errors.batchNumber) && <p className="text-sm text-destructive mt-1">{state.errors.batchNumber[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <div className="relative">
                <Input id="expirationDate" type="date" {...register("expirationDate")} className="pr-10" />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              {errors.expirationDate && <p className="text-sm text-destructive mt-1">{errors.expirationDate.message}</p>}
              {(state?.errors?.expirationDate && !errors.expirationDate) && <p className="text-sm text-destructive mt-1">{state.errors.expirationDate[0]}</p>}
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register("quantity", { valueAsNumber: true })} placeholder="e.g., 100" />
              {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
              {(state?.errors?.quantity && !errors.quantity) && <p className="text-sm text-destructive mt-1">{state.errors.quantity[0]}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} placeholder="e.g., Shelf A1, Drawer 3" />
            {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            {(state?.errors?.location && !errors.location) && <p className="text-sm text-destructive mt-1">{state.errors.location[0]}</p>}
          </div>
          
          <div>
            <Label htmlFor="supplier">Supplier (Optional)</Label>
            <Input id="supplier" {...register("supplier")} placeholder="e.g., Boiron, SBL" />
            {errors.supplier && <p className="text-sm text-destructive mt-1">{errors.supplier.message}</p>}
          </div>

          <div>
            <Label htmlFor="alternateNames">Alternate Names (Optional, comma-separated)</Label>
            <Textarea id="alternateNames" {...register("alternateNames")} placeholder="e.g., Leopard's Bane, Monkshood" />
            {errors.alternateNames && <p className="text-sm text-destructive mt-1">{errors.alternateNames.message}</p>}
          </div>
           {state?.errors?.server && <p className="text-sm text-destructive mt-1">{state.errors.server}</p>}

        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SaveIcon className="mr-2 h-4 w-4" />}
            {formType === "add" ? "Add Medicine" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
