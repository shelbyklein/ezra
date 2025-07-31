# Ezra - LLM-Powered Project Management

An intelligent kanban board application with AI-powered task management, markdown notes, and future mind-mapping capabilities.

## ✨ Features

- 🤖 **AI-Powered Assistant** - Natural language task management and content generation
- 📋 **Kanban Board** - Drag-and-drop task management with real-time updates
- 📝 **Rich Notebooks** - WYSIWYG editor with markdown support and image uploads
- 🏷️ **Smart Tagging** - Organize projects and tasks with colorful tags
- 🌓 **Dark Mode** - Automatic theme switching based on system preferences
- ⌨️ **Keyboard Shortcuts** - Navigate and manage tasks without touching the mouse
- 💾 **Backup & Restore** - Export and import your data anytime
- 🔐 **Secure Authentication** - JWT-based auth with encrypted API keys

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (for options 1-4)
- Node.js 18+ (for option 5 only)
- [Anthropic API key](https://console.anthropic.com)

### Option 1: One-Command Start (Simplest) 🎯

```bash
git clone https://github.com/shelbyklein/ezra.git
cd ezra
./start.sh
```

The script will create a `.env` file. Edit it with your API key and run `./start.sh` again!

### Option 2: Full Deployment Manager (Recommended) 🛠️

```bash
git clone https://github.com/shelbyklein/ezra.git
cd ezra
./deploy.sh
```

Features:
- **Interactive menu** for all operations
- **Automatic setup** with validation
- **Backup/restore** functionality
- **Update management** with git pull
- **Service control** and log viewing
- **Health checks** and error handling

Command line usage:
```bash
./deploy.sh deploy    # Initial deployment
./deploy.sh update    # Update to latest version
./deploy.sh backup    # Create timestamped backup
./deploy.sh restore   # Restore from backup
./deploy.sh logs      # View service logs
./deploy.sh stop      # Stop all services
```

### Option 3: Simple Docker Compose (All-in-One YAML)

1. Clone the repository:
```bash
git clone https://github.com/shelbyklein/ezra.git
cd ezra
```

2. Edit `docker-compose.simple.yml` and add your credentials:
```yaml
environment:
  JWT_SECRET: "your-secret-key-here"         # Generate with: openssl rand -base64 32
  ANTHROPIC_API_KEY: "your-anthropic-key"    # From https://console.anthropic.com
```

3. Run with Docker Compose:
```bash
docker-compose -f docker-compose.simple.yml up -d
```

### Option 4: Standard Docker Compose

1. Clone and configure:
```bash
git clone https://github.com/shelbyklein/ezra.git
cd ezra
cp .env.docker .env
# Edit .env with your credentials
```

2. Start the application:
```bash
docker-compose up -d
```

### Option 5: Local Development

#### Prerequisites
- Node.js 18+
- npm 9+
- Anthropic API key

#### Installation

1. Clone the repository:
```bash
git clone https://github.com/shelbyklein/ezra.git
cd ezra
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

4. Start the development servers:
```bash
npm run dev
```

## 📍 Access Points

Once deployed, Ezra is available at:
- **Frontend**: http://localhost:3005
- **Backend API**: http://localhost:5001
- **Development Frontend**: http://localhost:5173 (local dev only)

## 🐳 Docker Management

### Common Operations

```bash
# View running containers
docker-compose ps

# Restart a service
docker-compose restart backend

# Stop everything
docker-compose down

# Remove everything including volumes (CAUTION: deletes data)
docker-compose down -v
```

### Using PostgreSQL (Production)
```bash
# Start with PostgreSQL profile
docker-compose --profile postgres up -d

# Or use production config
docker-compose -f docker-compose.production.yml up -d
```

### Troubleshooting

```bash
# Check logs for errors
docker-compose logs backend | grep ERROR

# Access container shell
docker-compose exec backend sh

# Check health status
docker-compose ps

# Rebuild if needed
docker-compose build --no-cache
```

### Data Management

**Persistent Volumes:**
- `./data` - SQLite database
- `./uploads` - User files (avatars, images)
- `./backups` - Automated backups

**Backup Commands:**
```bash
# Using deployment script
./deploy.sh backup

# Manual backup
tar -czf backup-$(date +%Y%m%d).tar.gz data uploads .env
```

## 📂 Project Structure

```
ezra/
├── frontend/              # React TypeScript application
├── backend/               # Express TypeScript API
├── shared/                # Shared types and utilities
├── deploy.sh              # Full deployment manager
├── start.sh               # Quick start script
├── docker-compose.yml     # Standard Docker setup
├── docker-compose.simple.yml       # All-in-one config
├── docker-compose.production.yml   # Production setup
├── docker-compose.full.yml         # Comprehensive options
├── scripts/               # Utility scripts
│   └── replit-setup.sh    # Replit setup
├── docs/                  # User documentation
├── claude_docs/           # Development documentation
└── nginx/                 # Nginx configurations
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend-only` - Start only the frontend
- `npm run dev:backend-only` - Start only the backend

### Production
- `npm run build` - Build all workspaces for production
- `npm run start:prod` - Start production server

### Testing & Quality
- `npm run test` - Run tests in all workspaces
- `npm run lint` - Lint all workspaces
- `npm run type-check:frontend` - Type check frontend
- `npm run type-check:backend` - Type check backend

### Running with Separate Servers

If you're running the backend on a separate server:

1. **Frontend Setup:**
   ```bash
   # Copy the frontend environment template
   cp frontend/.env.example frontend/.env
   
   # Edit frontend/.env and set your backend URL:
   # VITE_API_URL=http://your-backend-server:port
   
   # Run only the frontend
   npm run dev:frontend-only
   ```

2. **Backend Setup (on separate server):**
   ```bash
   # Set up backend environment
   cp .env.example .env
   # Edit .env and update FRONTEND_URL to match your frontend URL
   
   # Run only the backend
   npm run dev:backend-only
   # Or use nodemon directly: cd backend && npm run dev
   ```

3. **CORS Configuration:**
   Make sure the backend's `FRONTEND_URL` environment variable matches where your frontend is running to allow cross-origin requests.

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `ANTHROPIC_API_KEY` | Claude API access | [Get from Anthropic Console](https://console.anthropic.com) |
| `JWT_SECRET` | Auth token secret | Generate: `openssl rand -base64 32` |

### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `./data/ezra.db` | Database connection |
| `FRONTEND_URL` | `http://localhost:3005` | Frontend URL for CORS |
| `JWT_EXPIRES_IN` | `7d` | Token expiration time |
| `PORT` | `6001` | Backend port |

### Database Options

1. **SQLite** (default)
   - Zero configuration
   - Perfect for personal use
   - File-based persistence

2. **PostgreSQL** (production)
   ```bash
   # Use production config
   docker-compose -f docker-compose.production.yml up -d
   
   # Or use profile
   docker-compose --profile postgres up -d
   ```

## 📚 Documentation

### User Documentation
- [User Guide](docs/USER_GUIDE.md) - Complete feature walkthrough
- [AI Features](docs/AI_FEATURES_GUIDE.md) - Claude integration guide
- [Keyboard Shortcuts](docs/KEYBOARD_SHORTCUTS.md) - Productivity shortcuts

### Deployment Guides
- [Docker Deployment](DEPLOY_DOCKER.md) - Comprehensive Docker guide
- [Quick Start](./start.sh) - Automated setup script
- [Deployment Manager](./deploy.sh) - Full deployment toolkit

### Developer Resources
- [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md) - Contributing guide
- [API Documentation](docs/API.md) - Backend endpoints
- [Database Schema](docs/DATABASE.md) - Data structure

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/DEVELOPMENT_WORKFLOW.md) for details.

### Quick Start for Contributors
```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/ezra.git
cd ezra

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/amazing-feature

# Run in development
npm run dev
```

## 🐛 Troubleshooting

### Common Issues

**Docker won't start:**
```bash
# Check Docker daemon
docker info

# Check ports
lsof -i :3005 -i :5001

# Clean restart
docker-compose down
docker-compose up -d --build
```

**Can't access the app:**
- Ensure ports 3005 and 5001 are not in use
- Check firewall settings
- Verify Docker containers are healthy: `docker-compose ps`

**Database issues:**
```bash
# Check database file permissions
ls -la ./data/

# Run migrations manually
docker-compose exec backend npx knex migrate:latest
```

## 🙏 Acknowledgments

- Built with [React](https://react.dev), [Express](https://expressjs.com), and [TypeScript](https://typescriptlang.org)
- AI powered by [Anthropic Claude](https://anthropic.com)
- UI components from [Chakra UI](https://chakra-ui.com)
- Rich text editing with [TipTap](https://tiptap.dev)

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

<p align="center">
  Made with ❤️ by the Ezra team
</p>