
"use client";

import type { Medicine } from "@/types";
import { POTENCIES, PREPARATIONS, medicineSchema } from "@/types";
import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MedicineFormState } from "@/lib/actions";
import { Button } from "@/components/ui/button"; // Will use new styles
import { Input } from "@/components/ui/input";   // Will use new styles
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Will use new styles
// Card components are used but styling comes from globals/tailwind
import { useToast } from "@/hooks/use-toast";
import { SaveIcon, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
    reset, // Keep reset if needed for complex scenarios, not explicitly in spec for this redesign
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema), // medicineSchema should be simplified based on prior request
    defaultValues: {
      name: initialData?.name || "",
      potency: initialData?.potency || "",
      preparation: initialData?.preparation || "Liquid",
      location: initialData?.location || "",
      quantity: initialData?.quantity || 0, // Ensure 0 is a valid default if min is 0 or 1
      supplier: initialData?.supplier || "",
    },
  });
  
  useEffect(() => {
    if (state?.success) {
      toast({
        title: formType === "add" ? "Medicine Added" : "Medicine Updated",
        description: state.message,
        variant: "default", // TODO: use success variant for toasts if added
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

  const renderErrorMessage = (fieldName: keyof MedicineFormData | 'server') => {
    const clientError = errors[fieldName as keyof MedicineFormData]?.message;
    const serverError = state?.errors?.[fieldName as keyof typeof state.errors]?.[0];
    
    if (clientError || serverError) {
      return (
        <p className="mt-1 text-sm text-red-600 dark:text-red-300" role="alert">
          {clientError || serverError}
        </p>
      );
    }
    return null;
  };


  return (
    <div className="px-4 pt-6 pb-24 md:px-8">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {formType === "add" ? "Add New Medicine" : "Edit Medicine"}
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            {formType === "add"
              ? "Fill in the details to add a new medicine."
              : `Editing: ${initialData?.name || "Medicine"}`}
          </p>
        </div>

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
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
            
            <div className="md:col-span-2"> {/* Medicine Name spans full width if alone, or adjust grid */}
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medicine Name</Label>
              <Input 
                id="name" 
                {...register("name")} 
                placeholder="e.g., Arnica Montana 30C" 
                className={cn("input-base mt-1", errors.name || state?.errors?.name ? "input-error" : "")}
                aria-describedby="name-error"
              />
              {renderErrorMessage('name')}
            </div>

            <div>
              <Label htmlFor="potency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Potency</Label>
              <div className="relative mt-1">
                <Controller
                  name="potency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger 
                        id="potency" 
                        className={cn("select-base", errors.potency || state?.errors?.potency ? "input-error" : "")}
                        aria-label="Select potency"
                        aria-describedby="potency-error"
                      >
                        <SelectValue placeholder="Select potency (e.g., 30C, 200)" />
                      </SelectTrigger>
                      <SelectContent>
                        {POTENCIES.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {renderErrorMessage('potency')}
            </div>
            
            <div>
              <Label htmlFor="preparation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preparation</Label>
               <div className="relative mt-1">
                <Controller
                  name="preparation"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value || "Liquid"}>
                      <SelectTrigger 
                        id="preparation" 
                        className={cn("select-base", errors.preparation || state?.errors?.preparation ? "input-error" : "")}
                        aria-label="Select preparation"
                        aria-describedby="preparation-error"
                      >
                        <SelectValue placeholder="Select form (e.g., Pellets, Liquid)" />
                      </SelectTrigger>
                      <SelectContent>
                        {PREPARATIONS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {renderErrorMessage('preparation')}
            </div>

            <div>
              <Label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                inputMode="numeric"
                min="0" // Allow 0 for out of stock
                {...register("quantity", { valueAsNumber: true })} 
                placeholder="Enter amount (0-10000)" 
                className={cn("input-base mt-1", errors.quantity || state?.errors?.quantity ? "input-error" : "")}
                aria-describedby="quantity-error"
              />
              {renderErrorMessage('quantity')}
            </div>
            
            <div>
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (Box Number)</Label>
              <Input 
                id="location" 
                {...register("location")} 
                placeholder="e.g., Box 15, Shelf A" 
                className={cn("input-base mt-1", errors.location || state?.errors?.location ? "input-error" : "")}
                aria-describedby="location-error"
              />
              {renderErrorMessage('location')}
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier (Optional)</Label>
              <Input 
                id="supplier" 
                {...register("supplier")} 
                placeholder="e.g., Boiron, SBL" 
                className="input-base mt-1" // No error class needed for optional field unless specifically validated
              />
              {/* No error message for supplier as it's optional and not strictly validated in schema for existence */}
            </div>
          </div>
          
          {state?.errors?.server && (
            <div className="mt-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20" role="alert">
              <p className="text-sm text-red-600 dark:text-red-300">{state.errors.server}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button 
              type="submit" 
              disabled={isActionPending} 
              className="btn-primary h-12 min-w-[150px] !rounded-full px-6 text-base"
            >
              {isActionPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <SaveIcon className="mr-2 h-5 w-5" />}
              {formType === "add" ? "Add Medicine" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
