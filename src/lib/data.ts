
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { Medicine, Preparation } from '@/types';
import { POTENCIES } from '@/types';

const CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_name.csv');
// This header order and naming must match your CSV file exactly for reading.
// It's also used for writing back to the CSV.
const CSV_HEADERS = ['Medicine Name', 'Potecy/Power', 'Box Number', 'Total Number Of Medicine'];

// Function to persist the current in-memory medicines array to the CSV file
async function persistMedicinesToCSV(medicinesToPersist: Medicine[]): Promise<void> {
  console.log(`DATA: Attempting to persist ${medicinesToPersist.length} medicines to CSV: ${CSV_FILE_PATH}`);
  console.log(`DATA: Using CSV Headers for unparse: ${JSON.stringify(CSV_HEADERS)}`);
  try {
    const csvDataRows = medicinesToPersist.map(med => ({
      [CSV_HEADERS[0]]: med.name,
      [CSV_HEADERS[1]]: med.potency, // This will be the canonical potency string
      [CSV_HEADERS[2]]: med.location,
      [CSV_HEADERS[3]]: med.quantity,
      // Note: Preparation and Supplier are not in the user's CSV, so they are not written back.
      // If they were to be persisted, CSV_HEADERS and this mapping would need an update.
    }));

    const csvString = Papa.unparse(csvDataRows, {
      header: true,
      fields: CSV_HEADERS, // Ensure correct header order and names for writing
    });

    fs.writeFileSync(CSV_FILE_PATH, csvString, 'utf-8');
    console.log(`DATA: Successfully persisted medicines to CSV: ${CSV_FILE_PATH}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`DATA: CRITICAL failure while writing medicines to CSV: ${errorMessage}`);
    // THROW THE ERROR so it can be caught by the server action and reported to the user
    throw new Error(`Failed to persist data to CSV: ${errorMessage}`);
  }
}


function loadMedicinesFromCSV(): Medicine[] {
  console.log(`DATA: Attempting to load medicines from CSV: ${CSV_FILE_PATH}`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.error(`DATA: ERROR - CSV file not found at ${CSV_FILE_PATH}.`);
    console.error(`Please create this file with the header (ensure exact match for 'Potecy/Power'):`);
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
      dynamicTyping: false, // Keep all values as strings initially
      transformHeader: header => header.trim(), // Trim whitespace from headers
    });

    if (parsed.errors.length > 0) {
      parsed.errors.forEach(err => {
        console.error(`DATA: CSV Parsing Error - Code: ${err.code}, Message: ${err.message}, Row: ${err.row}`);
      });
      console.warn(`DATA: There were errors parsing ${CSV_FILE_PATH}. Inventory might be incomplete. Please check the file format and content.`);
    }
    
    const actualHeaders = parsed.meta.fields;
    console.log("DATA: Actual CSV Headers found:", actualHeaders);

    // Strict check for required headers
    const missingHeaders = CSV_HEADERS.filter(expectedHeader => !actualHeaders?.includes(expectedHeader));
    if (missingHeaders.length > 0) {
        console.error(`Error: DATA: CSV file at ${CSV_FILE_PATH} is missing required headers.`);
        console.error(`Required (exact match): [${CSV_HEADERS.join(', ')}].`);
        console.error(`Found: [${actualHeaders?.join(', ')}].`);
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
        console.warn(`DATA: CSV file at ${CSV_FILE_PATH} has ${fileContentLines.length} lines but PapaParse found 0 data rows. This could indicate formatting issues (e.g. inconsistent delimiters, problematic quotes) or all data rows were invalid/skipped.`);
    }
    
    console.log(`DATA: Found ${parsed.data.length} data rows in CSV (excluding header). Processing each row...`);

    const loadedMedicines = parsed.data.map((row, index) => {
      // console.log(`\nDATA: Processing CSV row ${index + 2}: Original data =`, JSON.stringify(row));

      const medicineName = row[CSV_HEADERS[0]]?.trim();
      const rawPotencyFromCSV = row[CSV_HEADERS[1]]?.trim(); // 'Potecy/Power'
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
       if (totalNumberOfMedicineStr === undefined || totalNumberOfMedicineStr === '') { // Check for empty string too
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
        // Check for direct match, or if raw potency contains the canonical potency as a word/number
        // e.g., "200", "200c", "power 200" should all map to "200" if "200" is in POTENCIES
        const pattern = new RegExp(`\\b${canonicalPLower.replace(/(\d+)/, '$1(?:c|x|ch|ck|m|k)?')}\\b`, 'i');
        if (pattern.test(rawPotencyLower)) {
            extractedPotency = canonicalP;
            // console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' for '${medicineName}' (pattern match).`);
            break;
        }
      }
      
      if (!extractedPotency) {
         // Fallback: if raw potency is exactly one of the canonical potencies (case-insensitive)
         const directMatch = POTENCIES.find(p => p.toLowerCase() === rawPotencyLower);
         if (directMatch) {
           extractedPotency = directMatch;
          //  console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' for '${medicineName}' (direct case-insensitive match).`);
         }
      }

      if (!extractedPotency) {
        console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' due to unparsable or unmapped potency: '${rawPotencyFromCSV}'. It does not map to any of [${POTENCIES.join(', ')}]. Please check CSV data or POTENCIES in src/types/index.ts. Row data: ${JSON.stringify(row)}`);
        return null; 
      }

      const safeMedicineName = medicineName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safePotency = extractedPotency.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safeBoxNumber = boxNumber.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      // Using a more unique ID including the original row index to avoid collisions if name, potency, box are same
      const generatedId = `${safeMedicineName}-${safePotency}-${safeBoxNumber}-row${index}`;

      const newMedicineEntry: Medicine = {
        id: generatedId,
        name: medicineName, 
        potency: extractedPotency, 
        preparation: 'Liquid' as Preparation, // Defaulting to liquid as per user request
        location: boxNumber,
        quantity: quantity, // Already parsed and validated
        supplier: undefined, // Supplier is not in CSV
      };
      // console.log(`DATA: Successfully PARSED medicine for row ${index + 2}: Name='${newMedicineEntry.name}', CanonicalPotency='${newMedicineEntry.potency}', Qty=${newMedicineEntry.quantity}, Location/Box='${newMedicineEntry.location}', ID='${newMedicineEntry.id}'`);
      return newMedicineEntry;
    }).filter(Boolean) as Medicine[];
    
    console.log(`\nDATA: Successfully loaded and processed ${loadedMedicines.length} medicines from CSV.`);
    if (loadedMedicines.length === 0 && parsed.data.length > 0) {
        console.warn("DATA: WARNING - Although CSV rows were found, no medicines were successfully loaded. Check skip messages above for reasons (e.g., potency mapping issues, missing required fields).");
    }
    return loadedMedicines;

  } catch (error) {
    console.error('DATA: CRITICAL failure while loading medicines from CSV:', error instanceof Error ? error.message : String(error));
    return []; // Return empty if critical error during load
  }
}

