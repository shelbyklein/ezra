# Ezra Docker Deployment

This directory contains the consolidated Docker configuration for deploying Ezra.

## Quick Start

1. **Copy and configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values (especially JWT_SECRET and ANTHROPIC_API_KEY)
   ```

2. **Run with default configuration (SQLite):**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3005
   - Backend API: http://localhost:6001/api

## Available Profiles

The docker-compose.yml file uses profiles to enable different deployment scenarios:

### Default (No Profile)
Basic setup with SQLite database:
```bash
docker-compose up -d
```

### PostgreSQL Database
Use PostgreSQL instead of SQLite:
```bash
docker-compose --profile postgres up -d
```

### PostgreSQL with pgAdmin
Include pgAdmin for database management:
```bash
docker-compose --profile pgadmin up -d
```
- pgAdmin: http://localhost:5050

### Automated Backups
Enable automated daily backups:
```bash
docker-compose --profile backup up -d
```

### Production Setup
Full production deployment with PostgreSQL, backups, and nginx:
```bash
docker-compose --profile production up -d
```

### Alternative Ports
Use alternative ports (frontend: 3006, backend: 5002):
```bash
docker-compose --profile alt-ports up -d
```

### SSL/HTTPS (Recommended for passwords)
Enable HTTPS with self-signed certificate:
```bash
# For new installation: choose SSL option in quick-start.sh
./quick-start.sh

# For existing installation:
./enable-ssl.sh
```
- Access via: https://localhost (port 443)
- Browser will show security warning (self-signed cert)
- Required for password fields in modern browsers
- Note: When using SSL, you access through nginx on port 443, not directly on port 3005

## Multiple Profiles
You can combine profiles:
```bash
docker-compose --profile postgres --profile backup up -d
```

## Configuration

### Required Environment Variables

1. **JWT_SECRET**: Authentication secret key
   ```bash
   # Generate a secure secret:
   openssl rand -base64 32
   ```

2. **ANTHROPIC_API_KEY**: Required for AI features
   - Get from: https://console.anthropic.com

3. **FRONTEND_URL**: CORS-allowed origins (comma-separated)
   - Default: `http://localhost:3005`
   - Production example: `http://localhost:3005,https://ezra.yourdomain.com`
   - Multiple domains supported via comma separation

### Database Options

#### SQLite (Default)
- No additional configuration needed
- Data stored in `../data/ezra.db`
- Best for small deployments or testing

#### PostgreSQL
1. Set in `.env`:
   ```env
   DATABASE_URL=postgresql://ezra_user:your-postgres-password@postgres:5432/ezra_db
   POSTGRES_USER=ezra_user
   POSTGRES_PASSWORD=your-secure-password
   POSTGRES_DB=ezra_db
   ```

2. Run with postgres profile:
   ```bash
   docker-compose --profile postgres up -d
   ```

### Backup Configuration

Backups are configured via environment variables:
- `BACKUP_SCHEDULE`: Cron expression (default: "0 2 * * *" - 2 AM daily)
- `BACKUP_RETENTION_DAYS`: Number of days to keep backups (default: 7)

### Port Configuration

Default ports can be changed in `.env`:
- `FRONTEND_PORT`: Frontend web UI (default: 3005)
- `BACKEND_PORT`: Backend API (default: 6001)
- `PGADMIN_PORT`: pgAdmin interface (default: 5050)

## Volume Mounts

The following directories are mounted from the parent directory:
- `../data`: Database files (SQLite)
- `../uploads`: User uploaded files
- `../logs`: Application logs
- `../backups`: Database backups
- `../nginx`: Nginx configuration
- `../ssl`: SSL certificates (for production)

## Common Commands

### View logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart services
```bash
docker-compose restart backend
docker-compose restart
```

### Stop all services
```bash
docker-compose down
```

### Remove all data (careful!)
```bash
docker-compose down -v
```

### Update and rebuild
```bash
docker-compose pull
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

For production deployment:

1. Use strong passwords and secrets
2. Enable HTTPS with proper SSL certificates
3. Use PostgreSQL instead of SQLite
4. Enable automated backups
5. Configure proper domain names
6. Set up monitoring and logging

### Traefik Integration
The frontend service includes Traefik labels for automatic HTTPS/SSL:
- Automatic Let's Encrypt certificate generation
- HTTP to HTTPS redirection
- Requires external `traefik-network` to be created first:
  ```bash
  docker network create traefik-network
  ```

Example production command:
```bash
docker-compose --profile production up -d
```

## Troubleshooting

### Python 3.12 / distutils error
If you get `ModuleNotFoundError: No module named 'distutils'`:

**Option 1: Use Docker Compose v2 (Recommended)**
```bash
# Use 'docker compose' instead of 'docker-compose'
docker compose up -d
```

**Option 2: Fix docker-compose v1**
```bash
./fix-docker-compose.sh
```

**Option 3: Install Docker Desktop**
Docker Desktop includes Compose v2 which doesn't have this issue.

### Container won't start
- Check logs: `docker compose logs backend` (or `docker-compose logs backend`)
- Verify environment variables are set correctly
- Ensure ports are not already in use

### Frontend health check issues
- Health check temporarily disabled due to Alpine wget compatibility
- Container functions normally without health check
- For Traefik users: container will be picked up once running

### CORS errors
- Update `FRONTEND_URL` in `.env` to include all domains (comma-separated)
- Example: `FRONTEND_URL=http://localhost:3005,https://yourdomain.com`
- Rebuild backend after changes: `docker compose build backend && docker compose up -d backend --force-recreate`

### Database table errors
- Tables are created by `docker-entrypoint.sh` on startup
- If tables are missing, restart the backend container
- Check table creation: `docker exec ezra-backend sqlite3 /app/data/ezra.db ".tables"`

### Database connection issues
- For PostgreSQL, ensure the postgres service is healthy
- Check DATABASE_URL format
- Verify credentials match

### Permission issues
- Ensure mounted directories have proper permissions
- The container runs as non-root user

### Backup issues
- Check backup container logs: `docker compose logs backup-sqlite`
- Verify backup directory permissions
- Check cron syntax if custom schedule used