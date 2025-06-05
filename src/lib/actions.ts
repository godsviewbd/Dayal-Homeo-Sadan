
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  addMedicine as dbAddMedicine,
  updateMedicine as dbUpdateMedicine,
  deleteMedicine as dbDeleteMedicine,
  searchMedicinesByNameAndPotency as dbSearchMedicines,
  getMedicineById as dbGetMedicineById,
  getUniqueMedicineNames as dbGetUniqueMedicineNames, // Import new data function
} from '@/lib/data';
import type { Medicine } from '@/types';
import { medicineSchema } from '@/types';
import { parseHomeopathicQuery as aiParseQuery } from '@/ai/flows/parse-homeopathic-query';
import type { ParseHomeopathicQueryInput, ParseHomeopathicQueryOutput } from '@/ai/flows/parse-homeopathic-query';


export type MedicineFormState = {
  message: string;
  errors?: {
    [K in keyof Omit<Medicine, 'id' | 'alternateNames'> & { alternateNames?: string[] }]?: string[];
  } & { server?: string };
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
      batchNumber: validatedFields.data.batchNumber,
      expirationDate: validatedFields.data.expirationDate,
      location: validatedFields.data.location,
      quantity: validatedFields.data.quantity,
      supplier: validatedFields.data.supplier,
      alternateNames: validatedFields.data.alternateNames,
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
      batchNumber: validatedFields.data.batchNumber,
      expirationDate: validatedFields.data.expirationDate,
      location: validatedFields.data.location,
      quantity: validatedFields.data.quantity,
      supplier: validatedFields.data.supplier,
      alternateNames: validatedFields.data.alternateNames,
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
