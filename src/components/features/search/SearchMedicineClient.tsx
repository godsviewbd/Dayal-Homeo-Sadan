
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
import { MedicineCardSkeleton } from "./MedicineCardSkeleton"; // New Skeleton
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
  const [searchAttempted, setSearchAttempted] = useState(false);

  const [allMedicineBaseNames, setAllMedicineBaseNames] = useState<string[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);


  const { control, handleSubmit, watch, setValue, setFocus, formState: {isSubmitting} } = useForm<SearchFormData>({
    defaultValues: {
      query: "",
      potency: "Any",
    },
  });

  const currentQuery = watch("query");

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const names = await handleGetUniqueMedicineNames();
        setAllMedicineBaseNames(names);
      } catch (e) {
        console.error("SearchClient: Failed to fetch unique medicine names for autocomplete:", e);
      }
    };
    fetchNames();
  }, []);

  useEffect(() => {
    if (currentQuery && currentQuery.length > 0) {
      const filtered = allMedicineBaseNames.filter(name =>
        name.toLowerCase().includes(currentQuery.toLowerCase())
      );
      setNameSuggestions(filtered.slice(0, 10)); // Limit suggestions
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
    setSearchResults([]); // Clear previous results immediately

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
    alert("Barcode scanning feature not implemented in this demo. You would integrate a library like QuaggaJS or use a native device API.");
    setValue("query", "Scanned: Arnica Montana 30C");
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
        <div className="mt-8">
          <h2 className="text-xl font-semibold font-headline mb-4 text-foreground">Searching...</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(3)].map((_, i) => <MedicineCardSkeleton key={i} />)}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="bg-destructive/10 border-destructive text-destructive-foreground shadow-md mt-8 p-4 md:p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg flex items-center"><AlertCircle className="mr-2 h-5 w-5" />Error</CardTitle>
          </CardHeader>
          <CardContent className="p-0"><p className="text-sm">{error}</p></CardContent>
        </Card>
      );
    }

    if (searchAttempted && searchResults.length === 0) {
      return (
        <Card className="shadow-md mt-8 p-4 md:p-6 bg-card">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg flex items-center font-medium text-foreground"><Info className="mr-2 h-5 w-5 text-primary"/>No Results Found</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground">
              No medicines matched your search criteria. Try adjusting your query or filters.
              Ensure your CSV data at <code>src/data/medicine_name.csv</code> is correct with headers:
              <code>"Medicine Name","Potecy/Power","Box Number","Total Number Of Medicine"</code>.
              Review server console logs for parsing details.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (searchResults.length > 0) {
      return (
        <div className="mt-8">
          <h2 className="text-xl font-semibold font-headline mb-4 text-foreground">
            Search Results <span className="text-base font-normal text-muted-foreground">({searchResults.length} found)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
    <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-background p-4 md:p-6 border-b">
          <CardTitle className="font-headline text-2xl flex items-center text-foreground">
            <SearchIcon className="mr-2.5 h-6 w-6 text-primary" />
            Intelligent Medicine Search
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm">
            Find medicines using natural language, specific filters, or simulated barcode scanning.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 relative">
              <Label htmlFor="query" className="text-sm font-medium text-foreground">Search Query (or use AI)</Label>
              <div className="flex gap-3 items-center">
                <div className="relative flex-grow">
                  <Controller
                    name="query"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="query"
                        placeholder="e.g., 'Arnica 30C' or 'Belladonna'"
                        {...field}
                        className="h-11 text-base pl-3 pr-10"
                        onFocus={() => currentQuery && nameSuggestions.length > 0 && setShowNameSuggestions(true)}
                        autoComplete="off"
                      />
                    )}
                  />
                   <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                 </div>
                <Button type="button" variant="outline" onClick={handleBarcodeScan} title="Scan Barcode (Mock)" className="h-11 w-11 p-0 shrink-0 btn-transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Barcode className="h-5 w-5" />
                  <span className="sr-only">Scan Barcode</span>
                </Button>
              </div>
              {showNameSuggestions && nameSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full bg-popover border border-border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto py-1"
                  role="listbox"
                >
                  {nameSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm text-popover-foreground"
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseDown={(e) => e.preventDefault()} // Prevents input blur on click
                      role="option"
                      aria-selected={false} // Can be managed for better a11y
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="potency" className="text-sm font-medium text-foreground">Potency</Label>
              <Controller
                name="potency"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="potency" className="h-11 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
            
            <Button type="submit" disabled={isLoading || isSubmitting} className="w-full sm:w-auto h-11 text-base btn-transition shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {(isLoading || isSubmitting) ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <SearchIcon className="mr-2 h-5 w-5" /> /* Icon was missing here */
              )}
              Search Medicines
            </Button>
          </form>
        </CardContent>
      </Card>

      {aiParsedInfo && (
        <Card className="bg-primary/10 border-primary/30 shadow-md p-4 md:p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg flex items-center font-medium text-primary">
              <Wand2 className="mr-2 h-5 w-5" />
              AI Query Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-sm space-y-1 text-foreground/90">
            <p><strong>Detected Medicine:</strong> {aiParsedInfo.medicineName || "Not specified"}</p>
            <p><strong>Detected Potency:</strong> {aiParsedInfo.potency || "Not specified"}</p>
            <p><strong>Detected Intent:</strong> {aiParsedInfo.intent || "Not specified"}</p>
          </CardContent>
        </Card>
      )}

      {renderResults()}

    </div>
  );
}
