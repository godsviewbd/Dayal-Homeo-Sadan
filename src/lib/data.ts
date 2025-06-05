
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { Medicine, Preparation } from '@/types';
import { PREPARATIONS } from '@/types'; // Import PREPARATIONS for validation

// Define the path to your CSV file
const CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_name.csv');

function loadMedicinesFromCSV(): Medicine[] {
  try {
    // Check if the CSV file exists, create a template if not
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.warn(`CSV file not found at ${CSV_FILE_PATH}. A template will be created. Please populate it with your data.`);
      const headers = "id,name,potency,preparation,batchNumber,expirationDate,location,quantity,supplier,alternateNames\n";
      const dirPath = path.dirname(CSV_FILE_PATH);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(CSV_FILE_PATH, headers, 'utf-8');
      console.log(`Created a template CSV file with headers at ${CSV_FILE_PATH}. Please add your medicine data to this file.`);
      return []; // Return empty array as the file is new and empty
    }

    const csvFileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const parsed = Papa.parse<Record<string, string>>(csvFileContent, {
      header: true, // Assumes the first row of your CSV is headers
      skipEmptyLines: true,
      dynamicTyping: false, // Keep all values as strings for manual conversion
    });

    if (parsed.errors.length > 0) {
      console.error('Error parsing CSV:', parsed.errors.map(e => e.message).join('\n'));
      console.warn(`There were errors parsing ${CSV_FILE_PATH}. Inventory might be incomplete. Please check the file format.`);
      // Optionally, still try to process valid data if any
    }
    
    const requiredHeaders = ['id', 'name', 'potency', 'preparation', 'batchNumber', 'expirationDate', 'location', 'quantity'];
    const actualHeaders = parsed.meta.fields;

    if (!actualHeaders || !requiredHeaders.every(h => actualHeaders.includes(h))) {
        console.error(`CSV file at ${CSV_FILE_PATH} is missing one or more required headers. Required headers: ${requiredHeaders.join(', ')}. Found: ${actualHeaders?.join(', ')}. Inventory will be empty.`);
        return [];
    }
    
    if (parsed.data.length === 0 && fs.readFileSync(CSV_FILE_PATH, 'utf-8').trim().split('\n').length <= 1) {
      console.info(`The CSV file at ${CSV_FILE_PATH} appears to contain only headers or is empty. Inventory will be empty. Populate the CSV with your medicine data.`);
    }


    return parsed.data.map((row, index) => {
      const id = row.id?.trim();
      const name = row.name?.trim();

      if (!id || !name) {
        // Don't log for empty rows that PapaParse might pick up if there are trailing newlines
        if (Object.values(row).some(val => val && val.trim() !== '')) {
            console.warn(`Skipping row ${index + 2} in CSV due to missing 'id' or 'name'.`); // +2 for header and 0-based index
        }
        return null;
      }

      const preparationValue = row.preparation?.trim() as Preparation;
      const isValidPreparation = PREPARATIONS.includes(preparationValue);

      const quantityStr = row.quantity?.trim();
      const quantity = quantityStr ? parseInt(quantityStr, 10) : 0;
      if (isNaN(quantity) && quantityStr !== undefined && quantityStr !== '') {
         console.warn(`Invalid quantity '${quantityStr}' for medicine '${name}' (id: ${id}) in CSV row ${index + 2}. Defaulting to 0.`);
      }


      return {
        id,
        name,
        potency: row.potency?.trim() || 'Unknown Potency',
        preparation: isValidPreparation ? preparationValue : 'Other',
        batchNumber: row.batchNumber?.trim() || 'N/A',
        expirationDate: row.expirationDate?.trim() || 'N/A', // Should be YYYY-MM-DD
        location: row.location?.trim() || 'N/A',
        quantity: isNaN(quantity) ? 0 : quantity,
        supplier: row.supplier?.trim() || undefined, // Optional
        alternateNames: row.alternateNames?.trim() ? row.alternateNames.split(',').map(s => s.trim()).filter(s => s) : [], // Optional
      };
    }).filter(Boolean) as Medicine[]; // filter(Boolean) removes any null entries from skipped rows
  } catch (error) {
    console.error('Failed to load medicines from CSV:', error instanceof Error ? error.message : String(error));
    return []; // Return empty on critical error
  }
}

// Initialize medicines array by loading data from CSV
// This happens once when the server starts or the module is first imported.
let medicines: Medicine[] = loadMedicinesFromCSV();

// --- Existing Data Access Functions ---
// These will now operate on the 'medicines' array loaded from the CSV.

export async function getMedicines(): Promise<Medicine[]> {
  // Simulate API delay if needed, or just return the loaded data
  // await new Promise(resolve => setTimeout(resolve, 100));
  // The 'medicines' array is already populated by loadMedicinesFromCSV()
  if (medicines.length === 0) {
     // Attempt to reload if empty, in case file was populated after server start (dev scenario)
     // For production, this might not be desired if file is static post-deployment.
     console.log("Inventory is empty, attempting to reload from CSV (this might happen if CSV was updated after server start).")
     medicines = loadMedicinesFromCSV();
  }
  return JSON.parse(JSON.stringify(medicines)); // Return a deep copy
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  // await new Promise(resolve => setTimeout(resolve, 50));
  const medicine = medicines.find(m => m.id === id);
  return medicine ? JSON.parse(JSON.stringify(medicine)) : undefined;
}

// IMPORTANT NOTE: The following functions (add, update, delete) will modify
// the IN-MEMORY 'medicines' array. They WILL NOT write changes back to the CSV file.
// To make changes persistent across server restarts, you would need to:
// 1. Implement logic to write the 'medicines' array back to the CSV file.
// 2. Or, switch to a proper database solution.

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  // await new Promise(resolve => setTimeout(resolve, 100));
  // Create a more robust ID if the input doesn't guarantee uniqueness from other sources
  const newMedicine: Medicine = { ...medicineData, id: String(Date.now() + Math.random()) };
  medicines.push(newMedicine);
  console.log(`Added medicine '${newMedicine.name}' to in-memory inventory. This change is NOT saved to the CSV.`);
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  // await new Promise(resolve => setTimeout(resolve, 100));
  const index = medicines.findIndex(m => m.id === id);
  if (index === -1) return null;
  medicines[index] = { ...medicines[index], ...updates };
  console.log(`Updated medicine ID '${id}' in in-memory inventory. This change is NOT saved to the CSV.`);
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  // await new Promise(resolve => setTimeout(resolve, 100));
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id);
  if (medicines.length < initialLength) {
    console.log(`Deleted medicine ID '${id}' from in-memory inventory. This change is NOT saved to the CSV.`);
    return true;
  }
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  // await new Promise(resolve => setTimeout(resolve, 100));
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
