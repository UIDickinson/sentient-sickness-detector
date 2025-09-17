# Dog Symptom Checker

AI-powered veterinary assessment tool that helps dog owners understand their pet's symptoms using machine learning predictions and conversational AI responses.

## System Architecture

This application uses a **CSV dataset** of disease-symptom records loaded from attached_assets. The exact size depends on the loaded CSV file. The ML engine predicts diseases based on symptom combinations, and OpenAI GPT-3.5-turbo translates technical predictions into empathetic, easy-to-understand language for dog owners.

## File Structure & Purpose

### Root Configuration
- **`package.json`** - Node.js dependencies and scripts. Contains all frontend/backend packages including React, Express, OpenAI SDK, TanStack Query, and shadcn/ui components
- **`tsconfig.json`** - TypeScript configuration with strict type checking and path aliases (@/ for client/src, @shared for shared types)
- **`tailwind.config.ts`** - Tailwind CSS configuration with shadcn/ui theming, custom colors, and dark mode support
- **`vite.config.ts`** - Vite bundler configuration with React plugin and asset aliases (DO NOT MODIFY - pre-configured for Replit)

### Server (Backend)
- **`server/index.ts`** - Express server entry point. Starts on PORT (default 5000) with JSON parsing, logging middleware, and API routes
- **`server/routes.ts`** - Main API endpoints:
  - `GET /api/symptoms/search?q={query}` - Autocomplete search in symptom database
  - `POST /api/diagnose` - Main diagnosis endpoint (symptoms → ML predictions + AI response)
  - `POST /api/follow-up` - Handle follow-up questions about diagnosis
- **`server/storage.ts`** - In-memory storage interface and implementation. Handles symptom search and data retrieval
- **`server/vite.ts`** - Vite development server integration (DO NOT MODIFY)

### Server/Data
- **`server/data/csv-parser.ts`** - **CSV DATA LOADER** - Loads and processes the CSV dataset from attached_assets/symtomdata_1757954561163.csv. Includes inline fallback data if CSV fails to load
- **`server/data/symptoms.ts`** - Static symptom definitions (not actively used - csv-parser.ts has its own fallback)
- **`server/data/diseases.ts`** - Static disease definitions (not actively used - csv-parser.ts has its own fallback)

### Data Source
- **`attached_assets/symtomdata_1757954561163.csv`** - **CORE DATASET** - CSV data mapping symptoms to diseases. This is the primary data source loaded by csv-parser.ts

### Server/Services  
- **`server/services/ml-model.ts`** - **MACHINE LEARNING ENGINE** - Calculates disease probabilities from symptom matches using statistical analysis of CSV data
- **`server/services/openai.ts`** - **AI CONVERSATION ENGINE** - OpenAI integration that converts technical predictions into empathetic responses for dog owners

### Shared Types
- **`shared/schema.ts`** - **TYPE DEFINITIONS** - Shared TypeScript interfaces and Zod schemas for symptoms, predictions, and API requests. Critical for frontend-backend consistency

### Client (Frontend)

#### Client/Src
- **`client/src/main.tsx`** - React app entry point with TanStack Query provider
- **`client/src/App.tsx`** - Main app component with routing (currently single-page)
- **`client/src/index.css`** - Global CSS with Tailwind directives and custom CSS variables for theming

#### Client/Src/Components
- **`client/src/components/symptom-input.tsx`** - **MAIN INTERFACE** - Symptom selection with autocomplete, tagging, and search functionality
- **`client/src/components/chat-interface.tsx`** - **CHAT UI** - Displays AI responses and handles follow-up questions in chat-bubble format
- **`client/src/components/detailed-predictions.tsx`** - **ML RESULTS** - Shows technical predictions with confidence scores, severity levels, and recommendations
- **`client/src/components/header.tsx`** - App header with title and logo
- **`client/src/components/footer.tsx`** - App footer with disclaimers

#### Client/Src/Components/UI (shadcn/ui Components)
Pre-built UI components from shadcn/ui. **Modify these to change app appearance:**
- **`button.tsx`**, **`input.tsx`**, **`card.tsx`** - Core input/display components
- **`form.tsx`**, **`label.tsx`** - Form handling components (used in symptom input)
- **`toast.tsx`**, **`toaster.tsx`** - Notification system for errors/success messages
- **`skeleton.tsx`** - Loading state components
- **All other .tsx files** - Additional UI components available but not currently used

#### Client/Src/Lib
- **`client/src/lib/queryClient.ts`** - **API CONFIGURATION** - TanStack Query setup with default fetcher and error handling
- **`client/src/lib/api.ts`** - **API INTERFACE** - Type-safe API calls to backend endpoints
- **`client/src/lib/utils.ts`** - Utility functions (className merging, etc.)

