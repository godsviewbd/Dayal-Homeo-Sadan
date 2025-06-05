
"use client";

import type { Medicine } from "@/types";
import { POTENCIES, PREPARATIONS, medicineSchema } from "@/types";
import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MedicineFormState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SaveIcon, Loader2 } from "lucide-react";

interface MedicineFormProps {
  action: (
    prevState: MedicineFormState,
    formData: FormData
  ) => Promise<MedicineFormState>;
  initialData?: Medicine | null;
  formType: "add" | "edit";
}

type MedicineFormData = Omit<Medicine, 'id'>;


export function MedicineForm({ action, initialData, formType }: MedicineFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [state, formAction, isActionPending] = useActionState(action, null);
  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: initialData?.name || "",
      potency: initialData?.potency || "",
      preparation: initialData?.preparation || "Liquid",
      location: initialData?.location || "",
      quantity: initialData?.quantity || 0,
      supplier: initialData?.supplier || "",
    },
  });
  
  useEffect(() => {
    if (state?.success) {
      toast({
        title: formType === "add" ? "Medicine Added" : "Medicine Updated",
        description: state.message,
        variant: "default", // Explicitly default, can be success if you add a success variant
      });
      router.push("/inventory");
    } else if (state?.message && !state.success) {
      toast({
        title: "Error Processing Request",
        description: state.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [state, router, toast, formType]);


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl overflow-hidden">
      <CardHeader className="p-4 md:p-6 border-b bg-card">
        <CardTitle className="font-headline text-2xl text-foreground">
          {formType === "add" ? "Add New Medicine" : "Edit Medicine"}
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-1 text-sm">
          {formType === "add"
            ? "Fill in the details to add a new medicine to the inventory."
            : `Editing: ${initialData?.name || "Medicine"}`}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit((data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        startTransition(() => {
          formAction(formData);
        });
      })}>
        <CardContent className="p-4 md:p-6 space-y-6 md:space-y-8"> {/* Increased vertical spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6"> {/* Consistent gap */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Medicine Name</Label>
              <Input id="name" {...register("name")} placeholder="e.g., Arnica Montana" className="h-11 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              {(state?.errors?.name && !errors.name) && <p className="text-xs text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="potency" className="text-sm font-medium text-foreground">Potency</Label>
               <Controller
                name="potency"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="potency" className="h-11 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
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
              {errors.potency && <p className="text-xs text-destructive mt-1">{errors.potency.message}</p>}
              {(state?.errors?.potency && !errors.potency) && <p className="text-xs text-destructive mt-1">{state.errors.potency[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="preparation" className="text-sm font-medium text-foreground">Preparation</Label>
              <Controller
                name="preparation"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="preparation" className="h-11 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
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
              {errors.preparation && <p className="text-xs text-destructive mt-1">{errors.preparation.message}</p>}
              {(state?.errors?.preparation && !errors.preparation) && <p className="text-xs text-destructive mt-1">{state.errors.preparation[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium text-foreground">Quantity</Label>
              <Input id="quantity" type="number" {...register("quantity", { valueAsNumber: true })} placeholder="e.g., 100" className="h-11 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1" />
              {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity.message}</p>}
              {(state?.errors?.quantity && !errors.quantity) && <p className="text-xs text-destructive mt-1">{state.errors.quantity[0]}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-foreground">Location (Box Number)</Label>
            <Input id="location" {...register("location")} placeholder="e.g., B28, A1, Drawer 3" className="h-11 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1" />
            {errors.location && <p className="text-xs text-destructive mt-1">{errors.location.message}</p>}
            {(state?.errors?.location && !errors.location) && <p className="text-xs text-destructive mt-1">{state.errors.location[0]}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supplier" className="text-sm font-medium text-foreground">Supplier (Optional)</Label>
            <Input id="supplier" {...register("supplier")} placeholder="e.g., Boiron, SBL" className="h-11 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1" />
            {errors.supplier && <p className="text-xs text-destructive mt-1">{errors.supplier.message}</p>}
          </div>

           {state?.errors?.server && <p className="text-sm text-destructive mt-1 bg-destructive/10 p-3 rounded-md">{state.errors.server}</p>}

        </CardContent>
        <CardFooter className="p-4 md:p-6 flex justify-end bg-muted/30 border-t">
          <Button type="submit" disabled={isActionPending} className="h-11 text-base min-w-[150px] btn-transition shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {isActionPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <SaveIcon className="mr-2 h-5 w-5" />}
            {formType === "add" ? "Add Medicine" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
