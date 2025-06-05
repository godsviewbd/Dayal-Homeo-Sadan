
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { Medicine, Preparation } from '@/types';
import { POTENCIES } from '@/types';

const MEDICINE_DATA_CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_name.csv');
const MEDICINE_DATA_CSV_HEADERS = ['Medicine Name', 'Potecy/Power', 'Box Number', 'Total Number Of Medicine'];

const INDICATIONS_CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_indications.csv');
const INDICATIONS_CSV_HEADERS = ['Medicine Name', 'Indications'];

interface MedicineIndication {
  name: string;
  indications: string;
}

// In-memory stores, initialized as empty.
let medicineIndications: MedicineIndication[] = [];
let indicationsLoaded = false; // Flag to ensure indications are loaded only once per app lifecycle (or as needed)

let medicinesStore: Medicine[] = [];
// No medicinesStoreLoaded flag, as medicine data is mutable and might be reloaded frequently by write operations.


async function persistMedicinesToCSV(medicinesToPersist: Medicine[]): Promise<void> {
  console.log(`DATA: Attempting to persist ${medicinesToPersist.length} medicines to CSV: ${MEDICINE_DATA_CSV_FILE_PATH}`);
  console.log(`DATA: Using CSV Headers for unparse: ${JSON.stringify(MEDICINE_DATA_CSV_HEADERS)}`);
  try {
    const csvDataRows = medicinesToPersist.map(med => ({
      [MEDICINE_DATA_CSV_HEADERS[0]]: med.name,
      [MEDICINE_DATA_CSV_HEADERS[1]]: med.potency,
      [MEDICINE_DATA_CSV_HEADERS[2]]: med.location,
      [MEDICINE_DATA_CSV_HEADERS[3]]: med.quantity,
    }));

    const csvString = Papa.unparse(csvDataRows, {
      header: true,
      fields: MEDICINE_DATA_CSV_HEADERS,
    });

    fs.writeFileSync(MEDICINE_DATA_CSV_FILE_PATH, csvString, 'utf-8');
    console.log(`DATA: Successfully persisted medicines to CSV: ${MEDICINE_DATA_CSV_FILE_PATH}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`DATA: CRITICAL failure while writing medicines to CSV: ${errorMessage}`);
    throw new Error(`Failed to persist data to CSV: ${errorMessage}`);
  }
}

// Renamed to avoid conflict and clarify it's an internal loader.
function loadMedicinesFromCSVInternal(): Medicine[] {
  console.log(`DATA: loadMedicinesFromCSVInternal called. Attempting to load medicines from CSV: ${MEDICINE_DATA_CSV_FILE_PATH}`);

  if (!fs.existsSync(MEDICINE_DATA_CSV_FILE_PATH)) {
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.error(`DATA: ERROR - CSV file not found at ${MEDICINE_DATA_CSV_FILE_PATH}.`);
    // ... (rest of the error logging for missing file)
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    return [];
  }

  try {
    const csvFileContent = fs.readFileSync(MEDICINE_DATA_CSV_FILE_PATH, 'utf-8');
    const parsed = Papa.parse<Record<string, string>>(csvFileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: header => header.trim(),
    });

    // ... (rest of the header validation and data processing logic from original loadMedicinesFromCSV)
    const actualHeaders = parsed.meta.fields;
    if (!actualHeaders) {
      console.error(`Error: DATA: CSV file at ${MEDICINE_DATA_CSV_FILE_PATH} appears to be empty or has no headers. Inventory will be empty.`);
      return [];
    }

    const missingHeaders = MEDICINE_DATA_CSV_HEADERS.filter(expectedHeader => !actualHeaders.includes(expectedHeader));
    if (missingHeaders.length > 0) {
      console.error(`Error: DATA: CSV file at ${MEDICINE_DATA_CSV_FILE_PATH} is missing one or more required headers or has unexpected headers.`);
      console.error(`Required (exact match, case-sensitive for this check): [${MEDICINE_DATA_CSV_HEADERS.join(', ')}].`);
      console.error(`Found: [${actualHeaders.join(', ')}].`);
      console.error(`Missing: [${missingHeaders.join(', ')}].`);
      console.error(`Please ensure your CSV headers match exactly. Inventory will be empty.`);
      return [];
    }
    
    const fileContentLines = csvFileContent.trim().split('\n');
    if (parsed.data.length === 0 && fileContentLines.length <= 1 && fileContentLines[0].trim().toLowerCase() === MEDICINE_DATA_CSV_HEADERS.join(',').toLowerCase()) {
      console.info(`DATA: The CSV file at ${MEDICINE_DATA_CSV_FILE_PATH} contains only the header row. Inventory will be empty. Populate the CSV with your medicine data.`);
      return [];
    }
    if (parsed.data.length === 0 && fileContentLines.length > 1) {
      console.warn(`DATA: CSV file at ${MEDICINE_DATA_CSV_FILE_PATH} has ${fileContentLines.length} lines but PapaParse found 0 data rows. This could indicate formatting issues or all data rows were invalid/skipped.`);
    }

    const loadedMedicines = parsed.data.map((row, index) => {
      const medicineName = row[MEDICINE_DATA_CSV_HEADERS[0]]?.trim();
      const rawPotencyFromCSV = row[MEDICINE_DATA_CSV_HEADERS[1]]?.trim();
      const boxNumber = row[MEDICINE_DATA_CSV_HEADERS[2]]?.trim();
      const totalNumberOfMedicineStr = row[MEDICINE_DATA_CSV_HEADERS[3]]?.trim();

      if (!medicineName) {
        console.warn(`DATA: SKIPPING row ${index + 2} in medicine_name.csv due to missing '${MEDICINE_DATA_CSV_HEADERS[0]}'. Row data: ${JSON.stringify(row)}`);
        return null;
      }
      if (!rawPotencyFromCSV) {
        console.warn(`DATA: SKIPPING row ${index + 2} in medicine_name.csv for medicine '${medicineName}' due to missing '${MEDICINE_DATA_CSV_HEADERS[1]}'. Row data: ${JSON.stringify(row)}`);
        return null;
      }
      if (!boxNumber) {
         console.warn(`DATA: SKIPPING row ${index + 2} in medicine_name.csv for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}) due to missing '${MEDICINE_DATA_CSV_HEADERS[2]}'. Row data: ${JSON.stringify(row)}`);
        return null;
      }
      if (totalNumberOfMedicineStr === undefined || totalNumberOfMedicineStr === '') {
        console.warn(`DATA: SKIPPING row ${index + 2} in medicine_name.csv for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}, Box: ${boxNumber}) due to missing or empty '${MEDICINE_DATA_CSV_HEADERS[3]}'. Row data: ${JSON.stringify(row)}`);
        return null;
      }

      const quantity = parseInt(totalNumberOfMedicineStr, 10);
      if (isNaN(quantity)) {
        console.warn(`DATA: Invalid quantity '${totalNumberOfMedicineStr}' for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}) in medicine_name.csv row ${index + 2}. SKIPPING this row. Row data: ${JSON.stringify(row)}`);
        return null;
      }
      
      let extractedPotency: string | undefined = undefined;
      const rawPotencyLower = rawPotencyFromCSV.toLowerCase();

      for (const canonicalP of POTENCIES) {
        const canonicalPLower = canonicalP.toLowerCase();
        const pattern = new RegExp(`(?:^|\\s|[a-zA-Z])${canonicalPLower.replace(/([+.*?()])/g, '\\$1')}(?:c|ch|ck|x|m|k|potency|power|\\s|$)?`, 'i');
        const loosePattern = new RegExp(`\\b${canonicalPLower.replace(/([+.*?()])/g, '\\$1')}\\b`, 'i');

        if (pattern.test(rawPotencyLower) || loosePattern.test(rawPotencyLower) || rawPotencyLower.includes(canonicalPLower)) {
            if (POTENCIES.map(p => p.toLowerCase()).includes(rawPotencyLower)) {
                 extractedPotency = POTENCIES.find(p => p.toLowerCase() === rawPotencyLower);
            } else {
                extractedPotency = canonicalP;
            }
            if (extractedPotency) break;
        }
      }

      if (!extractedPotency) {
        const directMatch = POTENCIES.find(p => p.toLowerCase() === rawPotencyLower);
        if (directMatch) {
          extractedPotency = directMatch;
        }
      }

      if (!extractedPotency) {
        console.warn(`DATA: SKIPPING row ${index + 2} in medicine_name.csv for medicine '${medicineName}' due to unparsable or unmapped potency: '${rawPotencyFromCSV}'. It does not map to any of [${POTENCIES.join(', ')}] using enhanced logic. Row data: ${JSON.stringify(row)}`);
        return null;
      }

      const safeMedicineName = medicineName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safePotency = extractedPotency.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safeBoxNumber = boxNumber.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const generatedId = `${safeMedicineName}-${safePotency}-${safeBoxNumber}-row${index + 2}`;
      
      const newMedicineEntry: Medicine = {
        id: generatedId,
        name: medicineName,
        potency: extractedPotency,
        preparation: 'Liquid' as Preparation, // Default as per previous design
        location: boxNumber,
        quantity: quantity,
        supplier: undefined, // Default as per previous design
      };
      return newMedicineEntry;
    }).filter(Boolean) as Medicine[];

    console.log(`DATA: Successfully loaded and processed ${loadedMedicines.length} medicines from medicine_name.csv.`);
    if (loadedMedicines.length === 0 && parsed.data.length > 0) {
      console.warn("DATA: WARNING - Although CSV rows were found in medicine_name.csv, no medicines were successfully loaded. Check skip messages above for reasons.");
    }
    return loadedMedicines;

  } catch (error) {
    console.error('DATA: CRITICAL failure while loading medicines from medicine_name.csv:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// Internal loader for indications.
function loadIndicationsFromCSVInternal(): MedicineIndication[] {
  console.log(`DATA_INDICATIONS: loadIndicationsFromCSVInternal called. Attempting to load indications from CSV: ${INDICATIONS_CSV_FILE_PATH}`);
  if (!fs.existsSync(INDICATIONS_CSV_FILE_PATH)) {
    console.warn(`DATA_INDICATIONS: Indications CSV file not found at ${INDICATIONS_CSV_FILE_PATH}. Indications feature will be unavailable.`);
    return [];
  }

  try {
    const csvFileContent = fs.readFileSync(INDICATIONS_CSV_FILE_PATH, 'utf-8');
    const parsed = Papa.parse<Record<string, string>>(csvFileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: header => header.trim(),
    });
    
    const actualHeaders = parsed.meta.fields;
    if (!actualHeaders || actualHeaders.length === 0) {
     console.warn(`DATA_INDICATIONS: Indications CSV file at ${INDICATIONS_CSV_FILE_PATH} is empty or has no headers. Indications feature will be unavailable.`);
     return [];
   }
   
   const missingHeaders = INDICATIONS_CSV_HEADERS.filter(expectedHeader => !actualHeaders.includes(expectedHeader));
   if (missingHeaders.length > 0) {
     console.error(`Error: DATA_INDICATIONS: Indications CSV file at ${INDICATIONS_CSV_FILE_PATH} is missing required headers.`);
     console.error(`Required: [${INDICATIONS_CSV_HEADERS.join(', ')}]. Found: [${actualHeaders.join(', ')}]. Missing: [${missingHeaders.join(', ')}].`);
     console.error(`Indications feature will be unavailable.`);
     return [];
   }

    const loadedIndications = parsed.data.map((row, index) => {
      const name = row[INDICATIONS_CSV_HEADERS[0]]?.trim();
      const indications = row[INDICATIONS_CSV_HEADERS[1]]?.trim();

      if (!name || !indications) {
        console.warn(`DATA_INDICATIONS: SKIPPING row ${index + 2} in medicine_indications.csv due to missing name or indications. Row: ${JSON.stringify(row)}`);
        return null;
      }
      return { name, indications };
    }).filter(Boolean) as MedicineIndication[];
    
    console.log(`DATA_INDICATIONS: Successfully loaded ${loadedIndications.length} medicine indications from ${INDICATIONS_CSV_FILE_PATH}.`);
    return loadedIndications;

  } catch (error) {
    console.error('DATA_INDICATIONS: CRITICAL failure while loading medicine indications from CSV:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// Helper function to ensure medicines data is loaded into medicinesStore
async function ensureMedicinesLoaded(): Promise<Medicine[]> {
    // For simplicity in a dev environment and given persistence, we reload on each significant read.
    // This could be optimized with a 'medicinesStoreLoaded' flag if reads were much more frequent than writes.
    console.log("DATA: ensureMedicinesLoaded - reloading from CSV.");
    medicinesStore = loadMedicinesFromCSVInternal();
    return JSON.parse(JSON.stringify(medicinesStore)); // Return a copy
}

// Helper function to ensure indications data is loaded
async function ensureIndicationsLoaded(): Promise<MedicineIndication[]> {
  if (!indicationsLoaded) {
    console.log("DATA_INDICATIONS: ensureIndicationsLoaded - indications not loaded, loading now.");
    medicineIndications = loadIndicationsFromCSVInternal();
    indicationsLoaded = true; // Set flag after loading
  }
  return JSON.parse(JSON.stringify(medicineIndications)); // Return a copy
}


export async function getMedicines(): Promise<Medicine[]> {
  console.log("DATA: getMedicines called.");
  return ensureMedicinesLoaded();
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  const currentMedicines = await ensureMedicinesLoaded();
  const medicineById = currentMedicines.find(m => m.id === id);
  return medicineById; // It's already a copy from ensureMedicinesLoaded
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  let currentMedicines = await ensureMedicinesLoaded(); // Load current state
  const newMedicine: Medicine = { ...medicineData, id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  currentMedicines.push(newMedicine); // Modify the loaded list
  console.log(`DATA: Added medicine '${newMedicine.name}'. Persisting ${currentMedicines.length} medicines...`);
  await persistMedicinesToCSV(currentMedicines); // Persist the updated full list
  medicinesStore = [...currentMedicines]; // Update global store (optional, as next read will refresh)
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  let currentMedicines = await ensureMedicinesLoaded();
  const index = currentMedicines.findIndex(m => m.id === id);
  if (index === -1) {
    console.warn(`DATA: Update failed. Medicine with ID '${id}' not found.`);
    return null;
  }
  const oldQuantity = currentMedicines[index].quantity;
  // Ensure ID is preserved and not overwritten by partial updates
  currentMedicines[index] = { ...currentMedicines[index], ...updates, id: currentMedicines[index].id };
  console.log(`DATA: Updated ID '${id}' (${currentMedicines[index].name}). Qty: ${oldQuantity} -> ${currentMedicines[index].quantity}. Persisting ${currentMedicines.length} medicines...`);
  await persistMedicinesToCSV(currentMedicines);
  medicinesStore = [...currentMedicines];
  return JSON.parse(JSON.stringify(currentMedicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  let currentMedicines = await ensureMedicinesLoaded();
  const initialLength = currentMedicines.length;
  const updatedMedicines = currentMedicines.filter(m => m.id !== id);
  if (updatedMedicines.length < initialLength) {
    console.log(`DATA: Deleted ID '${id}'. Persisting ${updatedMedicines.length} medicines...`);
    await persistMedicinesToCSV(updatedMedicines);
    medicinesStore = [...updatedMedicines];
    return true;
  }
  console.warn(`DATA: Delete failed. ID '${id}' not found.`);
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  console.log(`DATA: Search called. Name: "${nameQuery}", Potency: "${potencyQuery}"`);
  const currentMedicines = await ensureMedicinesLoaded();
  
  let results = [...currentMedicines]; // Work with a copy

  const isNameQueryEmpty = !nameQuery || nameQuery.trim() === "";
  const isPotencyQueryNonSpecific = !potencyQuery || potencyQuery.trim().toLowerCase() === 'any' || potencyQuery.trim() === "";

  if (isNameQueryEmpty && isPotencyQueryNonSpecific) {
    console.log("DATA: Search is effectively empty. Returning empty results.");
    return [];
  }
  
  if (nameQuery && currentMedicines && currentMedicines.length > 0) {
    const specificMed = currentMedicines.find(m => m.name.toLowerCase().includes(nameQuery.toLowerCase()));
    if (specificMed) {
      console.log(`DATA: DIAGNOSTIC - In search, for nameQuery "${nameQuery}", a matching medicine "${specificMed.name}" (ID: ${specificMed.id}) has QTY: ${specificMed.quantity}.`);
    } else {
      console.log(`DATA: DIAGNOSTIC - In search, for nameQuery "${nameQuery}", no direct match found to log specific QTY.`);
    }
  }

  if (!isNameQueryEmpty) {
    const lowerNameQuery = nameQuery!.toLowerCase().trim();
    results = results.filter(m =>
      m.name.toLowerCase().includes(lowerNameQuery)
    );
  }

  if (!isPotencyQueryNonSpecific) {
    const lowerPotencyQuery = potencyQuery!.toLowerCase().trim();
    results = results.filter(m => m.potency.toLowerCase() === lowerPotencyQuery);
  }

  console.log(`DATA: Search found ${results.length} medicines.`);
  return results; // Already a copy
}

export async function getUniqueMedicineNames(): Promise<string[]> {
  const currentMedicines = await ensureMedicinesLoaded();
  const uniqueNames = new Set<string>();
  currentMedicines.forEach(med => uniqueNames.add(med.name));
  const sortedNames = Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  console.log(`DATA: Found ${sortedNames.length} unique medicine names for autocomplete.`);
  return sortedNames;
}

export async function getIndicationsByMedicineName(medicineName: string): Promise<string | undefined> {
  const currentIndications = await ensureIndicationsLoaded();
  
  console.log(`DATA_INDICATIONS: getIndicationsByMedicineName called for: "${medicineName}"`);
  console.log(`DATA_INDICATIONS: Total indications currently loaded: ${currentIndications.length}`);
  if (currentIndications.length > 0) {
    console.log(`DATA_INDICATIONS: First 3 loaded indication names for check: ${currentIndications.slice(0, 3).map(i => i.name).join('; ')}`);
  }

  const foundIndication = currentIndications.find(
    (ind) => ind.name.toLowerCase() === medicineName.toLowerCase()
  );

  if (foundIndication) {
    console.log(`DATA_INDICATIONS: Found indications for "${medicineName}": "${foundIndication.indications.substring(0, 50)}..."`);
    return foundIndication.indications;
  } else {
    console.log(`DATA_INDICATIONS: No indications found for "${medicineName}" in the loaded list.`);
    const similarNames = currentIndications
      .filter(ind => ind.name.toLowerCase().includes(medicineName.substring(0, Math.max(3, Math.floor(medicineName.length / 2))).toLowerCase()))
      .map(ind => ind.name)
      .slice(0, 5);
    if (similarNames.length > 0) {
      console.log(`DATA_INDICATIONS: Potential similar names in CSV based on first half of query: ${similarNames.join('; ')}`);
    }
    return undefined;
  }
}
