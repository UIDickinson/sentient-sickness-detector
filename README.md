My contribution for Sentient Community.

This application uses a **CSV dataset** of disease-symptom records loaded from attached_assets. The exact size depends on the loaded CSV file. The ML engine predicts diseases based on symptom combinations, and dobby-unhinged-llama-3-3-70b-new translates technical predictions into empathetic, easy-to-understand language for dog owners.

## Key Features

### ✅ Fully Implemented
- **Symptom Autocomplete** - Real-time search of symptoms from veterinary dataset
- **ML Disease Prediction** - Statistical analysis of veterinary records produces confidence scores
- **Conversational AI** - dobby-unhinged-llama-3-3-70b-new translates technical predictions to friendly language
- **Chat Interface** - Empathetic responses with follow-up question capability
- **Detailed Predictions** - Toggle between simple and technical views
- **CSV Data Integration** - Based on disease-symptom relationship data

### 🔄 Available for Extension
- **Advanced ML Pipeline** - Enhanced model training and persistence
- **Docker Containerization** - Easy deployment with docker-compose
- **Additional UI Components** - Many shadcn/ui components available but unused

### Further ideas that can be added to this project
- **Veterinarian Mode** - Professional interface with detailed medical terminology
- **User Accounts & History** - Personal health tracking over time

## Local Development & Deployment Guide

### Local Development with npm

1. **Prerequisites**
   ```bash
   # Ensure you have Node.js 18+ installed
   node --version
   npm --version
   ```

2. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd dog-symptom-checker
   npm install
   ```

3. **Environment Variables**
   ```bash
   # Create a .env file in the root directory
   FIREWORKS_API_KEY=your_fireworks_api_key_here
   DATABASE_URL=postgresql://localhost/doghealth (optional)
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5000`

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### Deploy to Render

1. **Prepare Your Repository**
   - Push your code to GitHub
   - Ensure your `package.json` has the correct scripts (already configured)

2. **Create Render Account**
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub account

3. **Deploy Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     ```
     Environment: Node
     Build Command: npm run build
     Start Command: npm start
     Node Version: 18
     ```

4. **Environment Variables**
   Add these in Render's Environment tab:
   ```
   NODE_ENV=production
   FIREWORKS_API_KEY=your_fireworks_api_key_here
   ```

5. **Auto-Deploy**
   - Render will automatically redeploy when you push to your main branch
   - Your app will be available at `https://your-app-name.onrender.com`

### Deployment Notes

- The app serves both frontend and backend from a single Express server
- React static files are served from `/dist/public/` in production
- API endpoints are available at `/api/*` routes
- The server automatically handles React routing with a catch-all route
