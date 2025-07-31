# Backend Dockerfile
FROM node:18-alpine AS builder

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY tsconfig.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install all dependencies
RUN npm ci

# Copy source code
COPY shared ./shared
COPY backend ./backend

# Build shared types first
WORKDIR /app/shared
RUN npm run build

# Build backend
WORKDIR /app/backend
RUN npm run build

# Production stage
FROM node:18-alpine

RUN apk add --no-cache sqlite

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/shared/package.json ./shared/
COPY backend/knexfile.ts ./backend/
COPY backend/migrations ./backend/migrations

# Create necessary directories
RUN mkdir -p /app/data /app/uploads/avatars /app/uploads/notebooks

WORKDIR /app/backend

# Expose port
EXPOSE 6001

# Run migrations and start server
CMD ["sh", "-c", "npx knex migrate:latest && node dist/index.js"]