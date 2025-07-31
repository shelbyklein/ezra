#!/bin/bash

# Ezra Quick Start Script
# This script provides an interactive setup for Docker deployment

set -e

echo "🚀 Ezra Quick Start Setup"
echo "========================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check for Docker Compose (v2 or v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    echo "✅ Using Docker Compose v2"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo "✅ Using Docker Compose v1"
else
    echo "❌ Docker Compose is not installed."
    echo "   Install Docker Desktop (includes Compose v2) or Docker Compose plugin"
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env exists
if [ -f .env ]; then
    echo "📁 Found existing .env file"
    read -p "Do you want to reconfigure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing configuration..."
    else
        rm .env
    fi
fi

# Configure if .env doesn't exist
if [ ! -f .env ]; then
    echo "Let's configure your Ezra installation..."
    echo ""
    
    # Copy example env
    cp .env.example .env
    
    # JWT Secret
    echo "🔐 Generating secure JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    
    # Anthropic API Key
    echo ""
    echo "🤖 Anthropic API Key (for AI features)"
    echo "   Get your key from: https://console.anthropic.com"
    read -p "   Enter your Anthropic API key (or press Enter to skip): " ANTHROPIC_KEY
    if [ ! -z "$ANTHROPIC_KEY" ]; then
        sed -i.bak "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$ANTHROPIC_KEY/" .env
    fi
    
    # Database choice
    echo ""
    echo "💾 Database Selection"
    echo "   1) SQLite (Simple, good for personal use)"
    echo "   2) PostgreSQL (Scalable, recommended for teams)"
    read -p "   Choose database (1 or 2) [1]: " DB_CHOICE
    
    if [ "$DB_CHOICE" = "2" ]; then
        echo ""
        echo "🐘 PostgreSQL Configuration"
        read -p "   Database password [auto-generate]: " PG_PASSWORD
        if [ -z "$PG_PASSWORD" ]; then
            PG_PASSWORD=$(openssl rand -base64 16)
            echo "   Generated password: $PG_PASSWORD"
        fi
        
        # Update .env for PostgreSQL
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://ezra_user:$PG_PASSWORD@postgres:5432/ezra_db|" .env
        sed -i.bak "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$PG_PASSWORD/" .env
        
        # Ask about pgAdmin
        read -p "   Include pgAdmin for database management? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            DOCKER_PROFILE="pgadmin"
        else
            DOCKER_PROFILE="postgres"
        fi
    else
        DOCKER_PROFILE=""
    fi
    
    # Backup configuration
    echo ""
    read -p "📦 Enable automated daily backups? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        if [ -z "$DOCKER_PROFILE" ]; then
            DOCKER_PROFILE="backup"
        else
            DOCKER_PROFILE="$DOCKER_PROFILE backup"
        fi
    fi
    
    # SSL configuration
    echo ""
    echo "🔒 SSL/HTTPS Configuration"
    echo "   Note: Required for password fields in modern browsers"
    read -p "   Enable HTTPS with self-signed certificate? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        # Generate SSL certificate if it doesn't exist
        if [ ! -f ../ssl/fullchain.pem ]; then
            echo "   Generating self-signed certificate..."
            ./generate-ssl-cert.sh
        fi
        
        if [ -z "$DOCKER_PROFILE" ]; then
            DOCKER_PROFILE="ssl"
        else
            DOCKER_PROFILE="$DOCKER_PROFILE ssl"
        fi
        SSL_ENABLED=true
    fi
    
    # Clean up backup files
    rm -f .env.bak
    
    echo ""
    echo "✅ Configuration complete!"
fi

# Start services
echo ""
echo "🐳 Starting Ezra..."
echo ""

if [ -z "$DOCKER_PROFILE" ]; then
    $DOCKER_COMPOSE up -d --build
else
    $DOCKER_COMPOSE --profile $DOCKER_PROFILE up -d --build
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
if $DOCKER_COMPOSE ps | grep -q "Up"; then
    echo ""
    echo "✅ Ezra is running!"
    echo ""
    echo "📱 Access your application at:"
    if [[ "$SSL_ENABLED" == "true" ]]; then
        echo "   Frontend: https://localhost"
        echo "   Backend API: https://localhost/api"
        echo ""
        echo "   ⚠️  Your browser will show a security warning (self-signed certificate)"
        echo "   Click 'Advanced' and 'Proceed to localhost' to continue"
    else
        echo "   Frontend: http://localhost:3005"
        echo "   Backend API: http://localhost:6001"
    fi
    
    if [[ $DOCKER_PROFILE == *"pgadmin"* ]]; then
        echo "   pgAdmin: http://localhost:5050"
        echo "     Email: admin@ezra.local"
        echo "     Password: admin"
    fi
    
    echo ""
    echo "🔑 Default test user:"
    echo "   Email: test@example.com"
    echo "   Password: testpass123"
    echo ""
    echo "📊 Useful commands:"
    echo "   View logs:    $DOCKER_COMPOSE logs -f"
    echo "   Stop Ezra:    $DOCKER_COMPOSE down"
    echo "   Restart:      $DOCKER_COMPOSE restart"
    
    if [ ! -z "$DOCKER_PROFILE" ]; then
        echo ""
        echo "   Note: Using profile(s): $DOCKER_PROFILE"
        echo "   To restart with same profile: $DOCKER_COMPOSE --profile $DOCKER_PROFILE up -d"
    fi
else
    echo ""
    echo "❌ Something went wrong. Check the logs:"
    echo "   $DOCKER_COMPOSE logs"
fi