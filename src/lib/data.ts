
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { Medicine, Preparation } from '@/types';
import { POTENCIES } from '@/types'; // Import POTENCIES for validation/defaults

// Define the path to your CSV file
const CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_name.csv');

function loadMedicinesFromCSV(): Medicine[] {
  console.log(`DATA: Attempting to load medicines from CSV: ${CSV_FILE_PATH}`);
  try {
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.warn(`DATA: CSV file not found at ${CSV_FILE_PATH}. A template will be created. Please populate it with your data.`);
      const headers = `"Medicine Name","Potency/Power","Box Number","Total Number Of Medicine"\n`;
      const dirPath = path.dirname(CSV_FILE_PATH);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(CSV_FILE_PATH, headers, 'utf-8');
      console.log(`DATA: Created a template CSV file with headers at ${CSV_FILE_PATH}. Please add your medicine data to this file.`);
      return [];
    }

    const csvFileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const parsed = Papa.parse<Record<string, string>>(csvFileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep this false for manual type handling
    });

    if (parsed.errors.length > 0) {
      console.error('DATA: Error parsing CSV:', parsed.errors.map(e => `Row ${e.row}: ${e.message} (${e.code})`).join('\n'));
      console.warn(`DATA: There were errors parsing ${CSV_FILE_PATH}. Inventory might be incomplete. Please check the file format.`);
    }
    
    const expectedHeaders = ['Medicine Name', 'Potency/Power', 'Box Number', 'Total Number Of Medicine'];
    const actualHeaders = parsed.meta.fields;
    console.log("DATA: Actual CSV Headers found:", actualHeaders);

    if (!actualHeaders || !expectedHeaders.every(h => actualHeaders.includes(h))) {
        console.error(`DATA: CSV file at ${CSV_FILE_PATH} is missing one or more required headers or has unexpected headers.
Required (exact match, case-sensitive for this check): [${expectedHeaders.join(', ')}]. 
Found: [${actualHeaders?.join(', ')}]. 
Please ensure your CSV headers match exactly. Inventory will be empty.`);
        return [];
    }
    
    if (parsed.data.length === 0 && fs.readFileSync(CSV_FILE_PATH, 'utf-8').trim().split('\n').length <= 1) {
      console.info(`DATA: The CSV file at ${CSV_FILE_PATH} appears to contain only headers or is empty. Inventory will be empty. Populate the CSV with your medicine data.`);
      return [];
    }
    console.log(`DATA: Found ${parsed.data.length} data rows in CSV (excluding header).`);

    const loadedMedicines = parsed.data.map((row, index) => {
      console.log(`DATA: Processing CSV row ${index + 2}:`, row);

      const medicineName = row['Medicine Name']?.trim();
      const rawPotencyFromCSV = row['Potency/Power']?.trim();
      const boxNumber = row['Box Number']?.trim();
      const totalNumberOfMedicineStr = row['Total Number Of Medicine']?.trim();

      if (!medicineName) {
        console.warn(`DATA: Skipping row ${index + 2} in CSV due to missing 'Medicine Name'.`);
        return null;
      }
      if (!rawPotencyFromCSV) {
        console.warn(`DATA: Skipping row ${index + 2} for medicine '${medicineName}' due to missing 'Potency/Power'.`);
        return null;
      }
      if (!boxNumber) {
         console.warn(`DATA: Skipping row ${index + 2} for medicine '${medicineName}' (Potency: ${rawPotencyFromCSV}) due to missing 'Box Number'.`);
        return null;
      }
       if (!totalNumberOfMedicineStr) {
        console.warn(`DATA: Skipping row ${index + 2} for medicine '${medicineName}' (Potency: ${rawPotencyFromCSV}, Box: ${boxNumber}) due to missing 'Total Number Of Medicine'.`);
        return null;
      }


      const quantity = parseInt(totalNumberOfMedicineStr, 10);
      if (isNaN(quantity)) {
         console.warn(`DATA: Invalid quantity '${totalNumberOfMedicineStr}' for medicine '${medicineName}' (Potency: ${rawPotencyFromCSV}) in CSV row ${index + 2}. Defaulting to 0, but this row might be problematic.`);
      }
      
      let extractedPotency: string | undefined = undefined;
      if (rawPotencyFromCSV) {
        const rawPotencyLower = rawPotencyFromCSV.toLowerCase();
        for (const canonicalP of POTENCIES) { 
          const canonicalPLower = canonicalP.toLowerCase();
          // Check if rawPotencyLower contains the canonical potency as a distinct word/number.
          // Handles cases like "200", "200c", "200x", "1m", "cm".
          // Example: "power 200" should match "200". "30 c" should match "30".
          const pattern = new RegExp(`\\b${canonicalPLower.replace(/(\d+)/, '$1(c|x)?')}\\b`, 'i');
          if (pattern.test(rawPotencyLower)) {
            extractedPotency = canonicalP; // Use the canonical potency value from POTENCIES
            console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to canonical '${extractedPotency}' for '${medicineName}'`);
            break;
          }
        }
      }

      if (!extractedPotency) {
        console.warn(`DATA: Skipping row ${index + 2} for medicine '${medicineName}' due to unparsable or unmapped potency: '${rawPotencyFromCSV}'. It does not map to any of [${POTENCIES.join(', ')}]. Please check CSV data or POTENCIES in src/types/index.ts.`);
        return null; 
      }

      const safeMedicineName = medicineName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safePotency = extractedPotency.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safeBoxNumber = boxNumber.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const generatedId = `${safeMedicineName}-${safePotency}-${safeBoxNumber}-row${index}`;

      const newMedicineEntry: Medicine = {
        id: generatedId,
        name: medicineName, // Store original name from CSV
        potency: extractedPotency, 
        preparation: 'Pellets' as Preparation, 
        batchNumber: boxNumber, 
        expirationDate: 'N/A', 
        location: `Box ${boxNumber}`, 
        quantity: isNaN(quantity) ? 0 : quantity,
        supplier: undefined, 
        alternateNames: [], 
      };
      console.log(`DATA: Successfully parsed medicine for row ${index + 2}:`, newMedicineEntry);
      return newMedicineEntry;
    }).filter(Boolean) as Medicine[];
    
    console.log(`DATA: Successfully loaded and processed ${loadedMedicines.length} medicines from CSV.`);
    return loadedMedicines;

  } catch (error) {
    console.error('DATA: Critical failure while loading medicines from CSV:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

let medicines: Medicine[] = loadMedicinesFromCSV();

export function reloadMedicines() {
  console.log("DATA: Reloading medicines from CSV...");
  medicines = loadMedicinesFromCSV();
  console.log(`DATA: Medicines reloaded. Current count: ${medicines.length}`);
}


export async function getMedicines(): Promise<Medicine[]> {
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("DATA: Inventory is empty for getMedicines, attempting to reload from CSV.");
     reloadMedicines();
  }
  return JSON.parse(JSON.stringify(medicines));
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("DATA: Inventory is empty for getMedicineById, attempting to reload from CSV.");
     reloadMedicines();
  }
  const medicine = medicines.find(m => m.id === id);
  return medicine ? JSON.parse(JSON.stringify(medicine)) : undefined;
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  const newMedicine: Medicine = { ...medicineData, id: String(Date.now() + Math.random()) };
  medicines.push(newMedicine); // This adds to the in-memory array
  console.log(`DATA: Added medicine '${newMedicine.name}' to in-memory inventory (NOT saved to CSV). Current count: ${medicines.length}`);
  // Note: This does NOT save back to the CSV file.
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  const index = medicines.findIndex(m => m.id === id);
  if (index === -1) return null;
  medicines[index] = { ...medicines[index], ...updates }; // Updates in-memory array
  console.log(`DATA: Updated medicine ID '${id}' in in-memory inventory (NOT saved to CSV).`);
  // Note: This does NOT save back to the CSV file.
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id); // Modifies in-memory array
  if (medicines.length < initialLength) {
    console.log(`DATA: Deleted medicine ID '${id}' from in-memory inventory (NOT saved to CSV). Current count: ${medicines.length}`);
    // Note: This does NOT save back to the CSV file.
    return true;
  }
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  console.log(`DATA: Searching medicines with nameQuery: "${nameQuery}", potencyQuery: "${potencyQuery}"`);
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("DATA: Inventory is empty for search, attempting to reload from CSV.");
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

  if (potencyQuery && potencyQuery !== 'Any') { // Ensure "Any" means no filter
    const lowerPotencyQuery = potencyQuery.toLowerCase();
    results = results.filter(m => m.potency.toLowerCase() === lowerPotencyQuery);
  }
  
  console.log(`DATA: Found ${results.length} medicines matching search criteria.`);
  return JSON.parse(JSON.stringify(results)); // Return a deep copy
}

export async function getUniqueMedicineNames(): Promise<string[]> {
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("DATA: Inventory is empty for getUniqueMedicineNames, attempting to reload from CSV.");
     reloadMedicines();
  }
  const uniqueNames = new Set<string>();
  medicines.forEach(med => uniqueNames.add(med.name));
  const sortedNames = Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  console.log(`DATA: Found ${sortedNames.length} unique medicine names for autocomplete.`);
  return sortedNames;
}
