# Technology Stack - Ezra

## Frontend

### Core Technologies
- **React 18** - Modern UI library with concurrent features
- **TypeScript** - Type safety and better developer experience
- **Chakra UI** - Component library for rapid UI development
  - Chosen for its accessibility features and customization options

### State Management
- **React Context API** - For global state (initially)
- **React Query/TanStack Query** - For server state management (future)

### Drag and Drop
- **@dnd-kit/sortable** - Modern, accessible drag-and-drop
  - Better accessibility than alternatives
  - Touch-friendly
  - Performant

### Markdown
- **react-markdown** - Markdown rendering
- **remark plugins** - Markdown processing
- **rehype plugins** - HTML processing

### Build Tools
- **Vite** - Fast development and build tool
- **ESLint** - Code quality
- **Prettier** - Code formatting

## Backend

### Core Technologies
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety

### Database
- **SQLite** (initial) - Simple, file-based database
  - Easy setup for MVP
  - No additional services required
- **PostgreSQL** (future) - Production database
  - Better performance at scale
  - Advanced features

### ORM/Query Builder
- **Knex.js** - SQL query builder
  - Database agnostic
  - Migration support
  - Simple API

### Authentication
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing

### AI Integration
- **Anthropic Claude API** - AI assistance
  - Task enhancement
  - Content generation
  - Smart suggestions

## Shared

### Language
- **TypeScript** - Shared types between frontend and backend

### Development Tools
- **npm workspaces** - Monorepo management
- **nodemon** - Development server auto-restart
- **concurrently** - Run multiple processes

### Testing (Future)
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Supertest** - API testing

## Infrastructure (Future)

### Deployment
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Cloud Provider** - TBD (AWS/GCP/Azure)

### Monitoring
- **Application monitoring** - TBD
- **Error tracking** - TBD
- **Analytics** - TBD

## Architecture Decisions

### Monorepo Structure
- Shared types between frontend and backend
- Easier dependency management
- Simplified deployment

### API Design
- RESTful API initially
- GraphQL consideration for future
- WebSocket for real-time updates (future)

### Security
- Environment-based configuration
- Secure API key storage
- CORS properly configured
- Rate limiting on API endpoints