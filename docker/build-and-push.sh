#!/bin/bash

# Build and push Docker images for Dockge deployment

echo "🏗️  Building Ezra Docker images..."
echo ""

# Get Docker Hub username or use GitHub Container Registry
read -p "Enter your Docker Hub username (or press Enter to use local images): " DOCKER_USER

if [ -z "$DOCKER_USER" ]; then
    echo "Building images locally..."
    IMAGE_PREFIX="ezra"
else
    echo "Building images for $DOCKER_USER..."
    IMAGE_PREFIX="$DOCKER_USER/ezra"
fi

# Build from parent directory
cd ..

# Build backend
echo ""
echo "📦 Building backend image..."
docker build -f backend/Dockerfile -t ${IMAGE_PREFIX}-backend:latest .

# Build frontend
echo ""
echo "📦 Building frontend image..."
docker build -f frontend/Dockerfile -t ${IMAGE_PREFIX}-frontend:latest .

# Push if using registry
if [ ! -z "$DOCKER_USER" ]; then
    echo ""
    echo "🚀 Pushing images to registry..."
    echo "Please login to Docker Hub if prompted:"
    docker login
    
    docker push ${IMAGE_PREFIX}-backend:latest
    docker push ${IMAGE_PREFIX}-frontend:latest
    
    echo ""
    echo "✅ Images pushed successfully!"
    echo ""
    echo "Update docker-compose.dockge.yml with your images:"
    echo "  backend image: ${IMAGE_PREFIX}-backend:latest"
    echo "  frontend image: ${IMAGE_PREFIX}-frontend:latest"
else
    echo ""
    echo "✅ Images built locally!"
    echo ""
    echo "Update docker-compose.dockge.yml with your images:"
    echo "  backend image: ${IMAGE_PREFIX}-backend:latest"
    echo "  frontend image: ${IMAGE_PREFIX}-frontend:latest"
fi