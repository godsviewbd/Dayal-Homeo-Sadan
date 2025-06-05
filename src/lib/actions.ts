
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
    server?: string;
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
    revalidatePath('/inventory');
    revalidatePath('/');
     return { message: "Medicine added successfully!", success: true };
  } catch (e) {
    return { message: "Failed to add medicine.", success: false, errors: { server: (e as Error).message } };
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
       return { message: "Medicine not found or failed to update.", success: false };
    }
    revalidatePath('/inventory');
    revalidatePath(`/inventory/${id}/edit`);
    revalidatePath('/');
    return { message: "Medicine updated successfully!", success: true };
  } catch (e) {
    return { message: "Failed to update medicine.", success: false, errors: { server: (e as Error).message } };
  }
}

export async function deleteMedicineAction(id: string) {
  try {
    await dbDeleteMedicine(id);
    revalidatePath('/inventory');
    revalidatePath('/');
  } catch (e) {
    console.error("Failed to delete medicine:", e);
    // Optionally, return an error state to be handled by the UI
    // throw new Error("Failed to delete medicine.");
  }
}

export async function handleParseHomeopathicQuery(input: ParseHomeopathicQueryInput): Promise<ParseHomeopathicQueryOutput | { error: string }> {
  try {
    const result = await aiParseQuery(input);
    return result;
  } catch (error) {
    console.error("Error parsing query with AI:", error);
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
