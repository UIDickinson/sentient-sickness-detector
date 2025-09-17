import { readFileSync } from "fs";
import { join } from "path";

export interface CSVSymptomData {
  disease: string;
  symptoms: string[];
}

export class CSVDataParser {
  private data: CSVSymptomData[] = [];

  constructor() {
    this.parseCSV();
  }

  private parseCSV() {
    try {
      const csvPath = join(process.cwd(), 'attached_asset', 'symtomdata_1757954561163.csv');
      const csvContent = readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        if (columns.length < 2) continue;
        
        const disease = columns[0].trim();
        const symptoms = columns.slice(1)
          .filter(symptom => symptom && symptom.trim())
          .map(symptom => symptom.trim());
        
        if (disease && symptoms.length > 0) {
          this.data.push({ disease, symptoms });
        }
      }
      
      console.log(`Loaded ${this.data.length} disease-symptom records from CSV`);
    } catch (error) {
      console.error('Error parsing CSV file:', error);
      // Fallback to mock data if CSV parsing fails
      this.loadFallbackData();
    }
  }

  private loadFallbackData() {
    // Fallback data in case CSV parsing fails
    this.data = [
      {
        disease: 'Gastroenteritis',
        symptoms: ['Vomiting', 'Diarrhea', 'Loss of appetite', 'Lethargy']
      },
      {
        disease: 'Kennel Cough',
        symptoms: ['Coughing', 'Lethargy', 'Loss of appetite']
      }
    ];
  }

  public getAllDiseases(): string[] {
    const diseaseSet = new Set(this.data.map(entry => entry.disease));
    return Array.from(diseaseSet);
  }

  public getAllSymptoms(): string[] {
    const allSymptoms = new Set<string>();
    this.data.forEach(entry => {
      entry.symptoms.forEach(symptom => allSymptoms.add(symptom));
    });
    return Array.from(allSymptoms).sort();
  }

  public getDiseasesForSymptoms(symptoms: string[]): Array<{disease: string, matchCount: number, totalSymptoms: number}> {
    const diseaseMatches = new Map<string, {matchCount: number, totalSymptoms: number}>();
    
    this.data.forEach(entry => {
      if (!diseaseMatches.has(entry.disease)) {
        diseaseMatches.set(entry.disease, {matchCount: 0, totalSymptoms: 0});
      }
      
      const match = diseaseMatches.get(entry.disease)!;
      match.totalSymptoms = Math.max(match.totalSymptoms, entry.symptoms.length);
      
      // Count matching symptoms
      let currentMatch = 0;
      entry.symptoms.forEach(symptom => {
        if (symptoms.some(userSymptom => 
          this.normalizeSymptom(userSymptom).includes(this.normalizeSymptom(symptom)) ||
          this.normalizeSymptom(symptom).includes(this.normalizeSymptom(userSymptom))
        )) {
          currentMatch++;
        }
      });
      
      match.matchCount = Math.max(match.matchCount, currentMatch);
    });
    
    return Array.from(diseaseMatches.entries())
      .map(([disease, data]) => ({disease, ...data}))
      .filter(entry => entry.matchCount > 0)
      .sort((a, b) => {
        // Sort by match ratio first, then by absolute match count
        const ratioA = a.matchCount / Math.max(a.totalSymptoms, symptoms.length);
        const ratioB = b.matchCount / Math.max(b.totalSymptoms, symptoms.length);
        if (ratioB !== ratioA) return ratioB - ratioA;
        return b.matchCount - a.matchCount;
      });
  }

  private normalizeSymptom(symptom: string): string {
    return symptom.toLowerCase().trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  public searchSymptoms(query: string): string[] {
    const normalizedQuery = this.normalizeSymptom(query);
    if (normalizedQuery.length < 2) return [];
    
    const allSymptoms = this.getAllSymptoms();
    return allSymptoms
      .filter(symptom => this.normalizeSymptom(symptom).includes(normalizedQuery))
      .slice(0, 10);
  }

  public getRecords(): CSVSymptomData[] {
    return this.data.map(r => ({ disease: r.disease, symptoms: [...r.symptoms] }));
  }

  public getDiseaseInfo(diseaseName: string): {symptoms: string[], frequency: number} | null {
    const diseaseEntries = this.data.filter(entry => entry.disease === diseaseName);
    if (diseaseEntries.length === 0) return null;
    
    const allSymptoms = new Set<string>();
    diseaseEntries.forEach(entry => {
      entry.symptoms.forEach(symptom => allSymptoms.add(symptom));
    });
    
    return {
      symptoms: Array.from(allSymptoms),
      frequency: diseaseEntries.length
    };
  }
}

export const csvParser = new CSVDataParser();