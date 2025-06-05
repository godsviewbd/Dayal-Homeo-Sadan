
import { z } from 'zod';

export interface Medicine {
  id: string;
  name: string;
  potency: string;
  preparation: 'Pellets' | 'Globules' | 'Liquid' | 'Tablet' | 'Ointment' | 'Other';
  batchNumber: string;
  expirationDate: string; // YYYY-MM-DD
  location: string;
  quantity: number;
  supplier?: string;
  alternateNames?: string[];
}

export const POTENCIES = ['6C', '12C', '30C', '200C', '1M', '10M', 'LM1', 'LM2', 'LM3', '6X', '12X', '30X', '200X', 'Other'] as const;
export type Potency = typeof POTENCIES[number];

export const PREPARATIONS = ['Pellets', 'Globules', 'Liquid', 'Tablet', 'Ointment', 'Other'] as const;
export type Preparation = typeof PREPARATIONS[number];

export const medicineSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  potency: z.string().min(1, "Potency is required."),
  preparation: z.enum(PREPARATIONS, { errorMap: () => ({ message: "Invalid preparation type."}) }),
  batchNumber: z.string().min(1, "Batch number is required."),
  expirationDate: z.string().refine(async val => /^\d{4}-\d{2}-\d{2}$/.test(val), "Invalid date format (YYYY-MM-DD)."),
  location: z.string().min(1, "Location is required."),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative."),
  supplier: z.string().optional(),
  alternateNames: z.string().optional().transform(async (val) => {
    if (!val) return [];
    return val.split(',').map(s => s.trim()).filter(s => s);
  }),
});
