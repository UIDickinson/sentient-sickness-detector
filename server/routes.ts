import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mlModel } from "./services/ml-model";
import { openaiService } from "./services/openai";
import { diagnosisRequestSchema, type DiagnosisResponse } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all symptoms for autocomplete
  app.get("/api/symptoms", async (req, res) => {
    try {
      const symptoms = await storage.getSymptoms();
      res.json(symptoms);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });

  // Search symptoms for autocomplete
  app.get("/api/symptoms/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const symptoms = await storage.searchSymptoms(q);
      res.json(symptoms);
    } catch (error) {
      console.error("Error searching symptoms:", error);
      res.status(500).json({ message: "Failed to search symptoms" });
    }
  });

  // Main diagnosis endpoint
  app.post("/api/diagnose", async (req, res) => {
    try {
      // Validate request body
      const validationResult = diagnosisRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      const { symptoms, followUpQuestion } = validationResult.data;

      // Get ML predictions
      const predictions = await mlModel.predict(symptoms);
      
      if (predictions.length === 0) {
        return res.status(400).json({ 
          message: "Unable to analyze the provided symptoms. Please ensure you've entered valid symptoms and try again." 
        });
      }

      // Generate conversational AI response
      const chatResponse = await openaiService.generateChatResponse(
        symptoms, 
        predictions, 
        followUpQuestion
      );

      // Save diagnosis
      const diagnosis = await storage.createDiagnosis({
        symptoms,
        predictions,
        chatResponse
      });

      const response: DiagnosisResponse = {
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

  // Follow-up question endpoint
  app.post("/api/follow-up", async (req, res) => {
    try {
      const { symptoms, predictions, question } = req.body;

      if (!symptoms || !Array.isArray(symptoms) || !predictions || !Array.isArray(predictions) || !question) {
        return res.status(400).json({ message: "Missing required fields: symptoms, predictions, and question" });
      }

      const chatResponse = await openaiService.generateChatResponse(
        symptoms,
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

  // Get diseases for reference
  app.get("/api/diseases", async (req, res) => {
    try {
      const diseases = await storage.getDiseases();
      res.json(diseases);
    } catch (error) {
      console.error("Error fetching diseases:", error);
      res.status(500).json({ message: "Failed to fetch diseases" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
