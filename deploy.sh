#!/bin/bash

# Deployment script for AM | PM Lounge Reservation System

echo "🚀 Deploying AM | PM Lounge Reservation System to Vercel..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "☁️ Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "  1. Set up ALL environment variables in Vercel dashboard"
echo "  2. Ensure Appwrite database is accessible from production"
echo "  3. Update EmailJS templates if needed"
echo "  4. Configure custom domain if needed"
echo "  5. Update the main restaurant site with this URL"