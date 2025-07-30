# Deploying Ezra on Replit

This guide will walk you through deploying your Ezra project on Replit.

## Prerequisites

- A Replit account
- An Anthropic API key for AI features
- Git repository with your Ezra code

## Deployment Steps

### 1. Import Project to Replit

1. Log in to [Replit](https://replit.com)
2. Click "Create Repl" 
3. Select "Import from GitHub"
4. Enter your repository URL
5. Replit will automatically detect the Node.js configuration

### 2. Configure Environment Variables

1. In your Repl, click on "Secrets" (🔒 icon) in the tools panel
2. Add the following secrets:
   ```
   ANTHROPIC_API_KEY=your-anthropic-api-key
   JWT_SECRET=your-secure-jwt-secret
   ```
3. Generate a secure JWT secret using:
   ```bash
   openssl rand -base64 32
   ```

### 3. Initial Setup

Run the setup script in the Replit Shell:
```bash
bash scripts/replit-setup.sh
```

This script will:
- Create the data directory for SQLite
- Copy environment configuration
- Install all dependencies
- Build the application
- Run database migrations

### 4. Start the Application

The application will automatically start using the configuration in `.replit`. If you need to manually start it:
```bash
npm run start:prod
```

### 5. Access Your Application

Your application will be available at:
- `https://[your-repl-name].[your-username].repl.co`

## Important Notes

### Database Persistence

- SQLite database is stored in `/home/runner/ezra-data/ezra.db`
- This location persists across Repl restarts
- Regular backups are recommended using the backup API endpoints

### File Uploads

- Uploaded files are stored in the `uploads/` directory
- Ensure this directory has proper permissions
- Consider using external storage (S3, Cloudinary) for production

### Performance Considerations

- Replit free tier has resource limitations
- Consider upgrading to a paid plan for production use
- Monitor memory usage, especially with large datasets

### Security

1. **Never commit secrets to git**
   - Use Replit Secrets for sensitive data
   - Keep `.env` files out of version control

2. **Update default secrets**
   - Change JWT_SECRET from the default
   - Use strong, unique passwords

3. **CORS Configuration**
   - The backend is configured to accept requests from Replit domains
   - Additional domains can be added in `backend/src/index.ts`

## Troubleshooting

### Port Issues
- Replit automatically assigns ports
- The application uses `process.env.PORT` which Replit provides

### Build Failures
- Check Node.js version compatibility (requires 18+)
- Ensure all dependencies are properly listed in package.json
- Check the console for specific error messages

### Database Errors
- Ensure the data directory exists: `mkdir -p /home/runner/ezra-data`
- Check file permissions on the database file
- Run migrations: `npm run db:migrate:prod`

### Frontend Not Loading
- Verify the build completed successfully
- Check that static files are being served correctly
- Look for console errors in the browser

## Updating Your Application

1. Push changes to your GitHub repository
2. In Replit, pull the latest changes:
   ```bash
   git pull origin main
   ```
3. Rebuild the application:
   ```bash
   npm run build:prod
   ```
4. Restart the server (Replit usually does this automatically)

## Monitoring

- Use Replit's built-in monitoring tools
- Check application logs in the Console
- Monitor resource usage in the Repl dashboard

## Support

For issues specific to:
- **Replit**: Check [Replit Documentation](https://docs.replit.com)
- **Ezra**: Refer to the project README and documentation