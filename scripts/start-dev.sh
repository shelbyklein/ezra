#!/bin/bash
# Development startup script for Ezra

echo "🚀 Starting Ezra development servers..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill any existing processes on ports
echo "${YELLOW}Cleaning up ports...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true
echo "${GREEN}✓ Ports cleaned${NC}"
echo ""

# Start both servers
echo "${YELLOW}Starting servers...${NC}"
npm run dev

echo ""
echo "${GREEN}✨ Servers are starting!${NC}"
echo "Frontend: http://localhost:5173 (or next available port)"
echo "Backend:  http://localhost:3001"