
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
  try {
    const csvDataRows = medicinesToPersist.map(med => ({
      [CSV_HEADERS[0]]: med.name,
      [CSV_HEADERS[1]]: med.potency,
      [CSV_HEADERS[2]]: med.location, // location now stores the box number
      [CSV_HEADERS[3]]: med.quantity,
    }));

    const csvString = Papa.unparse(csvDataRows, {
      header: true,
      fields: CSV_HEADERS, // Ensure correct header order and names
    });

    fs.writeFileSync(CSV_FILE_PATH, csvString, 'utf-8');
    console.log(`DATA: Successfully persisted medicines to CSV: ${CSV_FILE_PATH}`);
  } catch (error) {
    console.error('DATA: CRITICAL failure while writing medicines to CSV:', error instanceof Error ? error.message : String(error));
    // Depending on the desired behavior, you might want to throw the error
    // or handle it in a way that informs the user or system administrator.
  }
}


function loadMedicinesFromCSV(): Medicine[] {
  console.log(`DATA: Attempting to load medicines from CSV: ${CSV_FILE_PATH}`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.error(`DATA: ERROR - CSV file not found at ${CSV_FILE_PATH}.`);
    console.error(`Please create this file with the header (ensure no leading/trailing spaces per field):`);
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

    if (parsed.errors.length > 0) {
      console.error('DATA: Error parsing CSV:', parsed.errors.map(e => `Row ${e.row}: ${e.message} (${e.code})`).join('\n'));
      console.warn(`DATA: There were errors parsing ${CSV_FILE_PATH}. Inventory might be incomplete. Please check the file format and content.`);
    }
    
    const actualHeaders = parsed.meta.fields;
    console.log("DATA: Actual CSV Headers found:", actualHeaders);

    if (!actualHeaders || !CSV_HEADERS.every(h => actualHeaders.includes(h))) {
        console.error(`Error: DATA: CSV file at ${CSV_FILE_PATH} is missing one or more required headers or has unexpected headers.\nRequired: [${CSV_HEADERS.join(', ')}]. \nFound: [${actualHeaders?.join(', ')}]. \nPlease ensure your CSV headers match exactly. Inventory will be empty.`);
        return [];
    }
    
    const fileContentLines = fs.readFileSync(CSV_FILE_PATH, 'utf-8').trim().split('\n');
    if (parsed.data.length === 0 && fileContentLines.length <= 1 && fileContentLines[0].trim().toLowerCase() === CSV_HEADERS.join(',').toLowerCase()) {
      console.info(`DATA: The CSV file at ${CSV_FILE_PATH} contains only the header row. Inventory will be empty. Populate the CSV with your medicine data.`);
      return [];
    }
    if (parsed.data.length === 0 && fileContentLines.length > 1) {
        console.warn(`DATA: CSV file at ${CSV_FILE_PATH} has ${fileContentLines.length} lines but PapaParse found 0 data rows. This could indicate formatting issues (e.g. inconsistent delimiters, problematic quotes) or all data rows were invalid.`);
    }
    
    console.log(`DATA: Found ${parsed.data.length} data rows in CSV (excluding header). Processing each row...`);

    const loadedMedicines = parsed.data.map((row, index) => {
      console.log(`\nDATA: Processing CSV row ${index + 2}: Original data =`, JSON.stringify(row));

      const medicineName = row[CSV_HEADERS[0]]?.trim();
      const rawPotencyFromCSV = row[CSV_HEADERS[1]]?.trim();
      const boxNumber = row[CSV_HEADERS[2]]?.trim(); // This is the location
      const totalNumberOfMedicineStr = row[CSV_HEADERS[3]]?.trim();

      if (!medicineName) {
        console.warn(`DATA: SKIPPING row ${index + 2} in CSV due to missing '${CSV_HEADERS[0]}'.`);
        return null;
      }
      if (!rawPotencyFromCSV) {
        console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' due to missing '${CSV_HEADERS[1]}'.`);
        return null;
      }
      if (!boxNumber) {
         console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}) due to missing '${CSV_HEADERS[2]}'.`);
        return null;
      }
       if (!totalNumberOfMedicineStr) {
        console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}, Box: ${boxNumber}) due to missing '${CSV_HEADERS[3]}'.`);
        return null;
      }

      const quantity = parseInt(totalNumberOfMedicineStr, 10);
      if (isNaN(quantity)) {
         console.warn(`DATA: Invalid quantity '${totalNumberOfMedicineStr}' for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}) in CSV row ${index + 2}. Defaulting to 0 for this entry, this row might be problematic.`);
      }
      
      let extractedPotency: string | undefined = undefined;
      if (rawPotencyFromCSV) {
        const rawPotencyLower = rawPotencyFromCSV.toLowerCase();
        for (const canonicalP of POTENCIES) { 
          const canonicalPLower = canonicalP.toLowerCase();
          // More robust pattern matching for various potency formats (e.g., "30", "30c", "30C", "30CH")
          const pattern = new RegExp(`^${canonicalPLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/(\d+)/, '$1(?:c|x|ch|ck|m|k)?')}$`, 'i');
          const simpleInclusionPattern = new RegExp(`\\b${canonicalPLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          
          // Try to match the whole string first, then parts of it for specific suffixes like "C", "X", "M"
          if (rawPotencyLower === canonicalPLower || // "30" matches "30"
              rawPotencyLower === `${canonicalPLower}c` || // "30c" matches "30"
              rawPotencyLower === `${canonicalPLower}x` || // "30x" matches "30"
              rawPotencyLower === `${canonicalPLower}ch`|| // "30ch" matches "30"
              rawPotencyLower === `${canonicalPLower}m` || // "1m" matches "1M" (if 1M is canonical)
              POTENCIES.some(p => rawPotencyLower === p.toLowerCase()) // "200" from CSV matches "200" in POTENCIES
             ) {
            extractedPotency = POTENCIES.find(p => 
                rawPotencyLower === p.toLowerCase() ||
                rawPotencyLower === `${p.toLowerCase()}c` ||
                rawPotencyLower === `${p.toLowerCase()}x` ||
                rawPotencyLower === `${p.toLowerCase()}ch` ||
                rawPotencyLower === `${p.toLowerCase()}m`
            ) || canonicalP; // Fallback to canonicalP if specific match isn't perfect but initial was good
            console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' for '${medicineName}' (exact or suffixed match).`);
            break;
          } else if (simpleInclusionPattern.test(rawPotencyFromCSV)) {
            // If it's just an inclusion like "power 200" contains "200"
             extractedPotency = canonicalP;
             console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' for '${medicineName}' (inclusion match).`);
             break;
          }
        }
      }

      if (!extractedPotency) {
        const firstWord = rawPotencyFromCSV.split(" ")[0];
        if (POTENCIES.map(p => p.toLowerCase()).includes(firstWord.toLowerCase())) {
            extractedPotency = POTENCIES.find(p => p.toLowerCase() === firstWord.toLowerCase());
            console.log(`DATA: Fallback Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' for '${medicineName}' using first word.`);
        }
      }

      if (!extractedPotency) {
        console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' due to unparsable or unmapped potency: '${rawPotencyFromCSV}'. It does not map to any of [${POTENCIES.join(', ')}]. Please check CSV data or POTENCIES in src/types/index.ts.`);
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
        preparation: 'Liquid' as Preparation, // Defaulting to liquid as requested
        location: boxNumber, // Location is the Box Number
        quantity: isNaN(quantity) ? 0 : quantity,
        supplier: undefined,
      };
      console.log(`DATA: Successfully PARSED medicine for row ${index + 2}: Name='${newMedicineEntry.name}', CanonicalPotency='${newMedicineEntry.potency}', Qty=${newMedicineEntry.quantity}, Location/Box='${newMedicineEntry.location}', ID='${newMedicineEntry.id}'`);
      return newMedicineEntry;
    }).filter(Boolean) as Medicine[];
    
    console.log(`\nDATA: Successfully loaded and processed ${loadedMedicines.length} medicines from CSV.`);
    if (loadedMedicines.length === 0 && parsed.data.length > 0) {
        console.warn("DATA: WARNING - Although CSV rows were found, no medicines were successfully loaded. Check skip messages above for reasons (e.g., potency mapping issues, missing required fields).");
    }
    return loadedMedicines;

  } catch (error) {
    console.error('DATA: CRITICAL failure while loading medicines from CSV:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

let medicines: Medicine[] = loadMedicinesFromCSV();

export function reloadMedicines() {
  console.log("DATA: Reloading medicines from CSV...");
  medicines = loadMedicinesFromCSV();
  console.log(`DATA: Medicines reloaded. Current count in memory: ${medicines.length}`);
}


export async function getMedicines(): Promise<Medicine[]> {
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("DATA: getMedicines() found empty inventory, attempting to reload from CSV.");
     reloadMedicines();
  }
  return JSON.parse(JSON.stringify(medicines)); 
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("DATA: getMedicineById() found empty inventory, attempting to reload from CSV.");
     reloadMedicines();
  }
  const medicine = medicines.find(m => m.id === id);
  return medicine ? JSON.parse(JSON.stringify(medicine)) : undefined; 
}

