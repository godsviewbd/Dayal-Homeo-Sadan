
'use server';

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
    // Sort before persisting to maintain order in the CSV file as well (optional, but good for consistency)
    const sortedMedicinesToPersist = [...medicinesToPersist].sort((a, b) => a.name.localeCompare(b.name));

    const csvDataRows = sortedMedicinesToPersist.map(med => ({
      [MEDICINE_DATA_CSV_HEADERS[0]]: med.name,
      [MEDICINE_DATA_CSV_HEADERS[1]]: med.potency, // Persist the actual potency value
      [MEDICINE_DATA_CSV_HEADERS[2]]: med.location,
      [MEDICINE_DATA_CSV_HEADERS[3]]: med.quantity,
    }));

    const csvString = Papa.unparse(csvDataRows, {
      header: true,
      fields: MEDICINE_DATA_CSV_HEADERS, // Ensure these are the exact headers for the output file
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
    console.error(`DATA: Please ensure the 'medicine_name.csv' file exists in the 'src/data/' directory.`);
    console.error(`DATA: Expected headers: ${MEDICINE_DATA_CSV_HEADERS.join(', ')}`);
    console.error(`DATA: The application will proceed with an empty inventory. You can add medicines through the UI.`);
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    // Create an empty file with headers if it doesn't exist, to allow the app to start cleanly
    try {
      const csvHeaderString = Papa.unparse([], { header: true, fields: MEDICINE_DATA_CSV_HEADERS });
      fs.writeFileSync(MEDICINE_DATA_CSV_FILE_PATH, csvHeaderString, 'utf-8');
      console.log(`DATA: Created an empty medicine_name.csv with headers at ${MEDICINE_DATA_CSV_FILE_PATH}`);
    } catch (creationError) {
        console.error(`DATA: CRITICAL - Failed to create an empty medicine_name.csv: ${creationError instanceof Error ? creationError.message : String(creationError)}`);
    }
    return [];
  }

  try {
    const csvFileContent = fs.readFileSync(MEDICINE_DATA_CSV_FILE_PATH, 'utf-8');
    const parsed = Papa.parse<Record<string, string>>(csvFileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as false, handle type conversion explicitly
      transformHeader: header => header.trim(), // Trim headers
    });

    const actualHeaders = parsed.meta.fields;
    if (!actualHeaders) {
      console.error(`Error: DATA: CSV file at ${MEDICINE_DATA_CSV_FILE_PATH} appears to be empty or has no headers. Inventory will be empty.`);
      return [];
    }

    // Check for exact headers
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
      const rawPotencyFromCSV = row[MEDICINE_DATA_CSV_HEADERS[1]]?.trim(); // This is the "Potecy/Power" column
      const boxNumber = row[MEDICINE_DATA_CSV_HEADERS[2]]?.trim();
      const totalNumberOfMedicineStr = row[MEDICINE_DATA_CSV_HEADERS[3]]?.trim();

      // Basic validation
      if (!medicineName) {
        console.warn(`DATA: SKIPPING row ${index + 2} in medicine_name.csv due to missing '${MEDICINE_DATA_CSV_HEADERS[0]}'. Row data: ${JSON.stringify(row)}`);
        return null;
      }
      if (!rawPotencyFromCSV) { // Potency/Power field from CSV
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
      
      // Use the rawPotencyFromCSV directly for matching against POTENCIES
      // If it's not in POTENCIES, it might be an error or need mapping, but for now, direct use.
      let extractedPotency: string | undefined = POTENCIES.find(p => p.toLowerCase() === rawPotencyFromCSV.toLowerCase());

      if (!extractedPotency) {
          // Try to find a match if rawPotency includes a canonical potency, e.g. "200C" -> "200"
          for (const canonicalP of POTENCIES) {
              if (rawPotencyFromCSV.toUpperCase().includes(canonicalP.toUpperCase())) {
                  extractedPotency = canonicalP;
                  break;
              }
          }
      }
      
      if (!extractedPotency) {
        // If still not found, it might be a custom potency. We'll store it as is from the CSV.
        // This means POTENCIES array might need to be updated or accept custom values if strict enum adherence is desired.
        // For now, we allow it to pass through to support CSV data as-is.
        console.warn(`DATA: Potency '${rawPotencyFromCSV}' for medicine '${medicineName}' in medicine_name.csv row ${index + 2} is not in the predefined POTENCIES list [${POTENCIES.join(', ')}]. Using the value from CSV directly. Consider updating POTENCIES in types/index.ts if this is a valid, recurring potency.`);
        extractedPotency = rawPotencyFromCSV; // Store the raw value if not found in POTENCIES
      }


      const safeMedicineName = medicineName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safePotency = extractedPotency.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safeBoxNumber = boxNumber.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const generatedId = `${safeMedicineName}-${safePotency}-${safeBoxNumber}-row${index + 2}`;
      
      const newMedicineEntry: Medicine = {
        id: generatedId,
        name: medicineName,
        potency: extractedPotency, // This will be the value from POTENCIES or the raw CSV value
        preparation: 'Liquid' as Preparation, // Default preparation
        location: boxNumber,
        quantity: quantity,
        supplier: undefined, // Default supplier
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
    console.log("DATA: ensureMedicinesLoaded - reloading from CSV.");
    medicinesStore = loadMedicinesFromCSVInternal();
    // Sort medicines alphabetically by name
    medicinesStore.sort((a, b) => a.name.localeCompare(b.name));
    console.log(`DATA: ensureMedicinesLoaded - ${medicinesStore.length} medicines loaded and sorted.`);
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
  return medicineById;
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  let currentMedicines = await ensureMedicinesLoaded(); 
  const newMedicine: Medicine = { ...medicineData, id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  currentMedicines.push(newMedicine); 
  // The list will be re-sorted and persisted by persistMedicinesToCSV
  console.log(`DATA: Added medicine '${newMedicine.name}'. Persisting ${currentMedicines.length} medicines...`);
  await persistMedicinesToCSV(currentMedicines); 
  medicinesStore = [...currentMedicines].sort((a, b) => a.name.localeCompare(b.name)); // Update in-memory store and sort it
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
  currentMedicines[index] = { ...currentMedicines[index], ...updates, id: currentMedicines[index].id };
  console.log(`DATA: Updated ID '${id}' (${currentMedicines[index].name}). Qty: ${oldQuantity} -> ${currentMedicines[index].quantity}. Persisting ${currentMedicines.length} medicines...`);
  await persistMedicinesToCSV(currentMedicines); // Persist will also sort
  medicinesStore = [...currentMedicines].sort((a, b) => a.name.localeCompare(b.name)); // Update in-memory store and sort
  return JSON.parse(JSON.stringify(currentMedicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  let currentMedicines = await ensureMedicinesLoaded();
  const initialLength = currentMedicines.length;
  const updatedMedicines = currentMedicines.filter(m => m.id !== id);
  if (updatedMedicines.length < initialLength) {
    console.log(`DATA: Deleted ID '${id}'. Persisting ${updatedMedicines.length} medicines...`);
    await persistMedicinesToCSV(updatedMedicines); // Persist will also sort
    medicinesStore = [...updatedMedicines].sort((a, b) => a.name.localeCompare(b.name)); // Update in-memory store and sort
    return true;
  }
  console.warn(`DATA: Delete failed. ID '${id}' not found.`);
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  console.log(`DATA: Search called. Name: "${nameQuery}", Potency: "${potencyQuery}"`);
  // ensureMedicinesLoaded already sorts the medicines
  const currentMedicines = await ensureMedicinesLoaded(); 
  
  let results = [...currentMedicines]; 

  const isNameQueryEmpty = !nameQuery || nameQuery.trim() === "";
  const isPotencyQueryNonSpecific = !potencyQuery || potencyQuery.trim().toLowerCase() === 'any' || potencyQuery.trim() === "";

  // If both search criteria are effectively empty, return an empty array as per current spec for search results
  // Or, if you want to return all (sorted) medicines, you'd change this logic.
  // Current expectation from SearchMedicineClient seems to be empty if query is empty.
  if (isNameQueryEmpty && isPotencyQueryNonSpecific) {
    console.log("DATA: Search is effectively empty. Returning empty results based on client expectation.");
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
    results = results.filter(m => {
        // Ensure m.potency exists and is a string before calling toLowerCase
        return m.potency && typeof m.potency === 'string' && m.potency.toLowerCase() === lowerPotencyQuery;
    });
  }
  // The results are already sorted because currentMedicines was sorted, and filter preserves order.
  console.log(`DATA: Search found ${results.length} medicines.`);
  return results; 
}

export async function getUniqueMedicineNames(): Promise<string[]> {
  const currentMedicines = await ensureMedicinesLoaded(); // This ensures medicines are loaded and sorted
  const uniqueNames = new Set<string>();
  currentMedicines.forEach(med => uniqueNames.add(med.name));
  // The sorting is already handled by ensureMedicinesLoaded for the base list, 
  // but if we just want sorted unique names, sorting here from the Set is correct.
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
