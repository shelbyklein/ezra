#!/bin/bash
# Ezra Quick Start - The simplest way to start Ezra

echo "🚀 Starting Ezra..."

# Check if .env exists, if not create from template
if [ ! -f .env ]; then
    if [ -f .env.docker ]; then
        cp .env.docker .env
        echo "📝 Created .env file - Please edit it with your Anthropic API key!"
        echo "   Run: nano .env"
        echo "   Then run this script again."
        exit 0
    fi
fi

# Check if Anthropic API key is configured
if grep -q "your-anthropic-api-key-here" .env; then
    echo "⚠️  Please configure your Anthropic API key in .env file"
    echo "   Run: nano .env"
    exit 1
fi

# Generate JWT secret if needed
if grep -q "your-secret-key-here" .env; then
    echo "🔐 Generating secure JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    else
        # Linux
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    fi
fi

# Create necessary directories
mkdir -p data uploads/avatars uploads/notebooks backups

# Start with docker-compose
docker-compose -f docker-compose.simple.yml up -d --build

echo ""
echo "✅ Ezra is starting!"
echo "📱 Access at: http://localhost:3005"
echo ""
echo "Useful commands:"
echo "  View logs:  docker-compose -f docker-compose.simple.yml logs -f"
echo "  Stop:       docker-compose -f docker-compose.simple.yml down"
echo "  Backup:     ./deploy.sh backup"