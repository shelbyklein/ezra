# Technology Stack - Ezra

## Frontend

### Core Technologies (Implemented)
- **React 18** - Modern UI library ✅
- **TypeScript** - Type safety across the application ✅
- **Chakra UI** - Component library with icons ✅
- **React Router v6** - Client-side routing ✅

### State Management (Implemented)
- **React Context API** - Authentication state ✅
- **React Query/TanStack Query** - Server state management ✅

### Forms and Validation (Implemented)
- **React Hook Form** - Form state management ✅
- **Built-in validation** - Email, password, username rules ✅

### Drag and Drop (Ready to Implement)
- **@dnd-kit/sortable** - Installed and ready
  - @dnd-kit/core
  - @dnd-kit/sortable
  - @dnd-kit/utilities

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
- **SQLite** (current) - Simple, file-based database
  - Easy setup for MVP
  - No additional services required
  - Using with Knex.js for migrations
- **PostgreSQL** (future) - Production database
  - Better performance at scale
  - Advanced features

### ORM/Query Builder
- **Knex.js** - SQL query builder (implemented)
  - Database agnostic
  - Migration support
  - Simple API
  - Configured for SQLite with easy migration path

### Authentication
- **JWT** - Token-based authentication (implemented)
  - Custom middleware for route protection
  - 7-day token expiry
- **bcrypt** - Password hashing (implemented)
  - Secure password storage

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
- RESTful API (implemented)
  - Standard HTTP methods (GET, POST, PUT, DELETE)
  - Consistent JSON response format
  - Proper status codes
- GraphQL consideration for future
- WebSocket for real-time updates (future)

### Security
- Environment-based configuration
- Secure API key storage
- CORS properly configured
- Rate limiting on API endpoints