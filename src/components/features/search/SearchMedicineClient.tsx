
"use client";

import { useState, useEffect } from "react";
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
import { handleParseHomeopathicQuery, fetchMedicinesForSearch } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, SearchIcon, AlertCircle, Wand2, Barcode, Info } from "lucide-react";
import type { ParseHomeopathicQueryOutput } from "@/ai/flows/parse-homeopathic-query";

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

  const { control, handleSubmit, watch, setValue } = useForm<SearchFormData>({
    defaultValues: {
      query: "",
      potency: "Any",
    },
  });

  const currentQuery = watch("query");
  const currentPotency = watch("potency");

  // Fetch all medicines on initial load or when filters are cleared
  useEffect(() => {
    const performInitialSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const medicines = await fetchMedicinesForSearch(undefined, undefined); // Fetch all initially
        setSearchResults(medicines);
      } catch (e) {
        setError("Failed to load initial medicine list.");
        console.error(e);
      } finally {
        setIsLoading(false);
        setInitialLoadDone(true);
      }
    };
    performInitialSearch();
  }, []);


  const onSubmit = async (data: SearchFormData) => {
    setIsLoading(true);
    setError(null);
    setAiParsedInfo(null);

    let searchName = data.query;
    let searchPotency = data.potency;

    if (data.query.trim() !== "") {
      // Use AI to parse the query
      const aiResult = await handleParseHomeopathicQuery({ query: data.query });
      if ('error' in aiResult) {
        setError(aiResult.error);
      } else {
        setAiParsedInfo(aiResult);
        // Override search fields if AI provides confident results
        if (aiResult.medicineName) searchName = aiResult.medicineName;

        // Robustly match AI potency with available canonical POTENCIES
        if (aiResult.potency && aiResult.potency.toLowerCase() !== "any potency" && searchPotency === "Any") {
           let clientMatchedPotency: string | undefined = undefined;
           const aiPotencyRaw = aiResult.potency.toLowerCase(); // e.g., "power 200", "200c", "200"
           for (const canonicalP of POTENCIES) { // POTENCIES are ['200', '30', '1M', etc.]
               const canonicalPLower = canonicalP.toLowerCase(); // e.g., "200"
               
               // Regex to find the canonical potency within the AI's raw potency string.
               // E.g., if canonicalPLower is "200", pattern will match "200" in "power 200" or "200c".
               let pattern: RegExp;
               if (/^\d+$/.test(canonicalPLower)) { // For numeric potencies like "200", "30"
                   pattern = new RegExp(`\\b${canonicalPLower}(c|x)?\\b`, 'i');
               } else { // For potencies with letters like "1M", "3X"
                   pattern = new RegExp(`\\b${canonicalPLower}\\b`, 'i');
               }

               if (pattern.test(aiPotencyRaw)) {
                   clientMatchedPotency = canonicalP; // Assign the canonical form, e.g., "200"
                   break;
               }
           }
           if (clientMatchedPotency) {
             searchPotency = clientMatchedPotency;
             setValue('potency', clientMatchedPotency); // Update form field with canonical potency
           }
        }
      }
    }
    
    try {
      const medicines = await fetchMedicinesForSearch(searchName, searchPotency === "Any" ? undefined : searchPotency);
      setSearchResults(medicines);
    } catch (e) {
      setError("Failed to fetch medicines.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScan = () => {
    // This is a placeholder for actual barcode scanning functionality
    alert("Barcode scanning feature not implemented in this demo. You would integrate a library like QuaggaJS or use a native device API.");
    setValue("query", "Scanned: Arnica Montana 30C"); // Example
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
            <div className="space-y-2">
              <Label htmlFor="query">Search Query (or use AI)</Label>
              <div className="flex gap-2">
                <Controller
                  name="query"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="query"
                      placeholder="e.g., 'Do we have Arnica 30C?' or 'Belladonna'"
                      {...field}
                      className="flex-grow"
                    />
                  )}
                />
                <Button type="button" variant="outline" onClick={handleBarcodeScan} title="Scan Barcode (Mock)">
                  <Barcode className="h-5 w-5" />
                  <span className="sr-only">Scan Barcode</span>
                </Button>
              </div>
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
              No medicines matched your search criteria. Try adjusting your query or filters.
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

