import { csvParser, type CSVSymptomData } from '../data/csv-parser';
import { type Prediction } from '@shared/schema';

export class DogSymptomMLModel {
  private csvData: typeof csvParser;

  constructor() {
    this.csvData = csvParser;
  }

  /**
   * Predicts diseases based on provided symptoms using real CSV data
   */
  async predict(symptoms: string[]): Promise<Prediction[]> {
    const normalizedSymptoms = symptoms.map(s => this.normalizeSymptom(s));
    const diseaseMatches = this.csvData.getDiseasesForSymptoms(symptoms);
    const predictions: Prediction[] = [];

    for (const match of diseaseMatches.slice(0, 10)) { // Top 10 matches
      const confidence = this.calculateRealConfidence(normalizedSymptoms, match);
      
      if (confidence > 0.1) {
        const diseaseInfo = this.csvData.getDiseaseInfo(match.disease);
        predictions.push({
          disease: match.disease,
          confidence: Math.round(confidence * 100) / 100,
          description: this.generateDescription(match.disease, diseaseInfo),
          action: this.getRecommendedAction(match.disease, confidence),
          severity: this.assessSeverity(match.disease, confidence)
        });
      }
    }

    // Sort by confidence descending
    predictions.sort((a, b) => b.confidence - a.confidence);
    
    // Return top 5 predictions
    return predictions.slice(0, 5);
  }

  private normalizeSymptom(symptom: string): string {
    // Basic normalization - remove extra spaces, convert to lowercase
    return symptom.trim().toLowerCase();
  }

  private calculateRealConfidence(userSymptoms: string[], match: {disease: string, matchCount: number, totalSymptoms: number}): number {
    const matchRatio = match.matchCount / Math.max(userSymptoms.length, match.totalSymptoms);
    const absoluteScore = match.matchCount / userSymptoms.length;
    
    // Combine ratio and absolute scoring
    let confidence = (matchRatio * 0.6) + (absoluteScore * 0.4);
    
    // Apply disease-specific adjustments
    if (this.isEmergencyDisease(match.disease) && match.matchCount >= 2) {
      confidence = Math.min(confidence * 1.3, 0.95);
    }
    
    // Boost confidence for diseases with high data frequency
    const diseaseInfo = this.csvData.getDiseaseInfo(match.disease);
    if (diseaseInfo && diseaseInfo.frequency > 50) {
      confidence = Math.min(confidence * 1.1, 0.95);
    }
    
    return Math.min(confidence, 0.95);
  }

  private generateDescription(disease: string, diseaseInfo: any): string {
    const commonSymptoms = diseaseInfo?.symptoms?.slice(0, 4).join(', ') || 'various symptoms';
    return `A condition commonly associated with ${commonSymptoms}. Based on veterinary data analysis.`;
  }

  private getRecommendedAction(disease: string, confidence: number): string {
    if (this.isEmergencyDisease(disease) || confidence > 0.8) {
      return 'Immediate veterinary consultation recommended';
    } else if (confidence > 0.6) {
      return 'Veterinary consultation within 24 hours';
    } else {
      return 'Monitor symptoms and consult veterinarian if they worsen';
    }
  }

  private assessSeverity(disease: string, confidence: number): string {
    if (this.isEmergencyDisease(disease)) {
      return 'emergency';
    } else if (confidence > 0.7) {
      return 'high';
    } else if (confidence > 0.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private isEmergencyDisease(disease: string): boolean {
    const emergencyKeywords = ['bloat', 'gdv', 'poisoning', 'seizure', 'trauma', 'bleeding', 'unconscious'];
    return emergencyKeywords.some(keyword => disease.toLowerCase().includes(keyword));
  }

  private isSimilarSymptom(symptom1: string, symptom2: string): boolean {
    // Simple similarity check for common variations
    const synonyms = {
      'vomit': ['throw up', 'sick', 'puke'],
      'tired': ['lethargy', 'weakness', 'sleepy'],
      'diarrhea': ['loose stool', 'runny stool'],
      'appetite': ['eating', 'food'],
      'breathing': ['breath', 'panting'],
      'walking': ['limping', 'moving']
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if ((symptom1.includes(key) || values.some(v => symptom1.includes(v))) &&
          (symptom2.includes(key) || values.some(v => symptom2.includes(v)))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get symptom suggestions based on partial input using CSV data
   */
  getSymptomSuggestions(query: string): string[] {
    return this.csvData.searchSymptoms(query);
  }
}

export const mlModel = new DogSymptomMLModel();
