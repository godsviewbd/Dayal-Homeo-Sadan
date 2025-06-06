
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MedicineCard } from "./MedicineCard";
import { MedicineCardSkeleton } from "./MedicineCardSkeleton";
import type { Medicine } from "@/types";
import { POTENCIES } from "@/types";
import { handleParseHomeopathicQuery, fetchMedicinesForSearch, handleGetUniqueMedicineNames, fetchMedicineIndicationsFromCSVAction } from "@/lib/actions"; 
import { Loader2, SearchIcon, AlertCircle, Info, ChevronDown, HelpCircle } from "lucide-react"; 
import type { ParseHomeopathicQueryOutput } from "@/ai/flows/parse-homeopathic-query";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


interface SearchFormData {
  query: string;
  potency: string;
}

export function SearchMedicineClient() {
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiParsedInfo, setAiParsedInfo] = useState<ParseHomeopathicQueryOutput | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [currentMedicineIndications, setCurrentMedicineIndications] = useState<string | null>(null); 
  const [primarySearchedMedicineName, setPrimarySearchedMedicineName] = useState<string | null>(null); 

  const [allMedicineBaseNames, setAllMedicineBaseNames] = useState<string[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();


  const { control, handleSubmit, watch, setValue, setFocus, formState: {isSubmitting} } = useForm<SearchFormData>({
    defaultValues: {
      query: "",
      potency: "Any",
    },
  });

  const currentQuery = watch("query");

  useEffect(() => {
    const fetchNames = async () => {
      setIsLoadingSuggestions(true);
      try {
        const names = await handleGetUniqueMedicineNames();
        setAllMedicineBaseNames(names);
      } catch (e) {
        console.error("SearchClient: Failed to fetch unique medicine names for autocomplete:", e);
      }
      setIsLoadingSuggestions(false);
    };
    fetchNames();
  }, []);

  useEffect(() => {
    if (currentQuery && currentQuery.length > 0 && allMedicineBaseNames.length > 0 && document.activeElement === document.getElementById('query')) {
      const filtered = allMedicineBaseNames.filter(name =>
        name.toLowerCase().includes(currentQuery.toLowerCase())
      );
      setNameSuggestions(filtered.slice(0, 5));
      setShowNameSuggestions(filtered.length > 0);
    } else {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
    }
  }, [currentQuery, allMedicineBaseNames]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowNameSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [suggestionsRef]);

  const onSubmit = async (data: SearchFormData) => {
    setIsLoading(true);
    setError(null);
    // setAiParsedInfo(null); // Keep AI parsed info if you want to use it, but we removed its display
    setShowNameSuggestions(false);
    setSearchAttempted(true);
    setSearchResults([]);
    setCurrentMedicineIndications(null); 
    setPrimarySearchedMedicineName(null); 

    let searchName = data.query.trim();
    let searchPotency = data.potency;

    if (searchName === "" && (searchPotency === "Any" || searchPotency === "")) {
      setIsLoading(false);
      setSearchResults([]); 
      return;
    }
    
    let nameForIndicationsLookup = searchName; 

    if (searchName !== "") {
        try {
            const aiResult = await handleParseHomeopathicQuery({ query: searchName });
            if ('error' in aiResult) {
                console.warn("SearchClient: AI parsing failed, proceeding with form data. Error:", aiResult.error);
            } else {
                // setAiParsedInfo(aiResult); // Still set it if needed for other logic
                if (aiResult.medicineName && aiResult.medicineName.trim().toLowerCase() !== "any potency") {
                  searchName = aiResult.medicineName.trim();
                  nameForIndicationsLookup = aiResult.medicineName.trim(); 
                }
                if (aiResult.potency && aiResult.potency.toLowerCase() !== "any potency" && data.potency === "Any") {
                   let clientMatchedPotency: string | undefined = undefined;
                   const aiPotencyRaw = aiResult.potency.toLowerCase();
                   for (const canonicalP of POTENCIES) {
                       const canonicalPLower = canonicalP.toLowerCase();
                       const pattern = new RegExp(`\\b${canonicalPLower.replace(/(\\d+)/, '$1(?:c|x)?')}\\b`, 'i');
                       if (pattern.test(aiPotencyRaw)) clientMatchedPotency = canonicalP;
                       if (clientMatchedPotency) break;
                   }
                   if (clientMatchedPotency) {
                     searchPotency = clientMatchedPotency;
                     setValue('potency', clientMatchedPotency);
                   }
                }
            }
        } catch (aiError) {
            console.error("SearchClient: Critical error during AI parsing:", aiError);
        }
    }

    const finalSearchName = searchName === "" ? undefined : searchName;
    const finalSearchPotency = searchPotency === "Any" ? undefined : searchPotency;

    try {
      const medicines = await fetchMedicinesForSearch(finalSearchName, finalSearchPotency);
      setSearchResults(medicines);

      if (medicines.length > 0) {
        if (!nameForIndicationsLookup || nameForIndicationsLookup.toLowerCase() === "any potency") {
            nameForIndicationsLookup = medicines[0].name;
            console.log(`INDICATIONS_CLIENT: Using name from first search result for indications lookup: "${nameForIndicationsLookup}"`);
        } else {
            console.log(`INDICATIONS_CLIENT: Using (AI or user query) name for indications lookup: "${nameForIndicationsLookup}"`);
        }
        setPrimarySearchedMedicineName(nameForIndicationsLookup);

        console.log(`INDICATIONS_CLIENT: About to call fetchMedicineIndicationsFromCSVAction for: "${nameForIndicationsLookup}"`);
        const indicationsResult = await fetchMedicineIndicationsFromCSVAction(nameForIndicationsLookup);
        console.log(`INDICATIONS_CLIENT: Result from fetchMedicineIndicationsFromCSVAction for "${nameForIndicationsLookup}":`, indicationsResult ? `"${indicationsResult.substring(0,50)}..."` : "null/undefined");
        setCurrentMedicineIndications(indicationsResult || null);

      } else {
        console.log("INDICATIONS_CLIENT: No search results, skipping indications fetch.");
        setCurrentMedicineIndications(null); 
      }

    } catch (e) {
      setError("Failed to fetch medicines. Please check your connection or try again later.");
      console.error("SearchClient: fetchMedicinesForSearch error:", e);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSuggestionClick = (suggestion: string) => {
    setValue("query", suggestion);
    setNameSuggestions([]);
    setShowNameSuggestions(false);
    setFocus('query');
  };

  const renderResults = () => {
    if (isLoading || isSubmitting) {
      return (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          <MedicineCardSkeleton />
          <MedicineCardSkeleton />
          <MedicineCardSkeleton />
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-6 rounded-lg bg-red-50 p-5 dark:bg-red-900/20 border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-300 mr-3" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-100">Error</h3>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      );
    }

    if (searchAttempted && searchResults.length === 0) {
      return (
         <div className="mt-6 rounded-lg bg-gray-50 p-5 dark:bg-gray-800 border-l-4 border-teal-500">
          <div className="flex items-center">
            <Info className="h-6 w-6 text-teal-600 dark:text-teal-300 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">No Results Found</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            No matches found. Try a different name or check spelling.
          </p>
        </div>
      );
    }


    if (searchResults.length > 0) {
      return (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Search Results <span className="text-base font-normal text-gray-600 dark:text-gray-400">({searchResults.length} found)</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
            {searchResults.map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
        </div>
      );
    }
    if (!searchAttempted && !isLoading && !isSubmitting) {
        return (
            <div className="mt-6 rounded-lg bg-gray-50 p-5 dark:bg-gray-800 text-center">
                 <SearchIcon className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start typing a medicine name to search your inventory.
                </p>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="px-4 pt-6 pb-24 md:px-8">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl">
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg md:p-8">
          <div className="mb-6 flex items-center">
            <SearchIcon className="mr-3 h-8 w-8 text-teal-500 dark:text-teal-300" />
            <div>
              <h1 className="text-2xl font-semibold leading-snug text-gray-900 dark:text-gray-100">Find Your Homeopathic Medicine</h1>
              <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                Search by name or potency. Our AI assistant is here to help if you need it.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Label htmlFor="query" className="sr-only">Search medicine by name</Label>
              <Controller
                name="query"
                control={control}
                render={({ field }) => (
                  <Input
                    id="query"
                    type="text"
                    placeholder="e.g., Arnica Montana 30C"
                    {...field}
                    className="input-base" 
                    onFocus={() => currentQuery && nameSuggestions.length > 0 && setShowNameSuggestions(true)}
                    autoComplete="off"
                    aria-label="Search medicine by name"
                  />
                )}
              />
              
              {isLoadingSuggestions && (
                <div className="mt-2 space-y-1 h-[48px] flex flex-col justify-around">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-full max-w-xs"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-3/4 max-w-xs"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-1/2 max-w-xs"></div>
                </div>
              )}
              {showNameSuggestions && nameSuggestions.length > 0 && !isLoadingSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 mt-1 w-full rounded-lg border-2 border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-700 max-h-60 overflow-y-auto"
                  role="listbox"
                >
                  {nameSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="cursor-pointer px-4 py-2 text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseDown={(e) => e.preventDefault()} 
                      role="option"
                      aria-selected={false}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <Label htmlFor="potency" className="sr-only">Select potency</Label>
              <Controller
                name="potency"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="potency" className="select-base" aria-label="Select potency">
                      <SelectValue placeholder="Select potency (e.g., 30C, 200)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any Potency</SelectItem>
                      {POTENCIES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className={cn(
                "h-12 w-full rounded-lg font-medium transition-colors duration-150 md:w-1/3 md:mx-auto",
                "bg-teal-500 text-white hover:bg-teal-600",
                "dark:bg-teal-400 dark:text-gray-900 dark:hover:bg-teal-500"
              )}
            >
              {(isLoading || isSubmitting) ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                <>
                  <SearchIcon className="mr-2 h-5 w-5" />
                  Find Medicine
                </>
              )}
            </Button>
          </form>
        </div>

        <div role="region" aria-live="polite" aria-atomic="true">
            {renderResults()}
        </div>

        
        {currentMedicineIndications && searchResults.length > 0 && primarySearchedMedicineName && (
          <div className="mt-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50 shadow-md border-l-4 border-teal-500">
            <div className="flex items-center mb-3">
                <HelpCircle className="h-6 w-6 text-teal-600 dark:text-teal-300 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Common Uses for {primarySearchedMedicineName}:
                </h3>
            </div>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {currentMedicineIndications}
            </p>
          </div>
        )}
        
      </div> 
    </div>
  );
}

