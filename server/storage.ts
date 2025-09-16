import { type User, type InsertUser, type Symptom, type Disease, type Diagnosis, type InsertDiagnosis } from "@shared/schema";
import { csvParser } from "./data/csv-parser";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Symptom methods
  getSymptoms(): Promise<Symptom[]>;
  searchSymptoms(query: string): Promise<Symptom[]>;
  getSymptomByName(name: string): Promise<Symptom | undefined>;
  
  // Disease methods
  getDiseases(): Promise<Disease[]>;
  getDiseaseByName(name: string): Promise<Disease | undefined>;
  
  // Diagnosis methods
  createDiagnosis(diagnosis: InsertDiagnosis): Promise<Diagnosis>;
  getDiagnosis(id: string): Promise<Diagnosis | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private symptoms: Map<string, Symptom>;
  private diseases: Map<string, Disease>;
  private diagnoses: Map<string, Diagnosis>;

  constructor() {
    this.users = new Map();
    this.symptoms = new Map();
    this.diseases = new Map();
    this.diagnoses = new Map();
    
    // Initialize with real CSV data
    this.initializeFromCSV();
  }

  private initializeFromCSV() {
    // Get real symptoms from CSV data
    const csvSymptoms = csvParser.getAllSymptoms();
    const categoryMap = this.categorizeSymptoms();
    
    csvSymptoms.forEach((symptomName, index) => {
      const symptom: Symptom = {
        id: (index + 1).toString(),
        name: symptomName,
        description: this.generateSymptomDescription(symptomName),
        category: categoryMap[symptomName.toLowerCase()] || 'General',
        keywords: this.generateKeywords(symptomName)
      };
      this.symptoms.set(symptom.id, symptom);
    });

    // Get real diseases from CSV data
    const csvDiseases = csvParser.getAllDiseases();
    csvDiseases.forEach((diseaseName, index) => {
      const diseaseInfo = csvParser.getDiseaseInfo(diseaseName);
      const disease: Disease = {
        id: (index + 1).toString(),
        name: diseaseName,
        description: `Condition characterized by ${diseaseInfo?.symptoms?.slice(0, 3).join(', ') || 'various symptoms'}`,
        severity: this.assessDiseaseSeverity(diseaseName),
        recommendedAction: this.getDefaultAction(diseaseName),
        commonSymptoms: diseaseInfo?.symptoms?.slice(0, 6) || []
      };
      this.diseases.set(disease.id, disease);
    });

    console.log(`Initialized with ${csvSymptoms.length} symptoms and ${csvDiseases.length} diseases from CSV data`);
  }

  private categorizeSymptoms(): Record<string, string> {
    return {
      'vomiting': 'Gastrointestinal',
      'diarrhea': 'Gastrointestinal',
      'loss of appetite': 'Gastrointestinal',
      'fever': 'Systemic',
      'lethargy': 'Behavioral',
      'weight loss': 'Systemic',
      'coughing': 'Respiratory',
      'breathing difficulty': 'Respiratory',
      'nasal discharge': 'Respiratory',
      'lameness': 'Musculoskeletal',
      'swollen lymph nodes': 'Immune',
      'heart complication': 'Cardiovascular',
      'increased drinking and urination': 'Urinary',
      'neurological disorders': 'Neurological'
    };
  }

  private generateSymptomDescription(symptomName: string): string {
    const descriptions: Record<string, string> = {
      'Fever': 'Elevated body temperature above normal range',
      'Loss of appetite': 'Decreased interest in food or eating less than usual',
      'Lethargy': 'Unusual tiredness, weakness, or lack of energy',
      'Vomiting': 'Forceful expulsion of stomach contents',
      'Weight Loss': 'Unintentional decrease in body weight',
      'Breathing Difficulty': 'Labored, rapid, or troubled breathing',
      'Nasal Discharge': 'Fluid coming from the nose',
      'Lameness': 'Difficulty walking or favoring one leg',
      'Swollen Lymph nodes': 'Enlarged lymph glands, often indicating infection',
      'Heart Complication': 'Issues affecting heart function or rhythm',
      'Increased drinking and urination': 'Excessive thirst and frequent urination',
      'Neurological Disorders': 'Problems affecting the nervous system'
    };
    return descriptions[symptomName] || `Observable sign or symptom: ${symptomName.toLowerCase()}`;
  }

  private generateKeywords(symptomName: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'Fever': ['hot', 'temperature', 'warm', 'burning'],
      'Loss of appetite': ['not eating', 'refuses food', 'appetite loss'],
      'Lethargy': ['tired', 'sleepy', 'weak', 'inactive'],
      'Vomiting': ['throwing up', 'sick', 'puke', 'regurgitate'],
      'Weight Loss': ['losing weight', 'thin', 'skinny', 'underweight'],
      'Breathing Difficulty': ['breathing problems', 'panting', 'wheezing'],
      'Lameness': ['limping', 'walking problems', 'favoring leg'],
      'Increased drinking and urination': ['drinking lots', 'frequent urination', 'excessive thirst']
    };
    return keywordMap[symptomName] || [symptomName.toLowerCase().replace(/\s+/g, ' ')];
  }

  private assessDiseaseSeverity(diseaseName: string): string {
    const emergencyKeywords = ['bloat', 'poisoning', 'trauma', 'seizure', 'unconscious'];
    const highSeverityKeywords = ['cancer', 'kidney', 'liver', 'heart', 'diabetes'];
    
    const lowerName = diseaseName.toLowerCase();
    if (emergencyKeywords.some(keyword => lowerName.includes(keyword))) {
      return 'emergency';
    } else if (highSeverityKeywords.some(keyword => lowerName.includes(keyword))) {
      return 'high';
    } else if (lowerName.includes('fever') || lowerName.includes('infection')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private getDefaultAction(diseaseName: string): string {
    const severity = this.assessDiseaseSeverity(diseaseName);
    switch (severity) {
      case 'emergency':
        return 'Immediate emergency veterinary care required';
      case 'high':
        return 'Urgent veterinary consultation within 6 hours';
      case 'medium':
        return 'Veterinary consultation within 24 hours';
      default:
        return 'Monitor symptoms and consult veterinarian if they worsen';
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSymptoms(): Promise<Symptom[]> {
    return Array.from(this.symptoms.values());
  }

  async searchSymptoms(query: string): Promise<Symptom[]> {
    const lowercaseQuery = query.toLowerCase();
    const csvResults = csvParser.searchSymptoms(query);
    
    // Return symptoms from our storage that match CSV results
    return Array.from(this.symptoms.values()).filter(symptom =>
      csvResults.includes(symptom.name) ||
      symptom.name.toLowerCase().includes(lowercaseQuery) ||
      symptom.description.toLowerCase().includes(lowercaseQuery) ||
      symptom.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getSymptomByName(name: string): Promise<Symptom | undefined> {
    return Array.from(this.symptoms.values()).find(
      symptom => symptom.name.toLowerCase() === name.toLowerCase()
    );
  }

  async getDiseases(): Promise<Disease[]> {
    return Array.from(this.diseases.values());
  }

  async getDiseaseByName(name: string): Promise<Disease | undefined> {
    return Array.from(this.diseases.values()).find(
      disease => disease.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createDiagnosis(diagnosis: InsertDiagnosis): Promise<Diagnosis> {
    const id = randomUUID();
    const newDiagnosis: Diagnosis = {
      ...diagnosis,
      id,
      createdAt: new Date(),
    };
    this.diagnoses.set(id, newDiagnosis);
    return newDiagnosis;
  }

  async getDiagnosis(id: string): Promise<Diagnosis | undefined> {
    return this.diagnoses.get(id);
  }
}

export const storage = new MemStorage();
