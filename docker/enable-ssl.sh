#!/bin/bash

# Enable SSL for existing Ezra installation

echo "🔒 Enabling SSL/HTTPS for Ezra..."
echo ""

# Generate certificate if it doesn't exist
if [ ! -f ../ssl/fullchain.pem ]; then
    echo "📜 Generating self-signed SSL certificate..."
    ./generate-ssl-cert.sh
    echo ""
fi

# Stop existing services
echo "🛑 Stopping current services..."
docker compose down

echo ""
echo "🚀 Starting with SSL enabled..."

# Get current profiles from docker ps or use default
CURRENT_PROFILES=$(docker compose ps --services 2>/dev/null | grep -E "(postgres|pgadmin|backup)" | tr '\n' ' ')

if [ -z "$CURRENT_PROFILES" ]; then
    # Just start with SSL
    docker compose --profile ssl up -d
else
    # Add SSL to existing profiles
    echo "Detected profiles: $CURRENT_PROFILES"
    docker compose --profile ssl $(echo $CURRENT_PROFILES | sed 's/\([^ ]*\)/--profile \1/g') up -d
fi

echo ""
echo "✅ SSL enabled!"
echo ""
echo "📱 Access your application at:"
echo "   https://localhost"
echo ""
echo "⚠️  Your browser will show a security warning (self-signed certificate)"
echo "   This is normal for development. Click 'Advanced' and 'Proceed to localhost'"
echo ""
echo "To disable SSL and return to HTTP:"
echo "   docker compose down"
echo "   docker compose up -d"