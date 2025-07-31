#!/bin/bash
# Ezra Quick Start - Redirects to the new Docker setup

echo "🚀 Starting Ezra..."
echo ""
echo "📁 Docker configuration has moved to the docker/ directory"
echo ""

# Check if we're in the docker directory already
if [ -f "docker-compose.yml" ] && [ -f ".env.example" ]; then
    # We're already in the docker directory
    ./quick-start.sh
else
    # Redirect to docker directory
    if [ -d "docker" ]; then
        echo "Redirecting to docker directory..."
        cd docker && ./quick-start.sh
    else
        echo "❌ Error: docker directory not found!"
        echo "   Make sure you're in the Ezra project root directory"
        exit 1
    fi
fi