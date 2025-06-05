
'use server';

import { revalidatePath } from 'next/cache';
// redirect removed as it's not used directly in these actions after form state handling
// import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  addMedicine as dbAddMedicine,
  updateMedicine as dbUpdateMedicine,
  deleteMedicine as dbDeleteMedicine,
  searchMedicinesByNameAndPotency as dbSearchMedicines,
  getMedicineById as dbGetMedicineById,
  getUniqueMedicineNames as dbGetUniqueMedicineNames,
  getIndicationsByMedicineName as dbGetIndications, // New import
} from '@/lib/data';
import type { Medicine } from '@/types';
import { medicineSchema } from '@/types'; // medicineSchema is now simplified
import { parseHomeopathicQuery as aiParseQuery } from '@/ai/flows/parse-homeopathic-query';
import type { ParseHomeopathicQueryInput, ParseHomeopathicQueryOutput } from '@/ai/flows/parse-homeopathic-query';


export type MedicineFormState = {
  message: string;
  // Adjusted errors to reflect removed fields from medicineSchema
  errors?: {
    name?: string[];
    potency?: string[];
    preparation?: string[];
    location?: string[];
    quantity?: string[];
    supplier?: string[];
    server?: string; // For general server-side errors not tied to a field
  };
  success: boolean;
} | null;


export async function addMedicineAction(
  prevState: MedicineFormState,
  formData: FormData
): Promise<MedicineFormState> {
  const rawFormData = Object.fromEntries(formData.entries());
  // medicineSchema is now simplified (no batchNumber, expirationDate, alternateNames)
  const validatedFields = await medicineSchema.safeParseAsync(rawFormData);

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors as any,
      success: false,
    };
  }

  try {
    // Construct medicineToAdd based on the new simplified Medicine type
    const medicineToAdd: Omit<Medicine, 'id'> = {
      name: validatedFields.data.name,
      potency: validatedFields.data.potency,
      preparation: validatedFields.data.preparation,
      location: validatedFields.data.location, // This is Box Number
      quantity: validatedFields.data.quantity,
      supplier: validatedFields.data.supplier,
    };
    await dbAddMedicine(medicineToAdd);
    console.log(`ACTIONS: addMedicineAction successful for '${medicineToAdd.name}'. Revalidating paths...`);
    revalidatePath('/inventory');
    revalidatePath('/'); // Revalidate homepage/search as well
     return { message: `Medicine "${medicineToAdd.name}" added successfully!`, success: true };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
    console.error("ACTIONS: Failed to add medicine:", errorMessage);
    return { message: `Failed to add medicine. ${errorMessage}`, success: false, errors: { server: errorMessage } };
  }
}

export async function updateMedicineAction(
  id: string,
  prevState: MedicineFormState,
  formData: FormData
): Promise<MedicineFormState> {
  const rawFormData = Object.fromEntries(formData.entries());
  // medicineSchema is now simplified
  const validatedFields = await medicineSchema.safeParseAsync(rawFormData);

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors as any,
      success: false,
    };
  }

  try {
    // Construct medicineToUpdate based on the new simplified Medicine type
    const medicineToUpdate: Partial<Omit<Medicine, 'id'>> = {
      name: validatedFields.data.name,
      potency: validatedFields.data.potency,
      preparation: validatedFields.data.preparation,
      location: validatedFields.data.location, // This is Box Number
      quantity: validatedFields.data.quantity,
      supplier: validatedFields.data.supplier,
    };
    const updated = await dbUpdateMedicine(id, medicineToUpdate);
    if (!updated) {
       return { message: `Medicine with ID ${id} not found or failed to update.`, success: false, errors: {server: "Update failed: medicine not found or no changes made."} };
    }
    console.log(`ACTIONS: updateMedicineAction successful for ID ${id} ('${updated.name}'). Revalidating paths...`);
    revalidatePath('/inventory');
    revalidatePath(`/inventory/${id}/edit`);
    revalidatePath('/'); // Revalidate homepage/search as well
    return { message: `Medicine "${updated.name}" updated successfully!`, success: true };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
    console.error(`ACTIONS: Failed to update medicine ID ${id}:`, errorMessage);
    return { message: `Failed to update medicine. ${errorMessage}`, success: false, errors: { server: errorMessage } };
  }
}

export async function deleteMedicineAction(id: string) {
  try {
    await dbDeleteMedicine(id);
    console.log(`ACTIONS: deleteMedicineAction successful for ID ${id}. Revalidating paths...`);
    revalidatePath('/inventory');
    revalidatePath('/'); // Revalidate homepage/search as well
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
    console.error(`ACTIONS: Failed to delete medicine ID ${id}:`, errorMessage);
    // In a real app, you might want to return a state or throw to be caught by the client
    // For now, this action doesn't return a state for toast notifications directly.
    // The DeleteMedicineButton handles its own optimistic updates and toasts.
    throw new Error(`Failed to delete medicine: ${errorMessage}`);
  }
}

export async function handleParseHomeopathicQuery(input: ParseHomeopathicQueryInput): Promise<ParseHomeopathicQueryOutput | { error: string }> {
  try {
    const result = await aiParseQuery(input);
    return result;
  } catch (error) {
    console.error("ACTIONS: Error parsing query with AI:", error);
    return { error: "Failed to parse query. Please try a simpler query or check the AI service." };
  }
}

export async function fetchMedicinesForSearch(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  return dbSearchMedicines(nameQuery, potencyQuery);
}

export async function fetchMedicineById(id: string): Promise<Medicine | undefined> {
  return dbGetMedicineById(id);
}

export async function handleGetUniqueMedicineNames(): Promise<string[]> {
  return dbGetUniqueMedicineNames();
}

// New action to fetch indications from CSV
export async function fetchMedicineIndicationsFromCSVAction(medicineName: string): Promise<string | undefined> {
  try {
    const indications = await dbGetIndications(medicineName);
    return indications;
  } catch (error) {
    console.error(`ACTIONS: Error fetching indications for "${medicineName}" from CSV:`, error);
    // Depending on desired behavior, could return undefined or throw an error
    return undefined; 
  }
}
