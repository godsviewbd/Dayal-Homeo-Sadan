
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
import type { Medicine } from "@/types";
import { POTENCIES } from "@/types";
import { handleParseHomeopathicQuery, fetchMedicinesForSearch, handleGetUniqueMedicineNames } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, SearchIcon, AlertCircle, Wand2, Barcode, Info } from "lucide-react";
import type { ParseHomeopathicQueryOutput } from "@/ai/flows/parse-homeopathic-query";
import { cn } from "@/lib/utils";

interface SearchFormData {
  query: string;
  potency: string;
}

export function SearchMedicineClient() {
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiParsedInfo, setAiParsedInfo] = useState<ParseHomeopathicQueryOutput | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [allMedicineBaseNames, setAllMedicineBaseNames] = useState<string[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);


  const { control, handleSubmit, watch, setValue, setFocus } = useForm<SearchFormData>({
    defaultValues: {
      query: "",
      potency: "Any",
    },
  });

  const currentQuery = watch("query");
  const currentPotency = watch("potency");

  // Fetch all unique medicine names for autocomplete
  useEffect(() => {
    const fetchNames = async () => {
      console.log("SearchMedicineClient: Fetching unique medicine names for autocomplete...");
      try {
        const names = await handleGetUniqueMedicineNames();
        setAllMedicineBaseNames(names);
        console.log("SearchMedicineClient: Fetched unique names:", names);
      } catch (e) {
        console.error("SearchMedicineClient: Failed to fetch unique medicine names for autocomplete:", e);
        setError("Failed to load name suggestions.");
      }
    };
    fetchNames();
  }, []);

  // Update suggestions based on current query
  useEffect(() => {
    if (currentQuery && currentQuery.length > 0) { // Suggest even from 1 char
      const filtered = allMedicineBaseNames.filter(name =>
        name.toLowerCase().includes(currentQuery.toLowerCase())
      );
      setNameSuggestions(filtered.slice(0, 10)); // Limit suggestions
      setShowNameSuggestions(filtered.length > 0);
      console.log("SearchMedicineClient: Generated suggestions for '"+ currentQuery +"':", filtered.slice(0,10));
    } else {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
    }
  }, [currentQuery, allMedicineBaseNames]);

  // Handle clicks outside suggestions to close it
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


  // Fetch all medicines on initial load or when filters are cleared
  useEffect(() => {
    const performInitialSearch = async () => {
      setIsLoading(true);
      setError(null);
      console.log("SearchMedicineClient: Performing initial search for all medicines.");
      try {
        const medicines = await fetchMedicinesForSearch(undefined, undefined); // Fetch all initially
        setSearchResults(medicines);
        console.log(`SearchMedicineClient: Initial search returned ${medicines.length} medicines.`);
      } catch (e) {
        setError("Failed to load initial medicine list.");
        console.error("SearchMedicineClient: Initial search error:", e);
      } finally {
        setIsLoading(false);
        setInitialLoadDone(true);
      }
    };
    performInitialSearch();
  }, []);


  const onSubmit = async (data: SearchFormData) => {
    console.log("SearchMedicineClient: onSubmit called with data:", data);
    setIsLoading(true);
    setError(null);
    setAiParsedInfo(null);
    setShowNameSuggestions(false); // Hide suggestions on submit

    let searchName = data.query;
    let searchPotency = data.potency;

    // Only use AI if query is not empty AND potency is "Any" or AI can refine potency
    if (data.query.trim() !== "") {
        console.log("SearchMedicineClient: Query is not empty, attempting AI parse for:", data.query);
        try {
            const aiResult = await handleParseHomeopathicQuery({ query: data.query });
            console.log("SearchMedicineClient: AI parse result:", aiResult);
            if ('error' in aiResult) {
                // Non-critical error, proceed with user's input if AI fails
                console.warn("SearchMedicineClient: AI parsing failed, proceeding with form data. Error:", aiResult.error);
                // setError(aiResult.error); // Optionally show AI error, or just let search proceed
            } else {
                setAiParsedInfo(aiResult);
                if (aiResult.medicineName) {
                    searchName = aiResult.medicineName; // Use AI's detected name
                    console.log("SearchMedicineClient: Using AI detected name:", searchName);
                }

                // If user selected "Any" potency, try to use AI's detected potency
                if (aiResult.potency && aiResult.potency.toLowerCase() !== "any potency" && data.potency === "Any") {
                   let clientMatchedPotency: string | undefined = undefined;
                   const aiPotencyRaw = aiResult.potency.toLowerCase();
                   
                   for (const canonicalP of POTENCIES) { 
                       const canonicalPLower = canonicalP.toLowerCase(); 
                       let pattern: RegExp;
                       if (/^(\d+)$/.test(canonicalPLower)) { 
                           pattern = new RegExp(`\\b${canonicalPLower}(c|x)?\\b`, 'i');
                       } else { 
                           pattern = new RegExp(`\\b${canonicalPLower}\\b`, 'i');
                       }

                       if (pattern.test(aiPotencyRaw)) {
                           clientMatchedPotency = canonicalP; 
                           break;
                       }
                   }
                   if (clientMatchedPotency) {
                     searchPotency = clientMatchedPotency;
                     setValue('potency', clientMatchedPotency); // Update dropdown to reflect AI's choice
                     console.log("SearchMedicineClient: Using AI detected and client-matched potency:", searchPotency);
                   } else {
                     console.log("SearchMedicineClient: AI detected potency '"+aiResult.potency+"' but could not match to client POTENCIES. Using form potency:", data.potency);
                   }
                }
            }
        } catch (aiError) {
            console.error("SearchMedicineClient: Critical error during AI parsing:", aiError);
            // Proceed with user's input if AI critically fails
        }
    }
    
    console.log(`SearchMedicineClient: Executing search with name: "${searchName}", potency: "${searchPotency}"`);
    try {
      const medicines = await fetchMedicinesForSearch(searchName, searchPotency === "Any" ? undefined : searchPotency);
      setSearchResults(medicines);
      console.log(`SearchMedicineClient: Search returned ${medicines.length} results.`);
    } catch (e) {
      setError("Failed to fetch medicines.");
      console.error("SearchMedicineClient: fetchMedicinesForSearch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScan = () => {
    alert("Barcode scanning feature not implemented in this demo. You would integrate a library like QuaggaJS or use a native device API.");
    setValue("query", "Scanned: Arnica Montana 30C"); 
    // Potentially trigger search or AI parse here
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue("query", suggestion);
    setNameSuggestions([]);
    setShowNameSuggestions(false);
    console.log("SearchMedicineClient: Suggestion clicked:", suggestion);
    setFocus('query'); 
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <SearchIcon className="mr-2 h-6 w-6 text-primary" />
            Intelligent Medicine Search
          </CardTitle>
          <CardDescription>
            Find medicines using natural language, specific filters, or (mocked) barcode scanning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 relative">
              <Label htmlFor="query">Search Query (or use AI)</Label>
              <div className="flex gap-2">
                <Controller
                  name="query"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="query"
                      placeholder="e.g., 'Arnica 30C' or 'Belladonna'"
                      {...field}
                      className="flex-grow"
                      onFocus={() => currentQuery && nameSuggestions.length > 0 && setShowNameSuggestions(true)}
                      autoComplete="off"
                    />
                  )}
                />
                <Button type="button" variant="outline" onClick={handleBarcodeScan} title="Scan Barcode (Mock)">
                  <Barcode className="h-5 w-5" />
                  <span className="sr-only">Scan Barcode</span>
                </Button>
              </div>
              {showNameSuggestions && nameSuggestions.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute z-10 w-full bg-background border border-input rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto"
                >
                  {nameSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseDown={(e) => e.preventDefault()} 
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="potency">Potency</Label>
              <Controller
                name="potency"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="potency">
                      <SelectValue placeholder="Select potency" />
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
            
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {aiParsedInfo && (
        <Card className="bg-accent/20 border-accent shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Wand2 className="mr-2 h-5 w-5 text-accent-foreground" />
              AI Query Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>Detected Medicine:</strong> {aiParsedInfo.medicineName || "Not specified"}</p>
            <p><strong>Detected Potency:</strong> {aiParsedInfo.potency || "Not specified"}</p>
            <p><strong>Detected Intent:</strong> {aiParsedInfo.intent || "Not specified"}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="bg-destructive/10 border-destructive text-destructive-foreground shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><AlertCircle className="mr-2 h-5 w-5" />Error</CardTitle>
          </CardHeader>
          <CardContent><p>{error}</p></CardContent>
        </Card>
      )}
      
      {isLoading && !initialLoadDone && (
         <div className="text-center py-10">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading medicines...</p>
          </div>
      )}

      {initialLoadDone && !isLoading && searchResults.length === 0 && (currentQuery || currentPotency !== "Any") && (
        <Card className="shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/>No Results Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No medicines matched your search criteria. Try adjusting your query or filters, or check if your CSV file is correctly populated and loaded (see server logs).
            </p>
          </CardContent>
        </Card>
      )}

      {searchResults.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold font-headline mb-6">
            Search Results ({searchResults.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

