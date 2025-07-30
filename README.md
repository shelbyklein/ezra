# Ezra - LLM-Powered Project Management

An intelligent kanban board application with AI-powered task management, markdown notes, and future mind-mapping capabilities.

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

#### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Anthropic API key

#### Installation

1. Clone the repository:
```bash
git clone https://github.com/shelbyklein/ezra.git
cd ezra
```

2. Set up environment variables:
```bash
cp .env.docker .env
# Edit .env and add your Anthropic API key and JWT secret
```

3. Build and start with Docker Compose:
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:5001

To stop the application:
```bash
docker-compose down
```

### Option 2: Local Development

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

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## 🐳 Docker Deployment

### Using PostgreSQL (Production)
```bash
# Start with PostgreSQL instead of SQLite
docker-compose --profile postgres up -d

# Access pgAdmin at http://localhost:5050
```

### Building Fresh Images
```bash
# Rebuild after code changes
docker-compose up -d --build
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Data Persistence
The following directories are mounted as volumes:
- `./data` - SQLite database (if not using PostgreSQL)
- `./uploads` - User uploaded files (avatars, images)
- `./backups` - Database backups (optional)

## 📂 Project Structure

```
ezra/
├── frontend/          # React TypeScript application
├── backend/           # Express TypeScript API
├── shared/            # Shared types and utilities
├── claude_docs/       # Project documentation
├── docs/              # User documentation
├── nginx/             # Nginx configurations
├── docker-compose.yml # Docker orchestration
└── DEPLOY_DOCKER.md   # Detailed Docker guide
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

### Environment Variables

Key environment variables to configure:

- `ANTHROPIC_API_KEY` - Your Anthropic API key (required)
- `JWT_SECRET` - Secret for JWT tokens (generate with `openssl rand -base64 32`)
- `DATABASE_URL` - Database connection string (defaults to SQLite)
- `FRONTEND_URL` - Frontend URL for CORS (defaults to http://localhost)

See `.env.example` for all available options.

### Database Options

1. **SQLite** (default) - Good for development and small deployments
2. **PostgreSQL** - Recommended for production use

To use PostgreSQL with Docker:
```bash
docker-compose --profile postgres up -d
```

## 📚 Documentation

- [User Guide](docs/USER_GUIDE.md) - Complete feature documentation
- [AI Features Guide](docs/AI_FEATURES_GUIDE.md) - AI assistant capabilities
- [Keyboard Shortcuts](docs/KEYBOARD_SHORTCUTS.md) - Keyboard navigation
- [Docker Deployment](DEPLOY_DOCKER.md) - Detailed Docker deployment guide
- [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md) - Contributing guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details