#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting World Monitor Environment Setup..."

# Step 1: Install standard dependencies
echo "📦 Installing npm dependencies..."
npm install

# Step 2: Start the application in development mode
echo "🔥 Starting the development server..."
npm run dev
