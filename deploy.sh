#!/bin/bash

# Dog Symptom Checker Deployment Script

set -e

echo "🐕 Starting Dog Symptom Checker deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your OPENAI_API_KEY"
    echo "   Get your API key from: https://platform.openai.com/api-keys"
    read -p "Press Enter after updating .env file..."
fi

# Check if OPENAI_API_KEY is set
if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo "⚠️  OPENAI_API_KEY not found in .env file"
    read -p "Enter your OpenAI API key: " api_key
    sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$api_key/" .env
fi

# Create logs directory
mkdir -p logs

# Build and start the application
echo "🔨 Building Docker containers..."
docker-compose build

echo "🚀 Starting Dog Symptom Checker..."
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for application to be ready..."
sleep 10

# Test if the application is running
if curl -f http://localhost:5000/api/symptoms > /dev/null 2>&1; then
    echo "✅ Dog Symptom Checker is now running!"
    echo ""
    echo "📱 Access your application at: http://localhost:5000"
    echo "🔍 View logs with: docker-compose logs -f"
    echo "⏹️  Stop with: docker-compose down"
    echo ""
    echo "🔧 The application includes:"
    echo "   • ML disease prediction from 24,000 veterinary records"
    echo "   • OpenAI-powered conversational AI responses"
    echo "   • Real-time symptom autocomplete"
    echo "   • Complete health assessment workflow"
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi