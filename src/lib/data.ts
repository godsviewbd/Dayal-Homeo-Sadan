
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { Medicine, Preparation } from '@/types';
import { POTENCIES } from '@/types';

const CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_name.csv');
// This header order and naming must match your CSV file exactly for reading and writing.
// User's CSV uses "Potecy/Power"
const CSV_HEADERS = ['Medicine Name', 'Potecy/Power', 'Box Number', 'Total Number Of Medicine'];

// Function to persist the current in-memory medicines array to the CSV file
async function persistMedicinesToCSV(medicinesToPersist: Medicine[]): Promise<void> {
  console.log(`DATA: Attempting to persist ${medicinesToPersist.length} medicines to CSV: ${CSV_FILE_PATH}`);
  console.log(`DATA: Using CSV Headers for unparse: ${JSON.stringify(CSV_HEADERS)}`);
  try {
    const csvDataRows = medicinesToPersist.map(med => ({
      [CSV_HEADERS[0]]: med.name,
      [CSV_HEADERS[1]]: med.potency, 
      [CSV_HEADERS[2]]: med.location,
      [CSV_HEADERS[3]]: med.quantity,
    }));

    const csvString = Papa.unparse(csvDataRows, {
      header: true,
      fields: CSV_HEADERS, 
    });

    fs.writeFileSync(CSV_FILE_PATH, csvString, 'utf-8');
    console.log(`DATA: Successfully persisted medicines to CSV: ${CSV_FILE_PATH}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`DATA: CRITICAL failure while writing medicines to CSV: ${errorMessage}`);
    // Make sure this error propagates so the user action can report it.
    throw new Error(`Failed to persist data to CSV: ${errorMessage}`);
  }
}


function loadMedicinesFromCSV(): Medicine[] {
  console.log(`DATA: Attempting to load medicines from CSV: ${CSV_FILE_PATH}`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.error(`DATA: ERROR - CSV file not found at ${CSV_FILE_PATH}.`);
    console.error(`Please create this file with the header (ensure exact match for '${CSV_HEADERS[1]}'):`);
    console.error(CSV_HEADERS.join(','));
    console.error(`The application will proceed with an empty inventory.`);
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    return [];
  }

  try {
    const csvFileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const parsed = Papa.parse<Record<string, string>>(csvFileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, 
      transformHeader: header => header.trim(), 
    });
    
    const actualHeaders = parsed.meta.fields;
    if (!actualHeaders) {
        console.error(`Error: DATA: CSV file at ${CSV_FILE_PATH} appears to be empty or has no headers. Inventory will be empty.`);
        return [];
    }
    console.log("DATA: Actual CSV Headers found:", actualHeaders);

    const missingHeaders = CSV_HEADERS.filter(expectedHeader => !actualHeaders.includes(expectedHeader));
    if (missingHeaders.length > 0) {
        console.error(`Error: DATA: CSV file at ${CSV_FILE_PATH} is missing one or more required headers or has unexpected headers.`);
        console.error(`Required (exact match, case-sensitive for this check): [${CSV_HEADERS.join(', ')}].`);
        console.error(`Found: [${actualHeaders.join(', ')}].`);
        console.error(`Missing: [${missingHeaders.join(', ')}].`);
        console.error(`Please ensure your CSV headers match exactly. Inventory will be empty.`);
        return [];
    }
    
    const fileContentLines = csvFileContent.trim().split('\n');
    if (parsed.data.length === 0 && fileContentLines.length <= 1 && fileContentLines[0].trim().toLowerCase() === CSV_HEADERS.join(',').toLowerCase()) {
      console.info(`DATA: The CSV file at ${CSV_FILE_PATH} contains only the header row. Inventory will be empty. Populate the CSV with your medicine data.`);
      return [];
    }
    if (parsed.data.length === 0 && fileContentLines.length > 1) {
        console.warn(`DATA: CSV file at ${CSV_FILE_PATH} has ${fileContentLines.length} lines but PapaParse found 0 data rows. This could indicate formatting issues or all data rows were invalid/skipped.`);
    }
    
    console.log(`DATA: Found ${parsed.data.length} data rows in CSV (excluding header). Processing each row...`);

    const loadedMedicines = parsed.data.map((row, index) => {
      const medicineName = row[CSV_HEADERS[0]]?.trim();
      const rawPotencyFromCSV = row[CSV_HEADERS[1]]?.trim(); // Uses 'Potecy/Power'
      const boxNumber = row[CSV_HEADERS[2]]?.trim();
      const totalNumberOfMedicineStr = row[CSV_HEADERS[3]]?.trim();

      if (!medicineName) {
        console.warn(`DATA: SKIPPING row ${index + 2} in CSV due to missing '${CSV_HEADERS[0]}'. Row data: ${JSON.stringify(row)}`);
        return null;
      }
      if (!rawPotencyFromCSV) {
        console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' due to missing '${CSV_HEADERS[1]}'. Row data: ${JSON.stringify(row)}`);
        return null;
      }
      if (!boxNumber) {
         console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}) due to missing '${CSV_HEADERS[2]}'. Row data: ${JSON.stringify(row)}`);
        return null;
      }
       if (totalNumberOfMedicineStr === undefined || totalNumberOfMedicineStr === '') { 
        console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}, Box: ${boxNumber}) due to missing or empty '${CSV_HEADERS[3]}'. Row data: ${JSON.stringify(row)}`);
        return null;
      }

      const quantity = parseInt(totalNumberOfMedicineStr, 10);
      if (isNaN(quantity)) {
         console.warn(`DATA: Invalid quantity '${totalNumberOfMedicineStr}' for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}) in CSV row ${index + 2}. SKIPPING this row. Row data: ${JSON.stringify(row)}`);
         return null;
      }
      
      let extractedPotency: string | undefined = undefined;
      const rawPotencyLower = rawPotencyFromCSV.toLowerCase();

      for (const canonicalP of POTENCIES) {
        const canonicalPLower = canonicalP.toLowerCase();
        // Try to match patterns like "200", "200c", "200x", "1m", "10M CH" etc.
        const pattern = new RegExp(`\\b(${canonicalPLower.replace(/(\d+)/, '$1')})(c|ch|ck|x|m|k|potency|power)?\\b`, 'i');
        const match = rawPotencyLower.match(pattern);

        if (match && (match[1] === canonicalPLower || POTENCIES.map(p => p.toLowerCase()).includes(match[1]))) {
            extractedPotency = POTENCIES.find(p => p.toLowerCase() === canonicalPLower || p.toLowerCase() === match[1]) || canonicalP;
            // console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' using pattern for ${canonicalP}`);
            break;
        }
      }
      
      if (!extractedPotency) {
         const directMatch = POTENCIES.find(p => p.toLowerCase() === rawPotencyLower);
         if (directMatch) {
           extractedPotency = directMatch;
          //  console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' by direct match.`);
         }
      }

      if (!extractedPotency) {
        // Fallback: check if any of the canonical potencies are simply contained in the string
        const foundPotency = POTENCIES.find(p => rawPotencyLower.includes(p.toLowerCase()));
        if (foundPotency) {
            extractedPotency = foundPotency;
            // console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' by simple inclusion.`);
        }
      }

      if (!extractedPotency) {
        console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' due to unparsable or unmapped potency: '${rawPotencyFromCSV}'. It does not map to any of [${POTENCIES.join(', ')}]. Row data: ${JSON.stringify(row)}`);
        return null; 
      }

      const safeMedicineName = medicineName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safePotency = extractedPotency.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safeBoxNumber = boxNumber.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const generatedId = `${safeMedicineName}-${safePotency}-${safeBoxNumber}-row${index}`;

      const newMedicineEntry: Medicine = {
        id: generatedId,
        name: medicineName, 
        potency: extractedPotency, 
        preparation: 'Liquid' as Preparation, // Defaulting to Liquid
        location: boxNumber,
        quantity: quantity, 
        supplier: undefined, 
      };
      // console.log(`DATA: Successfully parsed medicine for row ${index + 2}: ${JSON.stringify(newMedicineEntry)}`);
      return newMedicineEntry;
    }).filter(Boolean) as Medicine[];
    
    console.log(`\nDATA: Successfully loaded and processed ${loadedMedicines.length} medicines from CSV.`);
    if (loadedMedicines.length === 0 && parsed.data.length > 0) {
        console.warn("DATA: WARNING - Although CSV rows were found, no medicines were successfully loaded. Check skip messages above for reasons.");
    }
    return loadedMedicines;

  } catch (error) {
    console.error('DATA: CRITICAL failure while loading medicines from CSV:', error instanceof Error ? error.message : String(error));
    return []; 
  }
}

