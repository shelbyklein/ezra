#!/bin/bash

# Fix for docker-compose on systems with Python 3.12
# This installs the python3-setuptools package which provides distutils

echo "🔧 Fixing docker-compose for Python 3.12..."
echo ""

# Check if running on Ubuntu/Debian
if command -v apt-get &> /dev/null; then
    echo "📦 Installing python3-setuptools to provide distutils module..."
    sudo apt-get update
    sudo apt-get install -y python3-setuptools
    echo "✅ Fix applied!"
    echo ""
    echo "Alternative: Use Docker Compose v2 (recommended):"
    echo "  docker compose (instead of docker-compose)"
elif command -v dnf &> /dev/null; then
    # Fedora/RHEL
    echo "📦 Installing python3-setuptools..."
    sudo dnf install -y python3-setuptools
    echo "✅ Fix applied!"
else
    echo "⚠️  Manual fix required for your system"
    echo ""
    echo "Options:"
    echo "1. Install python3-setuptools package for your distribution"
    echo "2. Use Docker Compose v2: 'docker compose' instead of 'docker-compose'"
    echo "3. Install Docker Desktop which includes Compose v2"
fi

echo ""
echo "🚀 You can now run ./quick-start.sh"