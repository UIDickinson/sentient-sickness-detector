import { apiRequest } from "./queryClient";
import type { Symptom, DiagnosisResponse, Prediction } from "@shared/schema";

export const api = {
  // Symptom-related endpoints
  getSymptoms: async (): Promise<Symptom[]> => {
    const response = await apiRequest("GET", "/api/symptoms");
    return response.json();
  },

  searchSymptoms: async (query: string): Promise<Symptom[]> => {
    const response = await apiRequest("GET", `/api/symptoms/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  // Diagnosis endpoints
  diagnose: async (symptoms: string[], followUpQuestion?: string): Promise<DiagnosisResponse> => {
    const response = await apiRequest("POST", "/api/diagnose", {
      symptoms,
      followUpQuestion
    });
    return response.json();
  },

  followUp: async (symptoms: string[], predictions: Prediction[], question: string): Promise<{ chatResponse: string }> => {
    const response = await apiRequest("POST", "/api/follow-up", {
      symptoms,
      predictions,
      question
    });
    return response.json();
  }
};