export async function addMedicine(medicineData: Omit<Medicine, 'id'>): Promise<Medicine> {
  const newMedicine: Medicine = { ...medicineData, id: String(Date.now() + Math.random()) }; 
  medicines.push(newMedicine); 
  console.log(`DATA: Added medicine '${newMedicine.name}' to IN-MEMORY inventory (NOT saved to CSV yet). Current count: ${medicines.length}`);
  // Persist changes to CSV after adding
  await persistMedicinesToCSV(medicines);
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  const index = medicines.findIndex(m => m.id === id);
  if (index === -1) {
    console.warn(`DATA: Update failed. Medicine with ID '${id}' not found in IN-MEMORY inventory.`);
    return null;
  }
  medicines[index] = { ...medicines[index], ...updates }; 
  console.log(`DATA: Updated medicine ID '${id}' in IN-MEMORY inventory.`);
  // Persist changes to CSV after updating
  await persistMedicinesToCSV(medicines);
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id); 
  if (medicines.length < initialLength) {
    console.log(`DATA: Deleted medicine ID '${id}' from IN-MEMORY inventory.`);
    // Persist changes to CSV after deleting
    await persistMedicinesToCSV(medicines);
    return true;
  }
  console.warn(`DATA: Delete failed. Medicine with ID '${id}' not found for deletion in IN-MEMORY inventory.`);
  return false;
}

