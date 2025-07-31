# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY tsconfig.json ./
COPY frontend/package*.json ./frontend/
COPY shared/package*.json ./shared/

# Install all dependencies
RUN npm ci

# Copy source code
COPY shared ./shared
COPY frontend ./frontend

# Build shared types first
WORKDIR /app/shared
RUN npm run build

# Build frontend
WORKDIR /app/frontend

# Set production API URL (will be overridden by env at runtime)
ENV VITE_API_URL=/api

RUN npm run build

# Production stage - nginx
FROM nginx:alpine

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Add script to inject runtime environment variables
COPY frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]