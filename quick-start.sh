#!/bin/bash
# Ezra Quick Start Script

echo "🚀 Ezra Quick Start"
echo "=================="

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if this is first run
if [ ! -f ".env.configured" ]; then
    echo ""
    echo "📝 First-time setup detected!"
    echo ""
    
    # Get Anthropic API key
    read -p "Enter your Anthropic API key: " ANTHROPIC_KEY
    if [ -z "$ANTHROPIC_KEY" ]; then
        echo "❌ Anthropic API key is required!"
        exit 1
    fi
    
    # Generate JWT secret
    echo "🔐 Generating secure JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Create configured docker-compose
    cat > docker-compose.configured.yml << EOF
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: ./backend/Dockerfile
    container_name: ezra-backend
    restart: unless-stopped
    ports:
      - "5001:5001"
    environment:
      JWT_SECRET: "$JWT_SECRET"
      ANTHROPIC_API_KEY: "$ANTHROPIC_KEY"
      NODE_ENV: production
      PORT: 5001
      DATABASE_URL: /app/data/ezra.db
      JWT_EXPIRES_IN: 7d
      FRONTEND_URL: http://localhost:3005
      API_RATE_LIMIT_WINDOW_MS: 900000
      API_RATE_LIMIT_MAX: 100
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    networks:
      - ezra-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: ./frontend/Dockerfile
    container_name: ezra-frontend
    restart: unless-stopped
    ports:
      - "3005:80"
    environment:
      VITE_API_URL: /api
    depends_on:
      - backend
    networks:
      - ezra-network

networks:
  ezra-network:
    driver: bridge
EOF

    # Create marker file
    touch .env.configured
    
    echo "✅ Configuration saved!"
fi

# Start or restart services
echo ""
echo "🐳 Starting Ezra with Docker Compose..."
echo ""

docker-compose -f docker-compose.configured.yml up -d --build

echo ""
echo "✅ Ezra is starting up!"
echo ""
echo "📱 Access your application at:"
echo "   Frontend: http://localhost:3005"
echo "   Backend API: http://localhost:5001"
echo ""
echo "📊 Useful commands:"
echo "   View logs:    docker-compose -f docker-compose.configured.yml logs -f"
echo "   Stop Ezra:    docker-compose -f docker-compose.configured.yml down"
echo "   Restart:      docker-compose -f docker-compose.configured.yml restart"
echo ""