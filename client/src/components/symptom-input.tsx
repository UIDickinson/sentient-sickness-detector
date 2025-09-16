import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Symptom } from "@shared/schema";
import { X, Search, Lightbulb } from "lucide-react";

interface SymptomInputProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
  onDiagnose: () => void;
  isLoading: boolean;
}

export function SymptomInput({ selectedSymptoms, onSymptomsChange, onDiagnose, isLoading }: SymptomInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [] } = useQuery<Symptom[]>({
    queryKey: ['/api/symptoms/search', inputValue],
    queryFn: () => api.searchSymptoms(inputValue),
    enabled: inputValue.length >= 2,
    staleTime: 60000, // Cache for 1 minute
  });

  // Handle click outside to close autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowAutocomplete(value.length >= 2);
  };

  const selectSymptom = (symptomName: string) => {
    if (!selectedSymptoms.includes(symptomName)) {
      onSymptomsChange([...selectedSymptoms, symptomName]);
    }
    setInputValue("");
    setShowAutocomplete(false);
  };

  const removeSymptom = (symptomToRemove: string) => {
    onSymptomsChange(selectedSymptoms.filter(symptom => symptom !== symptomToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      selectSymptom(inputValue.trim());
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">Describe Your Dog's Symptoms</h3>
        <p className="text-muted-foreground">Start typing to search from our symptom database, or describe in your own words.</p>
      </div>

      <div className="relative mb-6">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="e.g., vomiting, loss of appetite, lethargy..."
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => inputValue.length >= 2 && setShowAutocomplete(true)}
            className="w-full p-4 text-lg bg-input border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none transition-all duration-200"
            data-testid="input-symptoms"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {showAutocomplete && searchResults.length > 0 && (
          <div 
            ref={autocompleteRef}
            className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg shadow-lg mt-2 z-10 max-h-60 overflow-y-auto"
            data-testid="autocomplete-dropdown"
          >
            {searchResults.map((symptom) => (
              <div
                key={symptom.id}
                className="autocomplete-item p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 flex items-center space-x-3"
                onClick={() => selectSymptom(symptom.name)}
                data-testid={`autocomplete-item-${symptom.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">{symptom.name}</p>
                  <p className="text-sm text-muted-foreground">{symptom.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Symptoms */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-foreground mb-3">Selected Symptoms</h4>
        <div className="flex flex-wrap gap-2" data-testid="selected-symptoms">
          {selectedSymptoms.length === 0 ? (
            <p className="text-muted-foreground italic">No symptoms selected yet</p>
          ) : (
            selectedSymptoms.map((symptom) => (
              <div
                key={symptom}
                className="symptom-tag text-accent-foreground px-4 py-2 rounded-full font-medium flex items-center space-x-2 shadow-sm"
                data-testid={`symptom-tag-${symptom.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span>{symptom}</span>
                <button
                  className="ml-2 hover:bg-black/10 rounded-full p-1 transition-colors"
                  onClick={() => removeSymptom(symptom)}
                  data-testid={`remove-symptom-${symptom.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Diagnose Button */}
      <div className="text-center">
        <Button
          onClick={onDiagnose}
          disabled={selectedSymptoms.length === 0 || isLoading}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          data-testid="button-diagnose"
        >
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-5 h-5" />
                <span>Get AI Assessment</span>
              </>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
}
