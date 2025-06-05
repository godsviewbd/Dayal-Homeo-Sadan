
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { Medicine, Preparation } from '@/types';
import { POTENCIES } from '@/types'; // Import POTENCIES for validation/defaults

// Define the path to your CSV file
const CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_name.csv');

function loadMedicinesFromCSV(): Medicine[] {
  console.log(`Attempting to load medicines from CSV: ${CSV_FILE_PATH}`);
  try {
    // Check if the CSV file exists, create a template if not
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.warn(`CSV file not found at ${CSV_FILE_PATH}. A template will be created. Please populate it with your data.`);
      const headers = `"Medicine Name","Potency/Power","Box Number","Total Number Of Medicine"\n`;
      const dirPath = path.dirname(CSV_FILE_PATH);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(CSV_FILE_PATH, headers, 'utf-8');
      console.log(`Created a template CSV file with headers at ${CSV_FILE_PATH}. Please add your medicine data to this file.`);
      return [];
    }

    const csvFileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const parsed = Papa.parse<Record<string, string>>(csvFileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (parsed.errors.length > 0) {
      console.error('Error parsing CSV:', parsed.errors.map(e => `Row ${e.row}: ${e.message} (${e.code})`).join('\n'));
      console.warn(`There were errors parsing ${CSV_FILE_PATH}. Inventory might be incomplete. Please check the file format.`);
    }
    
    const requiredHeaders = ['Medicine Name', 'Potency/Power', 'Box Number', 'Total Number Of Medicine'];
    const actualHeaders = parsed.meta.fields;

    if (!actualHeaders || !requiredHeaders.every(h => actualHeaders.includes(h))) {
        console.error(`CSV file at ${CSV_FILE_PATH} is missing one or more required headers. Required: [${requiredHeaders.join(', ')}]. Found: [${actualHeaders?.join(', ')}]. Inventory will be empty.`);
        return [];
    }
    
    if (parsed.data.length === 0 && fs.readFileSync(CSV_FILE_PATH, 'utf-8').trim().split('\n').length <= 1) {
      console.info(`The CSV file at ${CSV_FILE_PATH} appears to contain only headers or is empty. Inventory will be empty. Populate the CSV with your medicine data.`);
    }

    const loadedMedicines = parsed.data.map((row, index) => {
      const medicineName = row['Medicine Name']?.trim();
      const rawPotencyFromCSV = row['Potency/Power']?.trim();
      const boxNumber = row['Box Number']?.trim();
      const totalNumberOfMedicineStr = row['Total Number Of Medicine']?.trim();

      if (!medicineName || !rawPotencyFromCSV || !boxNumber || !totalNumberOfMedicineStr) {
        // Only warn if the row has some data, to avoid warnings for completely empty trailing lines
        if (Object.values(row).some(val => val && val.trim() !== '')) {
            console.warn(`Skipping row ${index + 2} in CSV due to missing required data for one or more of: 'Medicine Name', 'Potency/Power', 'Box Number', 'Total Number Of Medicine'. Row data: ${JSON.stringify(row)}`);
        }
        return null;
      }

      const quantity = parseInt(totalNumberOfMedicineStr, 10);
      if (isNaN(quantity)) {
         console.warn(`Invalid quantity '${totalNumberOfMedicineStr}' for medicine '${medicineName}' (Potency: ${rawPotencyFromCSV}) in CSV row ${index + 2}. Defaulting to 0.`);
      }
      
      let extractedPotency: string | undefined = undefined;
      if (rawPotencyFromCSV) {
        const rawPotencyLower = rawPotencyFromCSV.toLowerCase();
        for (const p of POTENCIES) {
          const pLower = p.toLowerCase();
          let pattern: RegExp;
          // For purely numeric potencies like "200", "30", match them with optional "c" or "x" suffix.
          // For potencies with letters like "1M", "CM", "3X", match them exactly.
          if (/^(\d+)$/.test(pLower)) { // e.g. "200", "30"
            pattern = new RegExp(`\\b${pLower}(c|x)?\\b`, 'i');
          } else { // e.g. "1m", "cm", "3x"
            pattern = new RegExp(`\\b${pLower}\\b`, 'i');
          }

          if (pattern.test(rawPotencyLower)) {
            extractedPotency = p; // Use the canonical potency value from POTENCIES
            break;
          }
        }
        
        // Fallback for direct match if regex didn't catch it (e.g. if CSV has "1M" and POTENCIES has "1M")
        if (!extractedPotency) {
          const directMatch = POTENCIES.find(p => p.toLowerCase() === rawPotencyLower);
          if (directMatch) {
            extractedPotency = directMatch;
          }
        }
      }

      if (!extractedPotency) {
        console.warn(`Skipping row ${index + 2} in CSV for medicine '${medicineName}' due to unparsable or unmapped potency: '${rawPotencyFromCSV}'. It does not map to any of [${POTENCIES.join(', ')}]. Please check CSV data or POTENCIES in src/types/index.ts.`);
        return null; 
      }

      // Generate a more robust ID: ensure components are URL-friendly and add index for guaranteed uniqueness
      const safeMedicineName = medicineName.replace(/[^a-zA-Z0-9-_]/g, '-');
      const safePotency = extractedPotency.replace(/[^a-zA-Z0-9-_]/g, '-');
      const safeBoxNumber = boxNumber.replace(/[^a-zA-Z0-9-_]/g, '-');
      const generatedId = `${safeMedicineName}-${safePotency}-${safeBoxNumber}-row${index}`;


      return {
        id: generatedId,
        name: medicineName,
        potency: extractedPotency, 
        preparation: 'Pellets' as Preparation, // Default preparation
        batchNumber: boxNumber, // Mapped from "Box Number"
        expirationDate: 'N/A', // Default, not in CSV
        location: `Box ${boxNumber}`, // Sensible default using Box Number
        quantity: isNaN(quantity) ? 0 : quantity, // Parsed from "Total Number Of Medicine"
        supplier: undefined, // Default, not in CSV
        alternateNames: [], // Default, not in CSV
      };
    }).filter(Boolean) as Medicine[];
    
    console.log(`Successfully loaded ${loadedMedicines.length} medicines from CSV.`);
    return loadedMedicines;

  } catch (error) {
    console.error('Critical failure while loading medicines from CSV:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

let medicines: Medicine[] = loadMedicinesFromCSV();

// Function to reload medicines, e.g., if the CSV file changes during development
export function reloadMedicines() {
  console.log("Reloading medicines from CSV...");
  medicines = loadMedicinesFromCSV();
  console.log(`Medicines reloaded. Current count: ${medicines.length}`);
}


export async function getMedicines(): Promise<Medicine[]> {
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("Inventory is empty, attempting to reload from CSV for getMedicines.");
     reloadMedicines();
  }
  return JSON.parse(JSON.stringify(medicines));
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("Inventory is empty, attempting to reload from CSV for getMedicineById.");
     reloadMedicines();
  }
  const medicine = medicines.find(m => m.id === id);
  return medicine ? JSON.parse(JSON.stringify(medicine)) : undefined;
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  const newMedicine: Medicine = { ...medicineData, id: String(Date.now() + Math.random()) };
  medicines.push(newMedicine);
  console.log(`Added medicine '${newMedicine.name}' to in-memory inventory. This change is NOT saved to the CSV. Current count: ${medicines.length}`);
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  const index = medicines.findIndex(m => m.id === id);
  if (index === -1) return null;
  medicines[index] = { ...medicines[index], ...updates };
  console.log(`Updated medicine ID '${id}' in in-memory inventory. This change is NOT saved to the CSV.`);
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id);
  if (medicines.length < initialLength) {
    console.log(`Deleted medicine ID '${id}' from in-memory inventory. This change is NOT saved to the CSV. Current count: ${medicines.length}`);
    return true;
  }
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  console.log(`Searching medicines with nameQuery: "${nameQuery}", potencyQuery: "${potencyQuery}"`);
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("Inventory is empty, attempting to reload from CSV for searchMedicinesByNameAndPotency.");
     reloadMedicines();
  }
  
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
  
  console.log(`Found ${results.length} medicines matching search criteria.`);
  return JSON.parse(JSON.stringify(results));
}

export async function getUniqueMedicineNames(): Promise<string[]> {
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("Inventory is empty, attempting to reload from CSV for getUniqueMedicineNames.");
     reloadMedicines();
  }
  const uniqueNames = new Set<string>();
  medicines.forEach(med => uniqueNames.add(med.name));
  const sortedNames = Array.from(uniqueNames).sort();
  console.log(`Found ${sortedNames.length} unique medicine names for autocomplete.`);
  return sortedNames;
}