#### Client/Src/Hooks
- **`client/src/hooks/use-toast.ts`** - Toast notification hook for user feedback

#### Client/Src/Pages
- **`client/src/pages/home.tsx`** - **MAIN PAGE** - Orchestrates symptom input, diagnosis results, and chat interface

## Key Features

### ✅ Fully Implemented
- **Symptom Autocomplete** - Real-time search of symptoms from veterinary dataset
- **ML Disease Prediction** - Statistical analysis of veterinary records produces confidence scores
- **Conversational AI** - GPT-3.5-turbo translates technical predictions to friendly language
- **Chat Interface** - Empathetic responses with follow-up question capability
- **Detailed Predictions** - Toggle between simple and technical views
- **CSV Data Integration** - Based on disease-symptom relationship data

### 🔄 Available for Extension
- **Advanced ML Pipeline** - Enhanced model training and persistence
- **Docker Containerization** - Easy deployment with docker-compose
- **Additional UI Components** - Many shadcn/ui components available but unused

### ❌ Intentionally Excluded
- **Veterinarian Mode** - Professional interface with detailed medical terminology
- **User Accounts & History** - Personal health tracking over time

*These features were removed from scope per user requirements to focus on core functionality.*

## Manual Adjustment Guide

### To Modify Symptoms/Diseases:
- Edit **`attached_assets/symtomdata_1757954561163.csv`** - Add/remove symptom-disease records (CSV format: disease,symptom1,symptom2,...)
- Or modify inline fallback data in **`server/data/csv-parser.ts`** (loadFallbackData method)
- Restart server to reload CSV data

### To Adjust ML Predictions:
- Modify **`server/services/ml-model.ts`** - Change confidence calculation algorithms
- Update **`shared/schema.ts`** if adding new prediction fields

### To Change AI Responses:
- Edit **`server/services/openai.ts`** - Modify system prompts for different tone/style
- Adjust token limits or temperature for response variation

### To Update UI/Styling:
- Modify **`client/src/components/*.tsx`** - Change component behavior
- Edit **`client/src/components/ui/*.tsx`** - Customize shadcn components
- Update **`tailwind.config.ts`** - Add custom colors/themes
- Modify **`client/src/index.css`** - Global styling changes

### To Add New API Endpoints:
- Add routes in **`server/routes.ts`**
- Update **`client/src/lib/api.ts`** for frontend access
- Add types in **`shared/schema.ts`** for type safety

## Environment Variables
- **`OPENAI_API_KEY`** - Required for conversational AI responses

## Development Commands
- **`npm run dev`** - Start development server (frontend + backend on PORT, default 5000)
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build

## Data Flow
1. User types symptoms → Frontend autocomplete queries **`/api/symptoms/search`**
2. User clicks "Get AI Assessment" → **`/api/diagnose`** processes symptoms
3. **ML Model** analyzes symptoms against veterinary dataset → generates predictions
4. **OpenAI Service** converts predictions → empathetic response
5. **Frontend** displays both conversational AI response and detailed predictions
6. User can ask follow-up questions → **`/api/follow-up`** with context

## Testing & Data Attributes
The application includes data-testid attributes on interactive elements for testing:
- `data-testid="input-symptoms"` - Main symptom input field
- `data-testid="autocomplete-dropdown"` - Autocomplete suggestions
- `data-testid="button-diagnose"` - Main diagnosis button
- `data-testid="chat-message-ai"` - AI response display
- `data-testid="button-view-details"` - Technical details toggle

Manual testing can verify the complete user journey from symptom entry to AI diagnosis.

## Potential Issues & Deployment Checklist

Refer to this list to avoid common problems when running or deploying the app:

- **Replit Dependencies:** Ensure all Replit-specific plugins and configuration are removed from your codebase and dependencies.
- **Environment Variables:** The app requires `FIREWORKS_API_KEY` for AI features. Make sure all required environment variables are set in your local or deployment environment.
- **Asset Paths:** Images (e.g., `dobby64.png`, `iacpKDQc_400x400.jpg`) must exist at the specified paths. Broken links will result in missing images.
- **Port Configuration:** The backend runs on port 5000 by default. Adjust if another process uses this port or if your frontend expects a different port.
- **Build Scripts:** Use the correct commands (`npm run dev`, `npm run build`, `npm run preview`) for development and production.
- **API Keys and External Services:** AI features depend on external services (Fireworks AI). Network issues or invalid keys will break these features.
- **TypeScript/Compile Errors:** Unresolved TypeScript or lint errors will prevent the app from building or running.
- **Data Source:** The CSV file for symptoms/diseases must be present and correctly formatted.
- **Docker/Deployment:** If deploying with Docker, ensure your Dockerfile and docker-compose.yml are up to date and compatible with your environment.