#!/bin/bash

# Build Docker images locally for Dockge deployment

echo "🏗️  Building Ezra images for Dockge..."
echo ""
echo "This script will build the images on your Docker host"
echo "so Dockge can use them without accessing source code."
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Build backend
echo "📦 Building backend image..."
docker build -f backend/Dockerfile -t ezra-backend:latest . || {
    echo "❌ Backend build failed!"
    exit 1
}

# Build frontend
echo ""
echo "📦 Building frontend image..."
docker build -f frontend/Dockerfile -t ezra-frontend:latest . || {
    echo "❌ Frontend build failed!"
    exit 1
}

echo ""
echo "✅ Images built successfully!"
echo ""
echo "🚀 Next steps for Dockge:"
echo "1. In Dockge, create a new stack called 'ezra'"
echo "2. Copy the contents of docker-compose.dockge-local.yml"
echo "3. Update the environment variables:"
echo "   - JWT_SECRET: Generate with 'openssl rand -base64 32'"
echo "   - ANTHROPIC_API_KEY: Your API key from anthropic.com"
echo "4. Deploy the stack"
echo ""
echo "📝 Note: The images are now available locally as:"
echo "   - ezra-backend:latest"
echo "   - ezra-frontend:latest"