let medicines: Medicine[] = loadMedicinesFromCSV(); // Initial load at module startup

export async function getMedicines(): Promise<Medicine[]> {
  return JSON.parse(JSON.stringify(medicines)); 
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  const medicine = medicines.find(m => m.id === id);
  return medicine ? JSON.parse(JSON.stringify(medicine)) : undefined; 
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  const newMedicine: Medicine = { ...medicineData, id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }; 
  medicines.push(newMedicine); 
  console.log(`DATA: Added medicine '${newMedicine.name}' to IN-MEMORY inventory. Current count: ${medicines.length}`);
  await persistMedicinesToCSV(medicines); 
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  const index = medicines.findIndex(m => m.id === id);
  if (index === -1) {
    console.warn(`DATA: Update failed. Medicine with ID '${id}' not found in IN-MEMORY inventory.`);
    return null;
  }
  const oldQuantity = medicines[index].quantity;
  medicines[index] = { ...medicines[index], ...updates }; 
  console.log(`DATA: IN-MEMORY update for ID '${id}' (${medicines[index].name}). Quantity changed from ${oldQuantity} to ${medicines[index].quantity}. Persisting to CSV...`);
  await persistMedicinesToCSV(medicines); // This writes the updated 'medicines' array
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id); 
  if (medicines.length < initialLength) {
    console.log(`DATA: Deleted medicine ID '${id}' from IN-MEMORY inventory.`);
    await persistMedicinesToCSV(medicines); 
    return true;
  }
  console.warn(`DATA: Delete failed. Medicine with ID '${id}' not found for deletion in IN-MEMORY inventory.`);
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  console.log(`DATA: Search initiated. Forcing reload from CSV for search consistency. Name Query: "${nameQuery}", Potency Query: "${potencyQuery}"`);
  
  // Always load fresh data from CSV for search operations to ensure consistency
  const currentMedicinesFromCSV = loadMedicinesFromCSV();
  
  // CRITICAL DIAGNOSTIC LOG:
  if (nameQuery && currentMedicinesFromCSV && currentMedicinesFromCSV.length > 0) {
    const specificMed = currentMedicinesFromCSV.find(m => m.name.toLowerCase().includes(nameQuery.toLowerCase()));
    if (specificMed) {
        // This log will show the quantity of the FIRST medicine matching the nameQuery, as read from CSV during THIS search.
        console.log(`DATA: DIAGNOSTIC - In search, for nameQuery "${nameQuery}", a matching medicine "${specificMed.name}" (ID: ${specificMed.id}) has QTY: ${specificMed.quantity} (as loaded fresh from CSV for this search).`);
    } else {
        console.log(`DATA: DIAGNOSTIC - In search, for nameQuery "${nameQuery}", no direct match found in CSV to log specific QTY for this search.`);
    }
  }

  let results = [...currentMedicinesFromCSV]; 
  
  if (nameQuery) {
    const lowerNameQuery = nameQuery.toLowerCase().trim();
    if (lowerNameQuery) { 
        results = results.filter(m =>
          m.name.toLowerCase().includes(lowerNameQuery)
        );
    }
  }

  if (potencyQuery && potencyQuery !== 'Any') { 
    const lowerPotencyQuery = potencyQuery.toLowerCase().trim();
    results = results.filter(m => m.potency.toLowerCase() === lowerPotencyQuery);
  }
  
  console.log(`DATA: Search (from CSV) found ${results.length} medicines matching criteria.`);
  return JSON.parse(JSON.stringify(results)); 
}

export async function getUniqueMedicineNames(): Promise<string[]> {
  const currentMedicinesFromCSV = loadMedicinesFromCSV();
  const uniqueNames = new Set<string>();
  currentMedicinesFromCSV.forEach(med => uniqueNames.add(med.name));
  const sortedNames = Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  console.log(`DATA: Found ${sortedNames.length} unique medicine names for autocomplete (from CSV).`);
  return sortedNames;
}
