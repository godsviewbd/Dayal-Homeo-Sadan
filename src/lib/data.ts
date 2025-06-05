// Simulates a database for homeopathic medicines
// For a real application, replace this with a proper database integration (e.g., Firebase Firestore, Supabase, Prisma with PostgreSQL/MySQL)

import type { Medicine, Potency, Preparation } from '@/types';

let medicines: Medicine[] = [
  { id: '1', name: 'Arnica Montana', potency: '30C', preparation: 'Pellets', batchNumber: 'B001', expirationDate: '2025-12-31', location: 'Shelf A1', quantity: 100, supplier: 'Boiron', alternateNames: ['Leopard\'s Bane'] },
  { id: '2', name: 'Nux Vomica', potency: '200C', preparation: 'Globules', batchNumber: 'B002', expirationDate: '2026-06-30', location: 'Shelf B2', quantity: 5, supplier: 'Hahnemann Labs', alternateNames: [] },
  { id: '3', name: 'Pulsatilla Nigricans', potency: '6X', preparation: 'Liquid', batchNumber: 'B003', expirationDate: '2024-12-31', location: 'Fridge 1', quantity: 25, supplier: 'Boiron', alternateNames: ['Wind Flower'] },
  { id: '4', name: 'Belladonna', potency: '30C', preparation: 'Tablets', batchNumber: 'B004', expirationDate: '2025-08-15', location: 'Shelf A2', quantity: 60, supplier: 'Schwabe', alternateNames: ['Deadly Nightshade'] },
  { id: '5', name: 'Lycopodium Clavatum', potency: '1M', preparation: 'Pellets', batchNumber: 'B005', expirationDate: '2027-01-20', location: 'Shelf C1', quantity: 12, supplier: 'SBL', alternateNames: ['Clubmoss'] },
  { id: '6', name: 'Calendula Officinalis', potency: 'LM1', preparation: 'Ointment', batchNumber: 'B006', expirationDate: '2024-11-30', location: 'Cabinet 3', quantity: 3, supplier: 'Boiron', alternateNames: ['Marigold'] },
];

// Make data persistent across requests in a dev environment by attaching to global
// In a real app, this would be a database.
if (process.env.NODE_ENV === 'development') {
  if (!global._medicines) {
    global._medicines = medicines;
  }
  medicines = global._medicines;
}


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
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const index = medicines.findIndex(m => m.id === id);
  if (index === -1) return null;
  medicines[index] = { ...medicines[index], ...updates };
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id);
  return medicines.length < initialLength;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  let results = [...medicines];
  
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
