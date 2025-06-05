
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
  getIndicationsByMedicineName as dbGetIndications, 
} from '@/lib/data';
import type { Medicine } from '@/types';
import { medicineSchema } from '@/types'; 
import { parseHomeopathicQuery as aiParseQuery } from '@/ai/flows/parse-homeopathic-query';
import type { ParseHomeopathicQueryInput, ParseHomeopathicQueryOutput } from '@/ai/flows/parse-homeopathic-query';


export type MedicineFormState = {
  message: string;
  errors?: {
    name?: string[];
    potency?: string[];
    preparation?: string[];
    location?: string[];
    quantity?: string[];
    supplier?: string[];
    server?: string; 
  };
  success: boolean;
} | null;


export async function addMedicineAction(
  prevState: MedicineFormState,
  formData: FormData
): Promise<MedicineFormState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = await medicineSchema.safeParseAsync(rawFormData);

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors as any,
      success: false,
    };
  }

  try {
    const medicineToAdd: Omit<Medicine, 'id'> = {
      name: validatedFields.data.name,
      potency: validatedFields.data.potency,
      preparation: validatedFields.data.preparation,
      location: validatedFields.data.location, 
      quantity: validatedFields.data.quantity,
      supplier: validatedFields.data.supplier,
    };
    await dbAddMedicine(medicineToAdd);
    console.log(`ACTIONS: addMedicineAction successful for '${medicineToAdd.name}'. Revalidating paths...`);
    revalidatePath('/inventory');
    revalidatePath('/'); 
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
  const validatedFields = await medicineSchema.safeParseAsync(rawFormData);

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors as any,
      success: false,
    };
  }

  try {
    const medicineToUpdate: Partial<Omit<Medicine, 'id'>> = {
      name: validatedFields.data.name,
      potency: validatedFields.data.potency,
      preparation: validatedFields.data.preparation,
      location: validatedFields.data.location, 
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
    revalidatePath('/'); 
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
    revalidatePath('/'); 
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
    console.error(`ACTIONS: Failed to delete medicine ID ${id}:`, errorMessage);
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

export async function fetchMedicineIndicationsFromCSVAction(medicineName: string): Promise<string | undefined> {
  console.log(`ACTIONS_INDICATIONS: fetchMedicineIndicationsFromCSVAction called for: "${medicineName}"`);
  try {
    const indications = await dbGetIndications(medicineName);
    if (indications) {
      console.log(`ACTIONS_INDICATIONS: Indications retrieved for "${medicineName}". Length: ${indications.length}`);
    } else {
      console.log(`ACTIONS_INDICATIONS: No indications retrieved for "${medicineName}" from data layer.`);
    }
    return indications;
  } catch (error) {
    console.error(`ACTIONS_INDICATIONS: Error fetching indications for "${medicineName}" from CSV:`, error);
    return undefined; 
  }
}
