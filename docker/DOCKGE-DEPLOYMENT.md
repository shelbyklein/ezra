# Deploying Ezra with Dockge

Dockge requires pre-built Docker images since it can't access your source code during deployment. Follow these steps:

## Step 1: Build Images Locally

From your Ezra project directory:

```bash
cd docker
./build-for-dockge.sh
```

This will build:
- `ezra-backend:latest`
- `ezra-frontend:latest`

## Step 2: Create Stack in Dockge

1. Open Dockge web interface
2. Click "Create Stack"
3. Name it: `ezra`
4. Copy the contents of `docker-compose.dockge-local.yml` into the compose editor

## Step 3: Configure Environment Variables

In the Dockge editor, update these values:

### Backend Service:
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `ANTHROPIC_API_KEY`: Your key from https://console.anthropic.com

### Optional PostgreSQL:
If you want to use PostgreSQL instead of SQLite:
1. Add the postgres service from the main docker-compose.yml
2. Update `DATABASE_URL` to: `postgresql://ezra_user:your-password@postgres:5432/ezra_db`

## Step 4: Deploy

1. Click "Deploy" in Dockge
2. Wait for containers to start
3. Access Ezra at http://your-server:3005

## Adding SSL/HTTPS

For HTTPS support in Dockge:

1. Generate certificates on your host:
   ```bash
   cd /opt/stacks/ezra
   mkdir ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ssl/privkey.pem \
     -out ssl/fullchain.pem \
     -subj "/CN=localhost"
   ```

2. Add nginx service to your stack (copy from docker-compose.yml nginx-ssl service)

3. Update volumes in nginx service:
   ```yaml
   volumes:
     - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf
     - ./ssl:/etc/nginx/ssl
   ```

4. Create nginx-ssl.conf in Dockge's ezra stack directory

## Troubleshooting

### Images not found
- Make sure you built the images on the same Docker host where Dockge is running
- Check images exist: `docker images | grep ezra`

### Permission issues
- Dockge volumes are created in `/opt/stacks/ezra/`
- Ensure proper permissions: `chown -R 1000:1000 /opt/stacks/ezra/`

### Can't access the application
- Check container logs in Dockge
- Verify ports aren't already in use
- Check firewall rules for ports 3005 and 6001

## Updating Ezra

To update to a new version:

1. Pull latest code
2. Rebuild images: `./build-for-dockge.sh`
3. In Dockge: Stop stack → Recreate containers
4. Containers will use the new images

## Backup

Ezra data is stored in Docker volumes:
- Database: `ezra_ezra-data`
- Uploads: `ezra_ezra-uploads`

To backup:
```bash
docker run --rm -v ezra_ezra-data:/data -v $(pwd):/backup alpine tar czf /backup/ezra-backup.tar.gz -C / data
```