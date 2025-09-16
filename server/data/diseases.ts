export interface DiseasePattern {
  name: string;
  symptoms: string[];
  baseWeight: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  recommendedAction: string;
}

export const DISEASE_PATTERNS: DiseasePattern[] = [
  {
    name: 'Gastroenteritis',
    symptoms: ['Vomiting', 'Diarrhea', 'Loss of appetite', 'Lethargy'],
    baseWeight: 0.8,
    description: 'Inflammation of the stomach and intestines, commonly causing vomiting, diarrhea, and loss of appetite.',
    severity: 'medium',
    recommendedAction: 'Veterinary consultation within 24 hours'
  },
  {
    name: 'Parvovirus',
    symptoms: ['Vomiting', 'Diarrhea', 'Loss of appetite', 'Lethargy', 'Fever'],
    baseWeight: 0.9,
    description: 'Highly contagious viral infection affecting the gastrointestinal tract, more common in puppies.',
    severity: 'emergency',
    recommendedAction: 'Immediate emergency veterinary care'
  },
  {
    name: 'Dietary Indiscretion',
    symptoms: ['Vomiting', 'Diarrhea', 'Loss of appetite'],
    baseWeight: 0.6,
    description: 'Upset stomach from eating inappropriate or spoiled food, garbage, or non-food items.',
    severity: 'low',
    recommendedAction: 'Monitor closely, vet consultation if symptoms worsen'
  },
  {
    name: 'Kennel Cough',
    symptoms: ['Coughing', 'Lethargy', 'Loss of appetite'],
    baseWeight: 0.7,
    description: 'Infectious respiratory disease causing persistent dry cough.',
    severity: 'medium',
    recommendedAction: 'Veterinary consultation recommended'
  },
  {
    name: 'Hip Dysplasia',
    symptoms: ['Limping', 'Lethargy', 'Difficulty moving'],
    baseWeight: 0.7,
    description: 'Genetic condition affecting hip joint development, causing pain and mobility issues.',
    severity: 'medium',
    recommendedAction: 'Orthopedic veterinary evaluation'
  },
  {
    name: 'Kidney Disease',
    symptoms: ['Excessive thirst', 'Excessive urination', 'Loss of appetite', 'Weight loss', 'Lethargy'],
    baseWeight: 0.8,
    description: 'Progressive kidney function decline affecting waste filtration and fluid balance.',
    severity: 'high',
    recommendedAction: 'Immediate veterinary blood work and examination'
  },
  {
    name: 'Diabetes',
    symptoms: ['Excessive thirst', 'Excessive urination', 'Weight loss', 'Loss of appetite'],
    baseWeight: 0.75,
    description: 'Metabolic disorder affecting blood sugar regulation.',
    severity: 'high',
    recommendedAction: 'Veterinary blood glucose testing required'
  },
  {
    name: 'Allergic Reaction',
    symptoms: ['Skin irritation', 'Excessive drooling', 'Difficulty breathing'],
    baseWeight: 0.6,
    description: 'Immune system response to environmental or food allergens.',
    severity: 'medium',
    recommendedAction: 'Veterinary consultation, emergency care if breathing difficulty severe'
  },
  {
    name: 'Bloat (GDV)',
    symptoms: ['Swollen abdomen', 'Difficulty breathing', 'Excessive drooling', 'Restlessness'],
    baseWeight: 0.95,
    description: 'Life-threatening stomach twisting condition requiring immediate surgery.',
    severity: 'emergency',
    recommendedAction: 'IMMEDIATE emergency veterinary surgery required'
  },
  {
    name: 'Arthritis',
    symptoms: ['Limping', 'Stiffness', 'Lethargy', 'Difficulty moving'],
    baseWeight: 0.6,
    description: 'Joint inflammation causing pain and reduced mobility, common in older dogs.',
    severity: 'medium',
    recommendedAction: 'Veterinary examination for pain management options'
  }
];