let medicines: Medicine[] = loadMedicinesFromCSV();

// This function should not create the file, only signal that it's missing.
// The user is responsible for creating and populating their CSV.
export function ensureCsvFileExists() {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.error(`DATA: ERROR - CSV file not found at ${CSV_FILE_PATH}.`);
    console.error(`Please create this file with the header (ensure exact match for 'Potecy/Power'):`);
    console.error(CSV_HEADERS.join(','));
    console.error(`The application will proceed with an empty inventory if the file is not present at startup.`);
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    // Do NOT create the file here.
  }
}
// Call this once at module load to check/inform about the CSV file.
ensureCsvFileExists();


export function reloadMedicines() {
  console.log("DATA: Reloading medicines from CSV...");
  medicines = loadMedicinesFromCSV();
  console.log(`DATA: Medicines reloaded. Current count in memory: ${medicines.length}`);
}


export async function getMedicines(): Promise<Medicine[]> {
  // if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) { // Removed auto-reload here to avoid spamming logs if file is problematic
  //    console.log("DATA: getMedicines() found empty inventory, attempting to reload from CSV.");
  //    reloadMedicines();
  // }
  return JSON.parse(JSON.stringify(medicines)); 
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  const medicine = medicines.find(m => m.id === id);
  return medicine ? JSON.parse(JSON.stringify(medicine)) : undefined; 
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  // Create a more unique ID, perhaps a timestamp or UUID if collisions are a concern.
  // For now, simple timestamp + random to avoid collisions during a session.
  const newMedicine: Medicine = { ...medicineData, id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }; 
  medicines.push(newMedicine); 
  console.log(`DATA: Added medicine '${newMedicine.name}' to IN-MEMORY inventory. Current count: ${medicines.length}`);
  await persistMedicinesToCSV(medicines); // Persist changes to CSV
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
  console.log(`DATA: Updated medicine ID '${id}' in IN-MEMORY inventory. Quantity changed from ${oldQuantity} to ${medicines[index].quantity}. Attempting to persist...`);
  await persistMedicinesToCSV(medicines); // Persist changes to CSV
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id); 
  if (medicines.length < initialLength) {
    console.log(`DATA: Deleted medicine ID '${id}' from IN-MEMORY inventory.`);
    await persistMedicinesToCSV(medicines); // Persist changes to CSV
    return true;
  }
  console.warn(`DATA: Delete failed. Medicine with ID '${id}' not found for deletion in IN-MEMORY inventory.`);
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  console.log(`DATA: Initiating search. Name Query: "${nameQuery}", Potency Query: "${potencyQuery}"`);
  
  let results = [...medicines]; 
  
  if (nameQuery) {
    const lowerNameQuery = nameQuery.toLowerCase().trim();
    if (lowerNameQuery) { 
        results = results.filter(m =>
          m.name.toLowerCase().includes(lowerNameQuery)
        );
        // console.log(`DATA: After filtering by name ("${nameQuery}"), ${results.length} medicines remaining.`);
    }
  }

  if (potencyQuery && potencyQuery !== 'Any') { 
    const lowerPotencyQuery = potencyQuery.toLowerCase().trim();
    results = results.filter(m => m.potency.toLowerCase() === lowerPotencyQuery);
    // console.log(`DATA: After filtering by potency ("${potencyQuery}"), ${results.length} medicines remaining.`);
  } else if (potencyQuery === 'Any') {
    // console.log(`DATA: Potency query is "Any", so no potency filter applied.`);
  }
  
  console.log(`DATA: Search found ${results.length} medicines matching criteria.`);
  return JSON.parse(JSON.stringify(results)); 
}

export async function getUniqueMedicineNames(): Promise<string[]> {
  const uniqueNames = new Set<string>();
  medicines.forEach(med => uniqueNames.add(med.name));
  const sortedNames = Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  // console.log(`DATA: Found ${sortedNames.length} unique medicine names for autocomplete.`);
  return sortedNames;
}