export async function searchMedicinesByNameAndPotency(nameQuery?: string, potencyQuery?: string): Promise<Medicine[]> {
  console.log(`DATA: Initiating search. Name Query: "${nameQuery}", Potency Query: "${potencyQuery}"`);
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("DATA: searchMedicinesByNameAndPotency() found empty inventory, attempting to reload from CSV.");
     reloadMedicines();
  }
  
  let results = [...medicines]; 
  
  if (nameQuery) {
    const lowerNameQuery = nameQuery.toLowerCase().trim();
    if (lowerNameQuery) { 
        results = results.filter(m =>
          m.name.toLowerCase().includes(lowerNameQuery)
          // Alternate names removed, so only search by name
        );
        console.log(`DATA: After filtering by name ("${nameQuery}"), ${results.length} medicines remaining.`);
    }
  }

  if (potencyQuery && potencyQuery !== 'Any') { 
    const lowerPotencyQuery = potencyQuery.toLowerCase().trim();
    results = results.filter(m => m.potency.toLowerCase() === lowerPotencyQuery);
    console.log(`DATA: After filtering by potency ("${potencyQuery}"), ${results.length} medicines remaining.`);
  } else if (potencyQuery === 'Any') {
    console.log(`DATA: Potency query is "Any", so no potency filter applied.`);
  }
  
  console.log(`DATA: Search found ${results.length} medicines matching criteria.`);
  return JSON.parse(JSON.stringify(results)); 
}

export async function getUniqueMedicineNames(): Promise<string[]> {
  if (medicines.length === 0 && fs.existsSync(CSV_FILE_PATH)) {
     console.log("DATA: getUniqueMedicineNames() found empty inventory, attempting to reload from CSV.");
     reloadMedicines();
  }
  const uniqueNames = new Set<string>();
  medicines.forEach(med => uniqueNames.add(med.name));
  const sortedNames = Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  console.log(`DATA: Found ${sortedNames.length} unique medicine names for autocomplete.`);
  return sortedNames;
}
