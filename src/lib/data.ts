
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { Medicine, Preparation } from '@/types';
import { POTENCIES } from '@/types'; // Import POTENCIES for validation/defaults

// Define the path to your CSV file
const CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'medicine_name.csv');

function loadMedicinesFromCSV(): Medicine[] {
  console.log(`DATA: Attempting to load medicines from CSV: ${CSV_FILE_PATH}`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.error(`DATA: ERROR - CSV file not found at ${CSV_FILE_PATH}.`);
    console.error(`Please create this file with the header (ensure no leading/trailing spaces per field):`);
    console.error(`Medicine Name,Potecy/Power,Box Number,Total Number Of Medicine`);
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
    
    const expectedHeaders = ['Medicine Name', 'Potecy/Power', 'Box Number', 'Total Number Of Medicine'];
    const actualHeaders = parsed.meta.fields;
    console.log("DATA: Actual CSV Headers found:", actualHeaders);

    if (!actualHeaders || !expectedHeaders.every(h => actualHeaders.includes(h))) {
        console.error(`Error: DATA: CSV file at ${CSV_FILE_PATH} is missing one or more required headers or has unexpected headers.\nRequired: [${expectedHeaders.join(', ')}]. \nFound: [${actualHeaders?.join(', ')}]. \nPlease ensure your CSV headers match exactly. Inventory will be empty.`);
        return [];
    }
    
    const fileContentLines = fs.readFileSync(CSV_FILE_PATH, 'utf-8').trim().split('\n');
    if (parsed.data.length === 0 && fileContentLines.length <= 1 && fileContentLines[0].trim().toLowerCase() === expectedHeaders.join(',').toLowerCase()) {
      console.info(`DATA: The CSV file at ${CSV_FILE_PATH} contains only the header row. Inventory will be empty. Populate the CSV with your medicine data.`);
      return [];
    }
    if (parsed.data.length === 0 && fileContentLines.length > 1) {
        console.warn(`DATA: CSV file at ${CSV_FILE_PATH} has ${fileContentLines.length} lines but PapaParse found 0 data rows. This could indicate formatting issues (e.g. inconsistent delimiters, problematic quotes) or all data rows were invalid.`);
    }
    
    console.log(`DATA: Found ${parsed.data.length} data rows in CSV (excluding header). Processing each row...`);

    const loadedMedicines = parsed.data.map((row, index) => {
      console.log(`\nDATA: Processing CSV row ${index + 2}: Original data =`, JSON.stringify(row));

      const medicineName = row['Medicine Name']?.trim();
      const rawPotencyFromCSV = row['Potecy/Power']?.trim(); // Use 'Potecy/Power'
      const boxNumber = row['Box Number']?.trim();
      const totalNumberOfMedicineStr = row['Total Number Of Medicine']?.trim();

      if (!medicineName) {
        console.warn(`DATA: SKIPPING row ${index + 2} in CSV due to missing 'Medicine Name'.`);
        return null;
      }
      if (!rawPotencyFromCSV) {
        console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' due to missing 'Potecy/Power'.`);
        return null;
      }
      if (!boxNumber) {
         console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}) due to missing 'Box Number'.`);
        return null;
      }
       if (!totalNumberOfMedicineStr) {
        console.warn(`DATA: SKIPPING row ${index + 2} for medicine '${medicineName}' (Raw Potency: ${rawPotencyFromCSV}, Box: ${boxNumber}) due to missing 'Total Number Of Medicine'.`);
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
          const pattern = new RegExp(`\\b${canonicalPLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:c|x|ch|m|\\s*(?:potency|strength|power))?\\b`, 'i');
          const simpleInclusionPattern = new RegExp(`\\b${canonicalPLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

          if (pattern.test(rawPotencyLower) || simpleInclusionPattern.test(rawPotencyLower)) {
            let bestMatch = canonicalP;
            for (const specificP of POTENCIES) {
                if (rawPotencyLower.includes(specificP.toLowerCase())) {
                    bestMatch = specificP; 
                    if (specificP.toLowerCase() === rawPotencyLower) break; 
                }
            }
            extractedPotency = bestMatch;
            console.log(`DATA: Matched raw potency '${rawPotencyFromCSV}' to CANONICAL '${extractedPotency}' for '${medicineName}' (using pattern or inclusion).`);
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
        preparation: 'Liquid' as Preparation, // Changed default to 'Liquid'
        batchNumber: boxNumber, 
        expirationDate: 'N/A', 
        location: `Box ${boxNumber}`, 
        quantity: isNaN(quantity) ? 0 : quantity,
        supplier: undefined, 
        alternateNames: [], 
      };
      console.log(`DATA: Successfully PARSED medicine for row ${index + 2}: Name='${newMedicineEntry.name}', CanonicalPotency='${newMedicineEntry.potency}', Qty=${newMedicineEntry.quantity}, Batch/Box='${newMedicineEntry.batchNumber}', ID='${newMedicineEntry.id}'`);
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
  console.log(`DATA: Added medicine '${newMedicine.name}' to IN-MEMORY inventory (NOT saved to CSV). Current count: ${medicines.length}`);
  return JSON.parse(JSON.stringify(newMedicine));
}

export async function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id'>>): Promise<Medicine | null> {
  const index = medicines.findIndex(m => m.id === id);
  if (index === -1) {
    console.warn(`DATA: Update failed. Medicine with ID '${id}' not found in IN-MEMORY inventory.`);
    return null;
  }
  medicines[index] = { ...medicines[index], ...updates }; 
  console.log(`DATA: Updated medicine ID '${id}' in IN-MEMORY inventory (NOT saved to CSV).`);
  return JSON.parse(JSON.stringify(medicines[index]));
}

export async function deleteMedicine(id: string): Promise<boolean> {
  const initialLength = medicines.length;
  medicines = medicines.filter(m => m.id !== id); 
  if (medicines.length < initialLength) {
    console.log(`DATA: Deleted medicine ID '${id}' from IN-MEMORY inventory (NOT saved to CSV). Current count: ${medicines.length}`);
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
          m.name.toLowerCase().includes(lowerNameQuery) ||
          (m.alternateNames && m.alternateNames.some(an => an.toLowerCase().includes(lowerNameQuery)))
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
