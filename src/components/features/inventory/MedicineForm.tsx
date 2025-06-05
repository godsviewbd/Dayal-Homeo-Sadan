
"use client";

import type { Medicine, Potency, Preparation } from "@/types";
import { POTENCIES, PREPARATIONS, medicineSchema } from "@/types";
import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MedicineFormState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Textarea removed as Alternate Names is removed
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SaveIcon, Loader2 } from "lucide-react"; // CalendarIcon removed

interface MedicineFormProps {
  action: (
    prevState: MedicineFormState,
    formData: FormData
  ) => Promise<MedicineFormState>;
  initialData?: Medicine | null;
  formType: "add" | "edit";
}

// FormData type adjusted to match new Medicine structure (no batchNumber, expirationDate, alternateNames)
type MedicineFormData = Omit<Medicine, 'id'>;


export function MedicineForm({ action, initialData, formType }: MedicineFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [state, formAction] = useActionState(action, null);

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
      preparation: initialData?.preparation || "Liquid", // Default to Liquid
      // batchNumber: initialData?.batchNumber || "", // Removed
      // expirationDate: initialData?.expirationDate || "", // Removed
      location: initialData?.location || "", // This is Box Number
      quantity: initialData?.quantity || 0,
      supplier: initialData?.supplier || "",
      // alternateNames: initialData?.alternateNames?.join(", ") || "", // Removed
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
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register("quantity", { valueAsNumber: true })} placeholder="e.g., 100" />
              {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
              {(state?.errors?.quantity && !errors.quantity) && <p className="text-sm text-destructive mt-1">{state.errors.quantity[0]}</p>}
            </div>
          </div>
          
          {/* Batch Number field removed */}
          {/* Expiration Date field removed */}

          <div>
            <Label htmlFor="location">Location (Box Number)</Label>
            <Input id="location" {...register("location")} placeholder="e.g., 28, A1, Drawer 3" />
            {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            {(state?.errors?.location && !errors.location) && <p className="text-sm text-destructive mt-1">{state.errors.location[0]}</p>}
          </div>
          
          <div>
            <Label htmlFor="supplier">Supplier (Optional)</Label>
            <Input id="supplier" {...register("supplier")} placeholder="e.g., Boiron, SBL" />
            {errors.supplier && <p className="text-sm text-destructive mt-1">{errors.supplier.message}</p>}
          </div>

          {/* Alternate Names field removed */}
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
