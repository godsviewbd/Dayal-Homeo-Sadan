// Simulates a database for homeopathic medicines
// This file has been modified to remove placeholder data.
// You can populate the 'medicines' array below with data from your CSV
// or implement logic to read and parse your "medicine_name.csv" file.
// For a real application, replace this with a proper database integration.

import type { Medicine } from '@/types';

// Initialize with an empty array.
// You will need to populate this array with data from your CSV.
// Example:
// const medicinesFromCSV = [
//   { id: '1', name: 'YourMed1', potency: '30C', preparation: 'Pellets', batchNumber: 'B001', expirationDate: '2025-12-31', location: 'Shelf A1', quantity: 100, supplier: 'Boiron', alternateNames: ['ExampleAltName'] },
//   // ... more medicines from your CSV
// ];
// medicines = medicinesFromCSV;
let medicines: Medicine[] = [];

// Note: The global._medicines logic for development persistence has been removed
// as the data source is now intended to be managed by the user (e.g., via CSV).
// If you need persistence for the in-memory array during development after populating it,
// you might consider re-adding a similar mechanism or ensuring your data loading
// logic runs on each relevant server request/initialization.

export async function getMedicines(): Promise<Medicine[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(medicines));
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const medicine = medicines.find(m => m.id === id);
  return medicine ? JSON.parse(JSON.stringify(medicine)) : undefined;
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newMedicine: Medicine = { ...medicineData, id: String(Date.now() + Math.random()) }; // More robust ID for demo
  medicines.push(newMedicine);
  // If you are managing persistence (e.g. writing back to a file or DB), do it here.
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const index = medicines.findIndex(m => m.id === id);
  if (index === -1) return null;
  medicines[index] = { ...medicines[index], ...updates };
  // If you are managing persistence, do it here.
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id);
  // If you are managing persistence, do it here.
  return medicines.length < initialLength;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  let results = [...medicines]; // Operate on a copy
  
  if (nameQuery) {
    const lowerNameQuery = nameQuery.toLowerCase();
    results = results.filter(m =>
      m.name.toLowerCase().includes(lowerNameQuery) ||
      (m.alternateNames && m.alternateNames.some(an => an.toLowerCase().includes(lowerNameQuery)))
    );
  }

  if (potencyQuery && potencyQuery !== 'Any') {
    const lowerPotencyQuery = potencyQuery.toLowerCase();
    results = results.filter(m => m.potency.toLowerCase() === lowerPotencyQuery);
  }
  
  return JSON.parse(JSON.stringify(results));
}
