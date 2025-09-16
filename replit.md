# Dog Symptom Checker

## Overview

Dog Symptom Checker is a full-stack web application that uses machine learning and AI to help everyday dog owners assess their pet's health symptoms. The application provides conversational, empathetic responses to dog owners by combining real symptom data with AI-powered natural language processing. Users can input their dog's symptoms through an intuitive interface and receive both friendly chat-style explanations and detailed technical analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript using a modern component-based architecture:
- **UI Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

The frontend follows a modular component structure with reusable UI components, custom hooks for mobile responsiveness, and a clean separation between presentation and business logic.

### Backend Architecture
The backend uses Express.js with TypeScript in a RESTful API pattern:
- **Framework**: Express.js with TypeScript for type-safe server development
- **API Design**: RESTful endpoints for symptom search and diagnosis
- **Machine Learning Integration**: Custom ML model service that processes CSV symptom data
- **AI Integration**: OpenAI GPT integration for conversational responses
- **Data Processing**: CSV parser for real symptom-disease datasets

The backend architecture separates concerns through service layers, with dedicated modules for ML predictions, AI chat responses, and data storage.

### Data Storage Solutions
The application uses a hybrid storage approach:
- **Development**: In-memory storage with TypeScript interfaces for rapid prototyping
- **Production Ready**: Drizzle ORM configured with PostgreSQL schemas for scalable data persistence
- **Data Sources**: CSV files containing real dog symptom and disease data
- **Schema Design**: Well-defined TypeScript types for symptoms, diseases, diagnoses, and user data

### Authentication and Authorization
The application includes session-based authentication infrastructure:
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User Schema**: Database schema for user accounts with username/password authentication
- **Authorization**: Middleware-based protection for API endpoints

### AI and Machine Learning Integration
The core feature combines traditional ML with modern AI:
- **ML Model**: Custom algorithm that analyzes symptom patterns against real disease data from CSV files
- **Confidence Scoring**: Mathematical confidence calculation based on symptom matching
- **AI Layer**: OpenAI GPT integration that translates technical predictions into empathetic, conversational responses
- **Dual Output**: Both structured technical data and natural language explanations for different user needs

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database for production deployments via DATABASE_URL environment variable
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless) for cloud deployment

### AI and Machine Learning
- **OpenAI**: GPT-5 integration for conversational AI responses and follow-up question handling
- **Custom ML**: Proprietary symptom-disease matching algorithm using real veterinary data

### UI and Styling
- **Radix UI**: Comprehensive accessible component primitives for dialogs, forms, navigation
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Modern icon library for consistent iconography

### Development and Build Tools
- **Vite**: Fast build tool with React plugin and development server
- **TypeScript**: Full type safety across frontend and backend
- **Drizzle Kit**: Database migration and schema management tools
- **ESBuild**: Fast JavaScript bundler for production builds

### Data Processing
- **CSV Processing**: Custom parser for veterinary symptom datasets
- **Zod**: Runtime type validation for API requests and responses
- **Date-fns**: Date manipulation utilities for timestamp handling

The application is designed to be deployment-ready with Docker support and environment-based configuration for seamless transitions between development and production environments.