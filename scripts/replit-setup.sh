#!/bin/bash
# Replit setup script for Ezra

echo "🚀 Setting up Ezra for Replit deployment..."

# Create data directory for SQLite database
echo "📁 Creating data directory..."
mkdir -p /home/runner/ezra-data

# Check if .env exists, if not copy from production template
if [ ! -f .env ]; then
    echo "📝 Creating .env file from production template..."
    cp .env.production .env
    echo "⚠️  Please update the .env file with your actual secrets!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Ensure TypeScript is available at root level for Replit
echo "📦 Installing TypeScript at root level..."
npm install --save-dev typescript knex

# Build the application
echo "🔨 Building application..."
npm run build:prod

echo "✅ Setup complete! Run 'npm run start:prod' to start the server."