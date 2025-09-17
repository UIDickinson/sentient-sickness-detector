// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/data/csv-parser.ts
import { readFileSync } from "fs";
import { join } from "path";
var CSVDataParser = class {
  data = [];
  constructor() {
    this.parseCSV();
  }
  parseCSV() {
    try {
      const csvPath = join(process.cwd(), "attached_assets", "symtomdata_1757954561163.csv");
      const csvContent = readFileSync(csvPath, "utf-8");
      const lines = csvContent.split("\n");
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const columns = line.split(",");
        if (columns.length < 2) continue;
        const disease = columns[0].trim();
        const symptoms2 = columns.slice(1).filter((symptom) => symptom && symptom.trim()).map((symptom) => symptom.trim());
        if (disease && symptoms2.length > 0) {
          this.data.push({ disease, symptoms: symptoms2 });
        }
      }
      console.log(`Loaded ${this.data.length} disease-symptom records from CSV`);
    } catch (error) {
      console.error("Error parsing CSV file:", error);
      this.loadFallbackData();
    }
  }
  loadFallbackData() {
    this.data = [
      {
        disease: "Gastroenteritis",
        symptoms: ["Vomiting", "Diarrhea", "Loss of appetite", "Lethargy"]
      },
      {
        disease: "Kennel Cough",
        symptoms: ["Coughing", "Lethargy", "Loss of appetite"]
      }
    ];
  }
  getAllDiseases() {
    const diseaseSet = new Set(this.data.map((entry) => entry.disease));
    return Array.from(diseaseSet);
  }
  getAllSymptoms() {
    const allSymptoms = /* @__PURE__ */ new Set();
    this.data.forEach((entry) => {
      entry.symptoms.forEach((symptom) => allSymptoms.add(symptom));
    });
    return Array.from(allSymptoms).sort();
  }
  getDiseasesForSymptoms(symptoms2) {
    const diseaseMatches = /* @__PURE__ */ new Map();
    this.data.forEach((entry) => {
      if (!diseaseMatches.has(entry.disease)) {
        diseaseMatches.set(entry.disease, { matchCount: 0, totalSymptoms: 0 });
      }
      const match = diseaseMatches.get(entry.disease);
      match.totalSymptoms = Math.max(match.totalSymptoms, entry.symptoms.length);
      let currentMatch = 0;
      entry.symptoms.forEach((symptom) => {
        if (symptoms2.some(
          (userSymptom) => this.normalizeSymptom(userSymptom).includes(this.normalizeSymptom(symptom)) || this.normalizeSymptom(symptom).includes(this.normalizeSymptom(userSymptom))
        )) {
          currentMatch++;
        }
      });
      match.matchCount = Math.max(match.matchCount, currentMatch);
    });
    return Array.from(diseaseMatches.entries()).map(([disease, data]) => ({ disease, ...data })).filter((entry) => entry.matchCount > 0).sort((a, b) => {
      const ratioA = a.matchCount / Math.max(a.totalSymptoms, symptoms2.length);
      const ratioB = b.matchCount / Math.max(b.totalSymptoms, symptoms2.length);
      if (ratioB !== ratioA) return ratioB - ratioA;
      return b.matchCount - a.matchCount;
    });
  }
  normalizeSymptom(symptom) {
    return symptom.toLowerCase().trim().replace(/\s+/g, " ").replace(/[^\w\s]/g, "");
  }
  searchSymptoms(query) {
    const normalizedQuery = this.normalizeSymptom(query);
    if (normalizedQuery.length < 2) return [];
    const allSymptoms = this.getAllSymptoms();
    return allSymptoms.filter((symptom) => this.normalizeSymptom(symptom).includes(normalizedQuery)).slice(0, 10);
  }
  getRecords() {
    return this.data.map((r) => ({ disease: r.disease, symptoms: [...r.symptoms] }));
  }
  getDiseaseInfo(diseaseName) {
    const diseaseEntries = this.data.filter((entry) => entry.disease === diseaseName);
    if (diseaseEntries.length === 0) return null;
    const allSymptoms = /* @__PURE__ */ new Set();
    diseaseEntries.forEach((entry) => {
      entry.symptoms.forEach((symptom) => allSymptoms.add(symptom));
    });
    return {
      symptoms: Array.from(allSymptoms),
      frequency: diseaseEntries.length
    };
  }
};
var csvParser = new CSVDataParser();

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  symptoms;
  diseases;
  diagnoses;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.symptoms = /* @__PURE__ */ new Map();
    this.diseases = /* @__PURE__ */ new Map();
    this.diagnoses = /* @__PURE__ */ new Map();
    this.initializeFromCSV();
  }
  initializeFromCSV() {
    const csvSymptoms = csvParser.getAllSymptoms();
    const categoryMap = this.categorizeSymptoms();
    csvSymptoms.forEach((symptomName, index) => {
      const symptom = {
        id: (index + 1).toString(),
        name: symptomName,
        description: this.generateSymptomDescription(symptomName),
        category: categoryMap[symptomName.toLowerCase()] || "General",
        keywords: this.generateKeywords(symptomName)
      };
      this.symptoms.set(symptom.id, symptom);
    });
    const csvDiseases = csvParser.getAllDiseases();
    csvDiseases.forEach((diseaseName, index) => {
      const diseaseInfo = csvParser.getDiseaseInfo(diseaseName);
      const disease = {
        id: (index + 1).toString(),
        name: diseaseName,
        description: `Condition characterized by ${diseaseInfo?.symptoms?.slice(0, 3).join(", ") || "various symptoms"}`,
        severity: this.assessDiseaseSeverity(diseaseName),
        recommendedAction: this.getDefaultAction(diseaseName),
        commonSymptoms: diseaseInfo?.symptoms?.slice(0, 6) || []
      };
      this.diseases.set(disease.id, disease);
    });
    console.log(`Initialized with ${csvSymptoms.length} symptoms and ${csvDiseases.length} diseases from CSV data`);
  }
  categorizeSymptoms() {
    return {
      "vomiting": "Gastrointestinal",
      "diarrhea": "Gastrointestinal",
      "loss of appetite": "Gastrointestinal",
      "fever": "Systemic",
      "lethargy": "Behavioral",
      "weight loss": "Systemic",
      "coughing": "Respiratory",
      "breathing difficulty": "Respiratory",
      "nasal discharge": "Respiratory",
      "lameness": "Musculoskeletal",
      "swollen lymph nodes": "Immune",
      "heart complication": "Cardiovascular",
      "increased drinking and urination": "Urinary",
      "neurological disorders": "Neurological"
    };
  }
  generateSymptomDescription(symptomName) {
    const descriptions = {
      "Fever": "Elevated body temperature above normal range",
      "Loss of appetite": "Decreased interest in food or eating less than usual",
      "Lethargy": "Unusual tiredness, weakness, or lack of energy",
      "Vomiting": "Forceful expulsion of stomach contents",
      "Weight Loss": "Unintentional decrease in body weight",
      "Breathing Difficulty": "Labored, rapid, or troubled breathing",
      "Nasal Discharge": "Fluid coming from the nose",
      "Lameness": "Difficulty walking or favoring one leg",
      "Swollen Lymph nodes": "Enlarged lymph glands, often indicating infection",
      "Heart Complication": "Issues affecting heart function or rhythm",
      "Increased drinking and urination": "Excessive thirst and frequent urination",
      "Neurological Disorders": "Problems affecting the nervous system"
    };
    return descriptions[symptomName] || `Observable sign or symptom: ${symptomName.toLowerCase()}`;
  }
  generateKeywords(symptomName) {
    const keywordMap = {
      "Fever": ["hot", "temperature", "warm", "burning"],
      "Loss of appetite": ["not eating", "refuses food", "appetite loss"],
      "Lethargy": ["tired", "sleepy", "weak", "inactive"],
      "Vomiting": ["throwing up", "sick", "puke", "regurgitate"],
      "Weight Loss": ["losing weight", "thin", "skinny", "underweight"],
      "Breathing Difficulty": ["breathing problems", "panting", "wheezing"],
      "Lameness": ["limping", "walking problems", "favoring leg"],
      "Increased drinking and urination": ["drinking lots", "frequent urination", "excessive thirst"]
    };
    return keywordMap[symptomName] || [symptomName.toLowerCase().replace(/\s+/g, " ")];
  }
  assessDiseaseSeverity(diseaseName) {
    const emergencyKeywords = ["bloat", "poisoning", "trauma", "seizure", "unconscious"];
    const highSeverityKeywords = ["cancer", "kidney", "liver", "heart", "diabetes"];
    const lowerName = diseaseName.toLowerCase();
    if (emergencyKeywords.some((keyword) => lowerName.includes(keyword))) {
      return "emergency";
    } else if (highSeverityKeywords.some((keyword) => lowerName.includes(keyword))) {
      return "high";
    } else if (lowerName.includes("fever") || lowerName.includes("infection")) {
      return "medium";
    } else {
      return "low";
    }
  }
  getDefaultAction(diseaseName) {
    const severity = this.assessDiseaseSeverity(diseaseName);
    switch (severity) {
      case "emergency":
        return "Immediate emergency veterinary care required";
      case "high":
        return "Urgent veterinary consultation within 6 hours";
      case "medium":
        return "Veterinary consultation within 24 hours";
      default:
        return "Monitor symptoms and consult veterinarian if they worsen";
    }
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getSymptoms() {
    return Array.from(this.symptoms.values());
  }
  async searchSymptoms(query) {
    const lowercaseQuery = query.toLowerCase();
    const csvResults = csvParser.searchSymptoms(query);
    return Array.from(this.symptoms.values()).filter(
      (symptom) => csvResults.includes(symptom.name) || symptom.name.toLowerCase().includes(lowercaseQuery) || symptom.description.toLowerCase().includes(lowercaseQuery) || symptom.keywords.some((keyword) => keyword.toLowerCase().includes(lowercaseQuery))
    );
  }
  async getSymptomByName(name) {
    return Array.from(this.symptoms.values()).find(
      (symptom) => symptom.name.toLowerCase() === name.toLowerCase()
    );
  }
  async getDiseases() {
    return Array.from(this.diseases.values());
  }
  async getDiseaseByName(name) {
    return Array.from(this.diseases.values()).find(
      (disease) => disease.name.toLowerCase() === name.toLowerCase()
    );
  }
  async createDiagnosis(diagnosis) {
    const id = randomUUID();
    const newDiagnosis = {
      ...diagnosis,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.diagnoses.set(id, newDiagnosis);
    return newDiagnosis;
  }
  async getDiagnosis(id) {
    return this.diagnoses.get(id);
  }
};
var storage = new MemStorage();

// server/services/ml-model.ts
var DogSymptomMLModel = class {
  csvData;
  constructor() {
    this.csvData = csvParser;
  }
  /**
   * Predicts diseases based on provided symptoms using real CSV data
   */
  async predict(symptoms2) {
    const normalizedSymptoms = symptoms2.map((s) => this.normalizeSymptom(s));
    const diseaseMatches = this.csvData.getDiseasesForSymptoms(symptoms2);
    const predictions = [];
    for (const match of diseaseMatches.slice(0, 10)) {
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
    predictions.sort((a, b) => b.confidence - a.confidence);
    return predictions.slice(0, 5);
  }
  normalizeSymptom(symptom) {
    return symptom.trim().toLowerCase();
  }
  calculateRealConfidence(userSymptoms, match) {
    const matchRatio = match.matchCount / Math.max(userSymptoms.length, match.totalSymptoms);
    const absoluteScore = match.matchCount / userSymptoms.length;
    let confidence = matchRatio * 0.6 + absoluteScore * 0.4;
    if (this.isEmergencyDisease(match.disease) && match.matchCount >= 2) {
      confidence = Math.min(confidence * 1.3, 0.95);
    }
    const diseaseInfo = this.csvData.getDiseaseInfo(match.disease);
    if (diseaseInfo && diseaseInfo.frequency > 50) {
      confidence = Math.min(confidence * 1.1, 0.95);
    }
    return Math.min(confidence, 0.95);
  }
  generateDescription(disease, diseaseInfo) {
    const commonSymptoms = diseaseInfo?.symptoms?.slice(0, 4).join(", ") || "various symptoms";
    return `A condition commonly associated with ${commonSymptoms}. Based on veterinary data analysis.`;
  }
  getRecommendedAction(disease, confidence) {
    if (this.isEmergencyDisease(disease) || confidence > 0.8) {
      return "Immediate veterinary consultation recommended";
    } else if (confidence > 0.6) {
      return "Veterinary consultation within 24 hours";
    } else {
      return "Monitor symptoms and consult veterinarian if they worsen";
    }
  }
  assessSeverity(disease, confidence) {
    if (this.isEmergencyDisease(disease)) {
      return "emergency";
    } else if (confidence > 0.7) {
      return "high";
    } else if (confidence > 0.5) {
      return "medium";
    } else {
      return "low";
    }
  }
  isEmergencyDisease(disease) {
    const emergencyKeywords = ["bloat", "gdv", "poisoning", "seizure", "trauma", "bleeding", "unconscious"];
    return emergencyKeywords.some((keyword) => disease.toLowerCase().includes(keyword));
  }
  isSimilarSymptom(symptom1, symptom2) {
    const synonyms = {
      "vomit": ["throw up", "sick", "puke"],
      "tired": ["lethargy", "weakness", "sleepy"],
      "diarrhea": ["loose stool", "runny stool"],
      "appetite": ["eating", "food"],
      "breathing": ["breath", "panting"],
      "walking": ["limping", "moving"]
    };
    for (const [key, values] of Object.entries(synonyms)) {
      if ((symptom1.includes(key) || values.some((v) => symptom1.includes(v))) && (symptom2.includes(key) || values.some((v) => symptom2.includes(v)))) {
        return true;
      }
    }
    return false;
  }
  /**
   * Get symptom suggestions based on partial input using CSV data
   */
  getSymptomSuggestions(query) {
    return this.csvData.searchSymptoms(query);
  }
};
var mlModel = new DogSymptomMLModel();

// server/services/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
  // Fail fast if missing
});
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}
var OpenAIService = class {
  /**
   * Generate conversational response from ML predictions
   */
  async generateChatResponse(symptoms2, predictions, followUpQuestion) {
    try {
      if (followUpQuestion) {
        return await this.handleFollowUpQuestion(symptoms2, predictions, followUpQuestion);
      }
      const systemPrompt = `You are a compassionate veterinary AI assistant helping dog owners understand their pet's symptoms. 
      Your role is to translate technical medical predictions into friendly, empathetic language that regular dog owners can understand.
      
      Guidelines:
      - Be empathetic and understanding - pet owners are worried about their dogs
      - Use plain English, avoid medical jargon
      - Always emphasize that this is guidance only and veterinary care is essential
      - For emergency conditions, stress urgency clearly but calmly
      - Provide practical next steps
      - Be reassuring when appropriate, but never downplay serious conditions
      
      Respond in a warm, professional tone as if speaking directly to a concerned dog owner.`;
      const topPredictions = predictions.slice(0, 3);
      const userPrompt = `The dog owner reported these symptoms: ${symptoms2.join(", ")}

      Based on our analysis, here are the most likely conditions:
      ${topPredictions.map(
        (p, i) => `${i + 1}. ${p.disease} (${Math.round(p.confidence * 100)}% confidence)
           - ${p.description}
           - Recommended action: ${p.action}`
      ).join("\n")}

      Please provide a compassionate, clear response that:
      1. Acknowledges the owner's concern
      2. Explains the most likely condition(s) in simple terms
      3. Provides clear next steps
      4. Includes any immediate care advice if appropriate
      5. Emphasizes the importance of professional veterinary care

      Keep the response concise but thorough (2-3 paragraphs).`;
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      if (process.env.NODE_ENV === "development") {
        console.log("OpenAI Response:", {
          content_length: response.choices[0].message.content?.length || 0,
          usage: response.usage
        });
      }
      return response.choices[0].message.content || "I apologize, but I'm unable to provide an assessment at this time. Please consult with your veterinarian directly.";
    } catch (error) {
      console.error("OpenAI API error:", error);
      return "I'm experiencing technical difficulties right now. For your dog's safety, please contact your veterinarian directly to discuss these symptoms.";
    }
  }
  /**
   * Handle follow-up questions from users
   */
  async handleFollowUpQuestion(symptoms2, predictions, question) {
    try {
      const systemPrompt = `You are a veterinary AI assistant answering follow-up questions about a dog's symptoms and diagnosis.
      
      Context: The dog has these symptoms: ${symptoms2.join(", ")}
      Most likely conditions: ${predictions.slice(0, 3).map((p) => `${p.disease} (${Math.round(p.confidence * 100)}%)`).join(", ")}
      
      Guidelines:
      - Answer the specific question asked
      - Stay within the context of the provided symptoms and diagnosis
      - Be helpful but always defer to professional veterinary advice for medical decisions
      - If asked about treatment, emphasize veterinary consultation
      - If asked about emergency signs, be clear and specific
      - Keep responses concise and actionable`;
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        max_tokens: 300,
        temperature: 0.6
      });
      return response.choices[0].message.content || "I recommend discussing this specific question with your veterinarian for the most accurate guidance.";
    } catch (error) {
      console.error("OpenAI API error:", error);
      return "I'm unable to answer that question right now. Please contact your veterinarian for specific guidance about your dog's condition.";
    }
  }
  /**
   * Generate empathetic response for emergency conditions
   */
  async generateEmergencyResponse(symptoms2, emergencyCondition) {
    const systemPrompt = `You are providing urgent guidance for a potential veterinary emergency. Be calm but clear about the urgency.`;
    const userPrompt = `A dog has symptoms: ${symptoms2.join(", ")} which may indicate ${emergencyCondition}. 
    Provide a calm but urgent response telling the owner to seek immediate veterinary care. Include what to do while getting to the vet.`;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.3
        // Lower temperature for more consistent emergency responses
      });
      return response.choices[0].message.content || `Based on these symptoms, please seek immediate veterinary care for ${emergencyCondition}. Contact your emergency vet or animal hospital right away.`;
    } catch (error) {
      console.error("OpenAI API error:", error);
      return `These symptoms require immediate veterinary attention. Please contact your emergency veterinarian or animal hospital right away.`;
    }
  }
};
var openaiService = new OpenAIService();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var symptoms = pgTable("symptoms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  keywords: text("keywords").array().notNull().default(sql`'{}'::text[]`)
});
var diseases = pgTable("diseases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  // 'low', 'medium', 'high', 'emergency'
  recommendedAction: text("recommended_action").notNull(),
  commonSymptoms: text("common_symptoms").array().notNull().default(sql`'{}'::text[]`)
});
var diagnoses = pgTable("diagnoses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symptoms: text("symptoms").array().notNull(),
  predictions: jsonb("predictions").notNull(),
  // Array of {disease, confidence, action}
  chatResponse: text("chat_response").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true
});
var insertDiseaseSchema = createInsertSchema(diseases).omit({
  id: true
});
var insertDiagnosisSchema = createInsertSchema(diagnoses).omit({
  id: true,
  createdAt: true
});
var diagnosisRequestSchema = z.object({
  symptoms: z.array(z.string()).min(1, "At least one symptom is required"),
  followUpQuestion: z.string().optional()
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/symptoms", async (req, res) => {
    try {
      const symptoms2 = await storage.getSymptoms();
      res.json(symptoms2);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });
  app2.get("/api/symptoms/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const symptoms2 = await storage.searchSymptoms(q);
      res.json(symptoms2);
    } catch (error) {
      console.error("Error searching symptoms:", error);
      res.status(500).json({ message: "Failed to search symptoms" });
    }
  });
  app2.post("/api/diagnose", async (req, res) => {
    try {
      const validationResult = diagnosisRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }
      const { symptoms: symptoms2, followUpQuestion } = validationResult.data;
      const predictions = await mlModel.predict(symptoms2);
      if (predictions.length === 0) {
        return res.status(400).json({
          message: "Unable to analyze the provided symptoms. Please ensure you've entered valid symptoms and try again."
        });
      }
      const chatResponse = await openaiService.generateChatResponse(
        symptoms2,
        predictions,
        followUpQuestion
      );
      const diagnosis = await storage.createDiagnosis({
        symptoms: symptoms2,
        predictions,
        chatResponse
      });
      const response = {
        chatResponse,
        predictions,
        followUpAvailable: true
      };
      res.json(response);
    } catch (error) {
      console.error("Error processing diagnosis:", error);
      res.status(500).json({
        message: "An error occurred while processing your request. Please try again."
      });
    }
  });
  app2.post("/api/follow-up", async (req, res) => {
    try {
      const { symptoms: symptoms2, predictions, question } = req.body;
      if (!symptoms2 || !Array.isArray(symptoms2) || !predictions || !Array.isArray(predictions) || !question) {
        return res.status(400).json({ message: "Missing required fields: symptoms, predictions, and question" });
      }
      const chatResponse = await openaiService.generateChatResponse(
        symptoms2,
        predictions,
        question
      );
      res.json({ chatResponse });
    } catch (error) {
      console.error("Error processing follow-up:", error);
      res.status(500).json({
        message: "An error occurred while processing your follow-up question. Please try again."
      });
    }
  });
  app2.get("/api/diseases", async (req, res) => {
    try {
      const diseases2 = await storage.getDiseases();
      res.json(diseases2);
    } catch (error) {
      console.error("Error fetching diseases:", error);
      res.status(500).json({ message: "Failed to fetch diseases" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
