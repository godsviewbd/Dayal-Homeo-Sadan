
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Keep if used, but labels are above inputs now
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
import { handleParseHomeopathicQuery, fetchMedicinesForSearch, handleGetUniqueMedicineNames } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Base card will be styled by globals
import { Loader2, SearchIcon, AlertCircle, Wand2, Barcode, Info, ChevronDown } from "lucide-react";
import type { ParseHomeopathicQueryOutput } from "@/ai/flows/parse-homeopathic-query";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton"; // For autocomplete skeleton

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

  const [allMedicineBaseNames, setAllMedicineBaseNames] = useState<string[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [showBarcodeScannerSheet, setShowBarcodeScannerSheet] = useState(false);


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
    if (currentQuery && currentQuery.length > 0 && allMedicineBaseNames.length > 0) {
      const filtered = allMedicineBaseNames.filter(name =>
        name.toLowerCase().includes(currentQuery.toLowerCase())
      );
      setNameSuggestions(filtered.slice(0, 5)); // Limit suggestions
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
    setAiParsedInfo(null);
    setShowNameSuggestions(false);
    setSearchAttempted(true);
    setSearchResults([]); 

    let searchName = data.query.trim();
    let searchPotency = data.potency;

    if (searchName !== "") {
        try {
            const aiResult = await handleParseHomeopathicQuery({ query: searchName });
            if ('error' in aiResult) {
                console.warn("SearchClient: AI parsing failed, proceeding with form data. Error:", aiResult.error);
            } else {
                setAiParsedInfo(aiResult);
                if (aiResult.medicineName) searchName = aiResult.medicineName.trim();
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
    } catch (e) {
      setError("Failed to fetch medicines. Please check your connection or try again later.");
      console.error("SearchClient: fetchMedicinesForSearch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScan = () => {
    setShowBarcodeScannerSheet(true);
    // Simulate scan result after a delay
    setTimeout(() => {
        setValue("query", "Scanned: Arnica Montana 30C");
        setShowBarcodeScannerSheet(false);
        handleSubmit(onSubmit)(); // Trigger search
    }, 2000);
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
        <div className="mt-8 space-y-4">
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
         <div className="mt-6 rounded-lg bg-gray-50 p-5 dark:bg-gray-800 border-l-4 border-primary-500">
          <div className="flex items-center">
            <Info className="h-6 w-6 text-primary-600 dark:text-primary-300 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">No Results Found</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            No medicines matched your search criteria. Try adjusting your query or filters.
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
    return null;
  };

  return (
    <div className="px-4 pt-6 pb-24 md:px-8">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl">
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 md:p-8">
          <div className="flex items-center mb-4">
            <SearchIcon className="h-8 w-8 text-primary-500 dark:text-primary-300 mr-3" />
            <div>
              <h1 className="text-2xl font-semibold leading-snug text-gray-900 dark:text-gray-100">Intelligent Medicine Search</h1>
              <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                Find medicines by name, potency, or use AI.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Label htmlFor="query" className="sr-only">Search medicine by name or barcode</Label>
              <Controller
                name="query"
                control={control}
                render={({ field }) => (
                  <Input
                    id="query"
                    type="text"
                    placeholder="e.g., Arnica Montana 30C"
                    {...field}
                    className="input-base pr-12" // input-base handles h-12, px-4 etc.
                    onFocus={() => currentQuery && nameSuggestions.length > 0 && setShowNameSuggestions(true)}
                    autoComplete="off"
                    aria-label="Search medicine by name or barcode"
                  />
                )}
              />
              <button 
                type="button" 
                onClick={handleBarcodeScan} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary-500 focus:outline-none dark:text-gray-400" 
                aria-label="Scan barcode"
              >
                <Barcode className="h-6 w-6" />
              </button>
              
              {isLoadingSuggestions && (
                <div className="mt-2 space-y-1">
                  <Skeleton className="h-3 w-full max-w-xs rounded-full" />
                  <Skeleton className="h-3 w-3/4 max-w-xs rounded-full" />
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
               {/* Custom arrow for select is part of .select-base implicit styling or SelectTrigger adjustment */}
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || isSubmitting} 
              className="btn-primary h-12 w-full md:w-auto md:mx-auto md:px-8"
            >
              {(isLoading || isSubmitting) ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <SearchIcon className="mr-2 h-5 w-5" />
                  Find Medicine
                </>
              )}
            </Button>
          </form>
        </div>

        {aiParsedInfo && (
          <div className="mx-auto mt-6 max-w-md rounded-lg border-l-4 border-primary-500 bg-primary-50 p-5 dark:bg-primary-900/20 md:max-w-lg lg:max-w-xl">
            <div className="flex items-center">
              <Wand2 className="mr-3 h-6 w-6 text-primary-600 dark:text-primary-300" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">AI Query Interpretation</h3>
            </div>
            <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong className="text-gray-700 dark:text-gray-300">Detected Medicine:</strong> {aiParsedInfo.medicineName || "Not specified"}</p>
              <p><strong className="text-gray-700 dark:text-gray-300">Detected Potency:</strong> {aiParsedInfo.potency || "Not specified"}</p>
              <p><strong className="text-gray-700 dark:text-gray-300">Detected Intent:</strong> {aiParsedInfo.intent || "Not specified"}</p>
            </div>
          </div>
        )}

        {renderResults()}
      </div>

      {/* Barcode Scanner Bottom Sheet */}
      {showBarcodeScannerSheet && (
        <div 
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowBarcodeScannerSheet(false)}
            aria-hidden="true"
        />
      )}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[70] h-3/5 transform rounded-t-2xl bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-800",
          showBarcodeScannerSheet ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="barcode-scanner-title"
      >
        <div className="flex flex-col items-center justify-center h-full">
            <h2 id="barcode-scanner-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Mock Barcode Scanner</h2>
            <div className="w-full max-w-xs h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <Barcode className="h-24 w-24 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Simulating barcode scan...</p>
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <Button variant="outline" onClick={() => setShowBarcodeScannerSheet(false)} className="mt-6">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
