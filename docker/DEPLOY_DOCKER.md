# Docker Deployment Guide for Ezra

This guide will walk you through deploying Ezra using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- A server or local machine with at least 2GB RAM
- Domain name (optional, for production)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/shelbyklein/ezra.git
cd ezra
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your settings
nano .env
```

Required environment variables:
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `JWT_SECRET`: A secure random string (generate with `openssl rand -base64 32`)

### 3. Build and Start the Application
```bash
# Build and start all services
docker-compose up -d

# Or build fresh (useful after code changes)
docker-compose up -d --build
```

### 4. Access the Application
- Frontend: http://localhost:3005
- Backend API: http://localhost:6001

## Production Deployment

### 1. Using PostgreSQL Instead of SQLite

To use PostgreSQL in production:

```bash
# Start with PostgreSQL profile
docker-compose --profile postgres up -d

# Update your .env to use PostgreSQL
DATABASE_URL=postgresql://ezra_user:your-postgres-password@postgres:5432/ezra_db
```

### 2. SSL/HTTPS Setup with Traefik

For production, the docker-compose.yml includes Traefik labels for automatic SSL/TLS:

```yaml
# Already configured in docker-compose.yml
services:
  frontend:
    networks:
      - ezra-network
      - traefik-network  # External network for Traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ezra.rule=Host(`ezra.yourdomain.com`)"
      - "traefik.http.routers.ezra.entrypoints=websecure"
      - "traefik.http.routers.ezra.tls=true"
      - "traefik.http.routers.ezra.tls.certresolver=letsencrypt"
      - "traefik.http.services.ezra.loadbalancer.server.port=80"
      - "traefik.docker.network=traefik-network"
```

**Important**: Ensure the `traefik-network` exists before deploying:
```bash
docker network create traefik-network
```

### 3. Backup Strategy

Enable automatic backups:

```bash
# Start with backup profile
docker-compose --profile backup up -d

# Manual backup
docker-compose exec backend sh -c "sqlite3 /app/data/ezra.db .dump > /backups/ezra-$(date +%Y%m%d-%H%M%S).sql"
```

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Container Shell
```bash
# Backend shell
docker-compose exec backend sh

# Run migrations manually
docker-compose exec backend npx knex migrate:latest
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Environment Variables

### Backend Environment
- `NODE_ENV`: Set to "production"
- `PORT`: Backend port (default: 6001)
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration (default: 7d)
- `ANTHROPIC_API_KEY`: Your Anthropic API key

### Frontend Environment
- `VITE_API_URL`: Backend API URL (default: /api)

## Volumes and Data Persistence

The following directories are persisted:
- `./data`: SQLite database
- `./uploads`: User uploads (avatars, images)
- `./backups`: Database backups (if backup profile enabled)

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps
```

### Container Health Check Issues
If the frontend container shows as unhealthy in Traefik:
- The health check has been temporarily disabled due to wget issues in Alpine Linux
- The container still works correctly despite no health check
- To verify nginx is running: `docker exec ezra-frontend curl -I http://localhost:80`

### Database Issues
```bash
# Check database file permissions
docker-compose exec backend ls -la /app/data/

# Run migrations manually
docker-compose exec backend npx knex migrate:latest
```

### Port Conflicts
If ports 3005 or 6001 are already in use:
```yaml
# In docker-compose.yml, change ports:
services:
  frontend:
    ports:
      - "8080:80"  # Change 3005 to 8080
  backend:
    ports:
      - "5002:6001"  # Change 6001 to 5002
```

Or use the alternative ports profile:
```bash
docker-compose --profile alt-ports up -d
```

### Memory Issues
Add memory limits if needed:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

## Advanced Configuration

### Custom Nginx Configuration
Mount a custom nginx config:
```yaml
services:
  frontend:
    volumes:
      - ./custom-nginx.conf:/etc/nginx/conf.d/default.conf
```

### Health Monitoring
The backend includes a health check endpoint:
```bash
curl http://localhost:6001/api/health
```

### Scaling
Scale the backend horizontally:
```bash
docker-compose up -d --scale backend=3
```
Note: Requires a load balancer and session persistence.

## Security Considerations

1. **Change Default Secrets**: Always change JWT_SECRET and database passwords
2. **Use HTTPS**: Always use SSL/TLS in production
3. **Firewall**: Only expose necessary ports
4. **Updates**: Regularly update Docker images and dependencies
5. **Backups**: Implement regular backup strategy

## Support

For issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables are set correctly
3. Ensure Docker has enough resources allocated
4. Check file permissions on mounted volumes