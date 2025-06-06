
'use server';

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { Medicine, Preparation, MedicineIndication } from '@/types'; // Added MedicineIndication
import { POTENCIES } from '@/types';

const MEDICINE_DATA_CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_name.csv');
const MEDICINE_DATA_CSV_HEADERS = ['Medicine Name', 'Potecy/Power', 'Box Number', 'Total Number Of Medicine'];

const INDICATIONS_CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_indications.csv');
const INDICATIONS_CSV_HEADERS = ['Medicine Name', 'Indications'];

// Module-level in-memory stores and loaded flags
let medicinesStore: Medicine[] = [];
let indicationsStore: MedicineIndication[] = []; // Changed name for clarity
let medicinesDataLoaded = false;
let indicationsDataLoaded = false;


async function persistMedicinesToCSV(medicinesToPersist: Medicine[]): Promise<void> {
  console.log(`DATA: Attempting to persist ${medicinesToPersist.length} medicines to CSV: ${MEDICINE_DATA_CSV_FILE_PATH}`);
  try {
    const sortedMedicinesToPersist = [...medicinesToPersist].sort((a, b) => a.name.localeCompare(b.name));

    const csvDataRows = sortedMedicinesToPersist.map(med => ({
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

function loadMedicinesFromCSVInternal(): Medicine[] {
  console.log(`DATA: loadMedicinesFromCSVInternal called. Attempting to load medicines from CSV: ${MEDICINE_DATA_CSV_FILE_PATH}`);

  if (!fs.existsSync(MEDICINE_DATA_CSV_FILE_PATH)) {
    console.error(`DATA: ERROR - CSV file not found at ${MEDICINE_DATA_CSV_FILE_PATH}.`);
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
      dynamicTyping: false,
      transformHeader: header => header.trim(),
    });

    const actualHeaders = parsed.meta.fields;
    if (!actualHeaders || MEDICINE_DATA_CSV_HEADERS.some(expectedHeader => !actualHeaders.includes(expectedHeader))) {
      console.error(`Error: DATA: CSV file at ${MEDICINE_DATA_CSV_FILE_PATH} has incorrect headers or is empty.`);
      return [];
    }
    
    const loadedMedicines = parsed.data.map((row, index) => {
      const medicineName = row[MEDICINE_DATA_CSV_HEADERS[0]]?.trim();
      const rawPotencyFromCSV = row[MEDICINE_DATA_CSV_HEADERS[1]]?.trim();
      const boxNumber = row[MEDICINE_DATA_CSV_HEADERS[2]]?.trim();
      const totalNumberOfMedicineStr = row[MEDICINE_DATA_CSV_HEADERS[3]]?.trim();

      if (!medicineName || !rawPotencyFromCSV || !boxNumber || totalNumberOfMedicineStr === undefined || totalNumberOfMedicineStr === '') {
        console.warn(`DATA: SKIPPING row ${index + 2} in medicine_name.csv due to missing required fields. Row data: ${JSON.stringify(row)}`);
        return null;
      }

      const quantity = parseInt(totalNumberOfMedicineStr, 10);
      if (isNaN(quantity)) {
        console.warn(`DATA: Invalid quantity '${totalNumberOfMedicineStr}' for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}) in medicine_name.csv row ${index + 2}. SKIPPING. Row: ${JSON.stringify(row)}`);
        return null;
      }
      
      let extractedPotency: string | undefined = POTENCIES.find(p => p.toLowerCase() === rawPotencyFromCSV.toLowerCase());
      if (!extractedPotency) {
          for (const canonicalP of POTENCIES) {
              if (rawPotencyFromCSV.toUpperCase().includes(canonicalP.toUpperCase())) {
                  extractedPotency = canonicalP;
                  break;
              }
          }
      }
      if (!extractedPotency) {
        console.warn(`DATA: Potency '${rawPotencyFromCSV}' for '${medicineName}' (row ${index+2}) not in POTENCIES list. Using raw value. Consider updating types/index.ts.`);
        extractedPotency = rawPotencyFromCSV;
      }

      const safeMedicineName = medicineName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safePotency = extractedPotency.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safeBoxNumber = boxNumber.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const generatedId = `${safeMedicineName}-${safePotency}-${safeBoxNumber}-row${index + 2}`;
      
      return {
        id: generatedId,
        name: medicineName,
        potency: extractedPotency,
        preparation: 'Liquid' as Preparation,
        location: boxNumber,
        quantity: quantity,
        supplier: undefined,
      };
    }).filter(Boolean) as Medicine[];

    console.log(`DATA: Successfully loaded and processed ${loadedMedicines.length} medicines from medicine_name.csv.`);
    return loadedMedicines;
  } catch (error) {
    console.error('DATA: CRITICAL failure while loading medicines from medicine_name.csv:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

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
    if (!actualHeaders || INDICATIONS_CSV_HEADERS.some(expectedHeader => !actualHeaders.includes(expectedHeader))) {
     console.warn(`DATA_INDICATIONS: Indications CSV file at ${INDICATIONS_CSV_FILE_PATH} has incorrect or missing headers. Indications feature will be unavailable.`);
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

async function ensureMedicinesLoaded(): Promise<Medicine[]> {
  if (!medicinesDataLoaded) {
    console.log("DATA: ensureMedicinesLoaded - medicines not loaded, loading now from CSV.");
    const loaded = loadMedicinesFromCSVInternal();
    medicinesStore = [...loaded].sort((a, b) => a.name.localeCompare(b.name));
    medicinesDataLoaded = true;
    console.log(`DATA: ensureMedicinesLoaded - ${medicinesStore.length} medicines loaded into cache and sorted.`);
  }
  return JSON.parse(JSON.stringify(medicinesStore)); // Return a deep copy
}

async function ensureIndicationsLoaded(): Promise<MedicineIndication[]> {
  if (!indicationsDataLoaded) {
    console.log("DATA_INDICATIONS: ensureIndicationsLoaded - indications not loaded, loading now from CSV.");
    indicationsStore = loadIndicationsFromCSVInternal();
    indicationsDataLoaded = true;
    console.log(`DATA_INDICATIONS: ensureIndicationsLoaded - ${indicationsStore.length} indications loaded into cache.`);
  }
  return JSON.parse(JSON.stringify(indicationsStore)); // Return a deep copy
}

export async function getMedicines(): Promise<Medicine[]> {
  console.log("DATA: getMedicines called.");
  return ensureMedicinesLoaded();
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  const currentMedicines = await ensureMedicinesLoaded();
  return currentMedicines.find(m => m.id === id);
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  await ensureMedicinesLoaded(); // Ensure cache is populated
  const newMedicine: Medicine = { ...medicineData, id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  
  const updatedStore = [...medicinesStore, newMedicine].sort((a, b) => a.name.localeCompare(b.name));
  
  console.log(`DATA: Added medicine '${newMedicine.name}'. Persisting ${updatedStore.length} medicines...`);
  await persistMedicinesToCSV(updatedStore); 
  medicinesStore = updatedStore; // Update module-level cache
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  await ensureMedicinesLoaded();
  const index = medicinesStore.findIndex(m => m.id === id);
  if (index === -1) {
    console.warn(`DATA: Update failed. Medicine with ID '${id}' not found in cache.`);
    return null;
  }
  
  const updatedMedicinesList = [...medicinesStore];
  updatedMedicinesList[index] = { ...updatedMedicinesList[index], ...updates, id: updatedMedicinesList[index].id };
  const sortedUpdatedList = updatedMedicinesList.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`DATA: Updated ID '${id}'. Persisting ${sortedUpdatedList.length} medicines...`);
  await persistMedicinesToCSV(sortedUpdatedList);
  medicinesStore = sortedUpdatedList; // Update module-level cache
  return JSON.parse(JSON.stringify(medicinesStore.find(m => m.id === id) || null)); // Read updated from new cache
}

export async function deleteMedicine(id: string): Promise<boolean> {
  await ensureMedicinesLoaded();
  const initialLength = medicinesStore.length;
  const filteredMedicines = medicinesStore.filter(m => m.id !== id);
  
  if (filteredMedicines.length < initialLength) {
    const sortedFilteredMedicines = filteredMedicines.sort((a, b) => a.name.localeCompare(b.name));
    console.log(`DATA: Deleted ID '${id}'. Persisting ${sortedFilteredMedicines.length} medicines...`);
    await persistMedicinesToCSV(sortedFilteredMedicines);
    medicinesStore = sortedFilteredMedicines; // Update module-level cache
    return true;
  }
  console.warn(`DATA: Delete failed. ID '${id}' not found in cache.`);
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  console.log(`DATA: Search called. Name: "${nameQuery}", Potency: "${potencyQuery}"`);
  const currentMedicines = await ensureMedicinesLoaded(); // Ensures sorted list from cache
  
  let results = [...currentMedicines]; 

  const isNameQueryEmpty = !nameQuery || nameQuery.trim() === "";
  const isPotencyQueryNonSpecific = !potencyQuery || potencyQuery.trim().toLowerCase() === 'any' || potencyQuery.trim() === "";

  if (isNameQueryEmpty && isPotencyQueryNonSpecific) {
    console.log("DATA: Search is effectively empty. Returning empty results based on client expectation.");
    return []; 
  }
  
  if (!isNameQueryEmpty) {
    const lowerNameQuery = nameQuery!.toLowerCase().trim();
    results = results.filter(m =>
      m.name.toLowerCase().includes(lowerNameQuery)
    );
  }

  if (!isPotencyQueryNonSpecific) {
    const lowerPotencyQuery = potencyQuery!.toLowerCase().trim();
    results = results.filter(m => 
        m.potency && typeof m.potency === 'string' && m.potency.toLowerCase() === lowerPotencyQuery
    );
  }
  console.log(`DATA: Search found ${results.length} medicines (order maintained from sorted cache).`);
  return results; 
}

export async function getUniqueMedicineNames(): Promise<string[]> {
  const currentMedicines = await ensureMedicinesLoaded(); // Ensures sorted list from cache
  const uniqueNames = new Set<string>();
  currentMedicines.forEach(med => uniqueNames.add(med.name));
  const sortedNames = Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  console.log(`DATA: Found ${sortedNames.length} unique medicine names for autocomplete (from cached data).`);
  return sortedNames;
}

export async function getIndicationsByMedicineName(medicineName: string): Promise<string | undefined> {
  const currentIndications = await ensureIndicationsLoaded(); // Ensures indications are from cache
  
  console.log(`DATA_INDICATIONS: getIndicationsByMedicineName called for: "${medicineName}" (from cached data)`);
  
  const foundIndication = currentIndications.find(
    (ind) => ind.name.toLowerCase() === medicineName.toLowerCase()
  );

  if (foundIndication) {
    console.log(`DATA_INDICATIONS: Found indications for "${medicineName}".`);
    return foundIndication.indications;
  } else {
    console.log(`DATA_INDICATIONS: No indications found for "${medicineName}" in cached list.`);
    return undefined;
  }
}

    