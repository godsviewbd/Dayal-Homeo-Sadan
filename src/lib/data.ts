
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { Medicine, Preparation } from '@/types';
import { PREPARATIONS, POTENCIES } from '@/types'; // Import PREPARATIONS and POTENCIES for validation/defaults

// Define the path to your CSV file
const CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_name.csv');

function loadMedicinesFromCSV(): Medicine[] {
  try {
    // Check if the CSV file exists, create a template if not
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.warn(`CSV file not found at ${CSV_FILE_PATH}. A template will be created. Please populate it with your data.`);
      // Updated headers for the new CSV structure
      const headers = `"Medicine Name","Potency/Power","Box Number","Total Number Of Medicine"\n`;
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
    }
    
    // Updated required headers for the new CSV structure
    const requiredHeaders = ['Medicine Name', 'Potency/Power', 'Box Number', 'Total Number Of Medicine'];
    const actualHeaders = parsed.meta.fields;

    if (!actualHeaders || !requiredHeaders.every(h => actualHeaders.includes(h))) {
        console.error(`CSV file at ${CSV_FILE_PATH} is missing one or more required headers. Required headers: ${requiredHeaders.join(', ')}. Found: ${actualHeaders?.join(', ')}. Inventory will be empty.`);
        return [];
    }
    
    if (parsed.data.length === 0 && fs.readFileSync(CSV_FILE_PATH, 'utf-8').trim().split('\n').length <= 1) {
      console.info(`The CSV file at ${CSV_FILE_PATH} appears to contain only headers or is empty. Inventory will be empty. Populate the CSV with your medicine data.`);
    }

    return parsed.data.map((row, index) => {
      const medicineName = row['Medicine Name']?.trim();
      const potencyPower = row['Potency/Power']?.trim();
      const boxNumber = row['Box Number']?.trim();
      const totalNumberOfMedicineStr = row['Total Number Of Medicine']?.trim();

      if (!medicineName || !potencyPower || !boxNumber || !totalNumberOfMedicineStr) {
        if (Object.values(row).some(val => val && val.trim() !== '')) {
            console.warn(`Skipping row ${index + 2} in CSV due to missing required data for 'Medicine Name', 'Potency/Power', 'Box Number', or 'Total Number Of Medicine'.`);
        }
        return null;
      }

      const quantity = parseInt(totalNumberOfMedicineStr, 10);
      if (isNaN(quantity)) {
         console.warn(`Invalid quantity '${totalNumberOfMedicineStr}' for medicine '${medicineName}' in CSV row ${index + 2}. Defaulting to 0.`);
      }
      
      // Generate a unique ID. Using a combination of fields for potential stability if re-parsing.
      // Or a simpler Date.now() + index for guaranteed uniqueness per load.
      const generatedId = `${medicineName}-${potencyPower}-${boxNumber}-${index}`;


      return {
        id: generatedId, // ID is generated
        name: medicineName,
        potency: potencyPower,
        preparation: 'Pellets' as Preparation, // Default preparation
        batchNumber: boxNumber, // Using "Box Number" as "batchNumber"
        expirationDate: 'N/A', // Default expiration date
        location: 'N/A', // Default location
        quantity: isNaN(quantity) ? 0 : quantity,
        supplier: undefined, // Default supplier
        alternateNames: [], // Default alternate names
      };
    }).filter(Boolean) as Medicine[]; // filter(Boolean) removes any null entries from skipped rows
  } catch (error) {
    console.error('Failed to load medicines from CSV:', error instanceof Error ? error.message : String(error));
    return []; // Return empty on critical error
  }
}

let medicines: Medicine[] = loadMedicinesFromCSV();

export async function getMedicines(): Promise<Medicine[]> {
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     // Attempt to reload if empty and CSV exists, in case file was populated after server start
     console.log("Inventory is empty, attempting to reload from CSV (this might happen if CSV was updated after server start).")
     medicines = loadMedicinesFromCSV();
  }
  return JSON.parse(JSON.stringify(medicines)); // Return a deep copy
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  const medicine = medicines.find(m => m.id === id);
  return medicine ? JSON.parse(JSON.stringify(medicine)) : undefined;
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  // Ensure new IDs don't clash if we are generating them based on existing data.
  // A more robust ID generation might be needed if CSV IDs could be manually added later.
  const newMedicine: Medicine = { ...medicineData, id: String(Date.now() + Math.random()) };
  medicines.push(newMedicine);
  console.log(`Added medicine '${newMedicine.name}' to in-memory inventory. This change is NOT saved to the CSV.`);
  // Note: If you want addMedicine to persist, you'd need to write back to the CSV here.
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  const index = medicines.findIndex(m => m.id === id);
  if (index === -1) return null;
  medicines[index] = { ...medicines[index], ...updates };
  console.log(`Updated medicine ID '${id}' in in-memory inventory. This change is NOT saved to the CSV.`);
  // Note: If you want updateMedicine to persist, you'd need to write back to the CSV here.
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id);
  if (medicines.length < initialLength) {
    console.log(`Deleted medicine ID '${id}' from in-memory inventory. This change is NOT saved to the CSV.`);
    // Note: If you want deleteMedicine to persist, you'd need to write back to the CSV here.
    return true;
  }
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
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
    // Make potency search more flexible, e.g., exact match or contains
    results = results.filter(m => m.potency.toLowerCase().includes(lowerPotencyQuery));
  }
  
  return JSON.parse(JSON.stringify(results));
}
