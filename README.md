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
- Docker & Docker Compose (for production deployment)
- Node.js 18+ (for local development only)
- [Anthropic API key](https://console.anthropic.com)

### Option 1: Interactive Docker Setup (Recommended) 🎯

```bash
git clone https://github.com/shelbyklein/ezra.git
cd ezra/docker
./quick-start.sh
```

**The interactive script provides:**
- **Guided configuration** with validation
- **Automatic environment setup**
- **Built-in backup/restore functionality**
- **Service management and monitoring**
- **Health checks and error handling**

### Option 2: Manual Docker Setup 🛠️

```bash
git clone https://github.com/shelbyklein/ezra.git
cd ezra/docker
cp .env.example .env
# Edit .env with your credentials (see Configuration section below)
docker-compose up -d
```

### Option 3: Local Development

**For local development only:**

```bash
git clone https://github.com/shelbyklein/ezra.git
cd ezra
npm install
cp .env.example .env
# Edit .env and add your Anthropic API key
npm run dev
```

## 📍 Access Points

Once deployed, Ezra is available at:
- **Frontend**: http://localhost:3005
- **Backend API**: http://localhost:6001
- **Development Frontend**: http://localhost:5173 (local dev only)

## 🐳 Docker Deployment

### Available Deployment Profiles

All Docker configuration is consolidated in the `docker/` directory:

- **Default**: Basic setup with SQLite (recommended for personal use)
- **postgres**: PostgreSQL database (recommended for production)
- **pgadmin**: Database management interface
- **backup**: Automated backup scheduling
- **ssl**: HTTPS with SSL certificates
- **production**: Full production setup with all features

### Advanced Usage

```bash
cd docker

# Use PostgreSQL instead of SQLite
docker-compose --profile postgres up -d

# Production setup with SSL
docker-compose --profile production --profile ssl up -d

# Development with database management
docker-compose --profile pgadmin up -d
```

For comprehensive deployment instructions, see [docker/README.md](docker/README.md)

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

### Data Management & Backups

**Persistent Data Locations:**
- `./data` - SQLite database files
- `./uploads` - User files (avatars, notebook images)
- `./backups` - Automated backup archives

**Backup & Restore:**
```bash
cd docker

# Create timestamped backup
./deploy.sh backup

# Restore from backup
./deploy.sh restore

# Manual backup
tar -czf backup-$(date +%Y%m%d).tar.gz data uploads .env
```

## 📂 Project Structure

```
ezra/
├── frontend/              # React TypeScript application
├── backend/               # Express TypeScript API
├── shared/                # Shared types and utilities
├── docker/                # Docker deployment configuration
│   ├── docker-compose.yml # Main Docker setup with profiles
│   ├── .env.example       # Environment configuration template
│   ├── quick-start.sh     # Interactive deployment script
│   └── deploy.sh          # Deployment management script
├── docs/                  # User documentation
├── claude_docs/           # Development documentation
└── scripts/               # Utility scripts
```

## 🛠️ Available Scripts

### Development Scripts
```bash
npm run dev                    # Start both frontend and backend
npm run dev:frontend-only      # Start only frontend
npm run dev:backend-only       # Start only backend
```

### Production Scripts
```bash
npm run build                  # Build all workspaces
npm run start:prod            # Start production server
```

### Quality & Testing
```bash
npm run test                  # Run all tests
npm run lint                  # Lint all workspaces
npm run type-check:frontend   # TypeScript check frontend
npm run type-check:backend    # TypeScript check backend
```

### Distributed Deployment

For running frontend and backend on separate servers:

1. **Frontend Server:**
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit: VITE_API_URL=http://your-backend-server:6001
   npm run dev:frontend-only
   ```

2. **Backend Server:**
   ```bash
   cp .env.example .env
   # Edit: FRONTEND_URL=http://your-frontend-server:5173
   npm run dev:backend-only
   ```

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

| Database | Use Case | Setup |
|----------|----------|-------|
| **SQLite** | Personal use, development | Default - no configuration needed |
| **PostgreSQL** | Production, teams | `docker-compose --profile postgres up -d` |

## 📚 Documentation

### User Documentation
- [User Guide](docs/USER_GUIDE.md) - Complete feature walkthrough
- [AI Features](docs/AI_FEATURES_GUIDE.md) - Claude integration guide
- [Keyboard Shortcuts](docs/KEYBOARD_SHORTCUTS.md) - Productivity shortcuts

### Deployment Guides
- [Docker Deployment](docker/README.md) - Comprehensive Docker deployment guide
- [Quick Start Script](docker/quick-start.sh) - Interactive deployment wizard
- [Deployment Manager](docker/deploy.sh) - Advanced deployment toolkit

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
lsof -i :3005 -i :6001

# Clean restart
docker-compose down
docker-compose up -d --build
```

**Can't access the app:**
- Ensure ports 3005 and 6001 are not in use
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