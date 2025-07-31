#!/bin/bash

# Generate self-signed SSL certificate for development

echo "🔐 Generating self-signed SSL certificate for development..."
echo ""

# Create ssl directory if it doesn't exist
mkdir -p ../ssl

# Generate private key and certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ../ssl/privkey.pem \
    -out ../ssl/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Development/OU=Ezra/CN=localhost"

echo ""
echo "✅ SSL certificate generated!"
echo "   Location: ../ssl/"
echo ""
echo "⚠️  This is a self-signed certificate for development only."
echo "   Your browser will show a security warning - this is normal."
echo "   Click 'Advanced' and 'Proceed to localhost' to continue."