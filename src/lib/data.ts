
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { Medicine, Preparation } from '@/types';
import { POTENCIES } from '@/types';

const CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_name.csv');
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
    // console.log("DATA: Actual CSV Headers found:", actualHeaders); // Kept for debugging if needed

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
      const rawPotencyFromCSV = row[CSV_HEADERS[1]]?.trim(); // Uses 'Potecy/Power' from your CSV
      const boxNumber = row[CSV_HEADERS[2]]?.trim();
      const totalNumberOfMedicineStr = row[CSV_HEADERS[3]]?.trim();
      // console.log(`DATA: Processing CSV row ${index + 2}: Original data = ${JSON.stringify(row)}, RawPotency = "${rawPotencyFromCSV}"`);


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
        // Enhanced pattern: look for the canonical potency as a whole word/number, potentially followed by c, ch, ck, x, m, k or common words like potency, power.
        // Example: "200", "200c", "power 200", "1m", "10M CH"
        // This pattern tries to capture common homeopathic potency notations.
        const pattern = new RegExp(`(?:^|\\s|[a-zA-Z])${canonicalPLower.replace(/([+.*?()])/g, '\\$1')}(?:c|ch|ck|x|m|k|potency|power|\\s|$)?`, 'i');
        const loosePattern = new RegExp(`\\b${canonicalPLower.replace(/([+.*?()])/g, '\\$1')}\\b`, 'i'); // For cases like "200" in "Strength 200"

        if (pattern.test(rawPotencyLower) || loosePattern.test(rawPotencyLower) || rawPotencyLower.includes(canonicalPLower)) {
           // Prioritize exact canonical match if found within the string
            if (POTENCIES.map(p => p.toLowerCase()).includes(rawPotencyLower)) {
                 extractedPotency = POTENCIES.find(p => p.toLowerCase() === rawPotencyLower);
            } else {
                extractedPotency = canonicalP; // Map to the canonical potency
            }
            if (extractedPotency) {
                // console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' using pattern for ${canonicalP}`);
                break;
            }
        }
      }

      if (!extractedPotency) {
        // Fallback: if raw potency itself is a defined canonical potency (e.g. "200", "1M")
        const directMatch = POTENCIES.find(p => p.toLowerCase() === rawPotencyLower);
        if (directMatch) {
          extractedPotency = directMatch;
          // console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' by direct match.`);
        }
      }


      if (!extractedPotency) {
        console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' due to unparsable or unmapped potency: '${rawPotencyFromCSV}'. It does not map to any of [${POTENCIES.join(', ')}] using enhanced logic. Row data: ${JSON.stringify(row)}`);
        return null;
      }

      const safeMedicineName = medicineName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safePotency = extractedPotency.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const safeBoxNumber = boxNumber.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      // Ensure ID uniqueness includes row index if other fields are identical.
      const generatedId = `${safeMedicineName}-${safePotency}-${safeBoxNumber}-row${index + 2}`;


      const newMedicineEntry: Medicine = {
        id: generatedId,
        name: medicineName,
        potency: extractedPotency,
        preparation: 'Liquid' as Preparation, // Defaulting to Liquid based on earlier request
        location: boxNumber,
        quantity: quantity,
        supplier: undefined,
      };
      // console.log(`DATA: Successfully parsed medicine for row ${index + 2}: ${JSON.stringify(newMedicineEntry)}`);
      return newMedicineEntry;
    }).filter(Boolean) as Medicine[];

    console.log(`DATA: Successfully loaded and processed ${loadedMedicines.length} medicines from CSV.`);
    if (loadedMedicines.length === 0 && parsed.data.length > 0) {
      console.warn("DATA: WARNING - Although CSV rows were found, no medicines were successfully loaded. Check skip messages above for reasons.");
    }
    return loadedMedicines;

  } catch (error) {
    console.error('DATA: CRITICAL failure while loading medicines from CSV:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// This is the in-memory store, primarily used for operations between full CSV reads/writes.
// loadMedicinesFromCSV() is called at module startup.
// For operations like getMedicines or search, we might reload from CSV to ensure consistency.
let medicines: Medicine[] = loadMedicinesFromCSV();

export async function getMedicines(): Promise<Medicine[]> {
  console.log("DATA: getMedicines called. Forcing reload from CSV for consistency on inventory page.");
  const currentMedicinesFromCSV = loadMedicinesFromCSV(); // Load fresh data
  medicines = [...currentMedicinesFromCSV]; // Update in-memory cache as well
  return JSON.parse(JSON.stringify(currentMedicinesFromCSV)); // Return a deep copy
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  // For consistency, ensure 'medicines' in-memory array is fresh before searching by ID.
  // This might be slightly less performant but safer for consistency.
  // Alternatively, if performance is critical, this could read from the current 'medicines' array
  // with the understanding it might not be 100% in sync if CSV was modified externally.
  const currentData = loadMedicinesFromCSV();
  const medicineById = currentData.find(m => m.id === id);
  return medicineById ? JSON.parse(JSON.stringify(medicineById)) : undefined;
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  // Reload before add to prevent ID collision if CSV was manually edited
  // or to ensure we're adding to the most current list.
  medicines = loadMedicinesFromCSV();
  const newMedicine: Medicine = { ...medicineData, id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  medicines.push(newMedicine);
  console.log(`DATA: Added medicine '${newMedicine.name}' to IN-MEMORY inventory. Current count: ${medicines.length}. Persisting...`);
  await persistMedicinesToCSV(medicines);
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  // Reload from CSV before update to ensure we are updating the correct item based on its latest state
  // and to avoid overwriting other changes if the in-memory list was stale.
  medicines = loadMedicinesFromCSV();
  const index = medicines.findIndex(m => m.id === id);
  if (index === -1) {
    console.warn(`DATA: Update failed. Medicine with ID '${id}' not found in CSV-loaded inventory.`);
    return null;
  }
  const oldQuantity = medicines[index].quantity;
  medicines[index] = { ...medicines[index], ...updates, id: medicines[index].id }; // Ensure ID is preserved
  console.log(`DATA: IN-MEMORY update for ID '${id}' (${medicines[index].name}). Quantity changed from ${oldQuantity} to ${medicines[index].quantity}. Persisting to CSV...`);
  await persistMedicinesToCSV(medicines);
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  medicines = loadMedicinesFromCSV(); // Load fresh before delete
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id);
  if (medicines.length < initialLength) {
    console.log(`DATA: Deleted medicine ID '${id}' from IN-MEMORY inventory. Persisting...`);
    await persistMedicinesToCSV(medicines);
    return true;
  }
  console.warn(`DATA: Delete failed. Medicine with ID '${id}' not found for deletion in CSV-loaded inventory.`);
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  console.log(`DATA: Search initiated. Forcing reload from CSV for search consistency. Name: "${nameQuery}", Potency: "${potencyQuery}"`);
  const currentMedicinesFromCSV = loadMedicinesFromCSV(); // Always load fresh for search

  if (nameQuery && currentMedicinesFromCSV && currentMedicinesFromCSV.length > 0) {
    const specificMed = currentMedicinesFromCSV.find(m => m.name.toLowerCase().includes(nameQuery.toLowerCase()));
    if (specificMed) {
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
  const currentMedicinesFromCSV = loadMedicinesFromCSV(); // Load fresh for unique names
  const uniqueNames = new Set<string>();
  currentMedicinesFromCSV.forEach(med => uniqueNames.add(med.name));
  const sortedNames = Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  console.log(`DATA: Found ${sortedNames.length} unique medicine names for autocomplete (from CSV).`);
  return sortedNames;
}
