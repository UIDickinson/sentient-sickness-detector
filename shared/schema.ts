import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const symptoms = pgTable("symptoms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  keywords: text("keywords").array().notNull().default(sql`'{}'::text[]`),
});

export const diseases = pgTable("diseases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'emergency'
  recommendedAction: text("recommended_action").notNull(),
  commonSymptoms: text("common_symptoms").array().notNull().default(sql`'{}'::text[]`),
});

export const diagnoses = pgTable("diagnoses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symptoms: text("symptoms").array().notNull(),
  predictions: jsonb("predictions").notNull(), // Array of {disease, confidence, action}
  chatResponse: text("chat_response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
});

export const insertDiseaseSchema = createInsertSchema(diseases).omit({
  id: true,
});

export const insertDiagnosisSchema = createInsertSchema(diagnoses).omit({
  id: true,
  createdAt: true,
});

export const diagnosisRequestSchema = z.object({
  symptoms: z.array(z.string()).min(1, "At least one symptom is required"),
  followUpQuestion: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Symptom = typeof symptoms.$inferSelect;
export type Disease = typeof diseases.$inferSelect;
export type Diagnosis = typeof diagnoses.$inferSelect;
export type InsertDiagnosis = z.infer<typeof insertDiagnosisSchema>;
export type DiagnosisRequest = z.infer<typeof diagnosisRequestSchema>;

export interface Prediction {
  disease: string;
  confidence: number;
  description: string;
  action: string;
  severity: string;
}

export interface DiagnosisResponse {
  chatResponse: string;
  predictions: Prediction[];
  followUpAvailable: boolean;
}
