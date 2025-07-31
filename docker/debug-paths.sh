#!/bin/bash

# Debug script for Docker build issues

echo "🔍 Debugging Docker build paths..."
echo ""
echo "Current directory: $(pwd)"
echo "Parent directory contents:"
ls -la ../
echo ""
echo "Backend directory:"
ls -la ../backend/ | head -10
echo ""
echo "Frontend directory:"
ls -la ../frontend/ | head -10
echo ""
echo "Checking Dockerfiles:"
echo "Backend Dockerfile: $([ -f ../backend/Dockerfile ] && echo "✅ Found" || echo "❌ Not found")"
echo "Frontend Dockerfile: $([ -f ../frontend/Dockerfile ] && echo "✅ Found" || echo "❌ Not found")"
echo ""
echo "Docker info:"
docker version --format 'Client: {{.Client.Version}}, Server: {{.Server.Version}}'
echo ""
echo "Docker Compose version:"
docker compose version 2>/dev/null || docker-compose version
echo ""
echo "If you see '/opt/stacks' in the error, you might be using:"
echo "- Portainer with a specific working directory"
echo "- A Docker deployment tool that changes paths"
echo "- A symbolic link or volume mount"