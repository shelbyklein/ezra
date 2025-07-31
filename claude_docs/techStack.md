# Technology Stack - Ezra

## Frontend

### Core Technologies (Implemented)
- **React 18** - Modern UI library ✅
- **TypeScript** - Type safety across the application ✅
- **Chakra UI** - Component library with icons ✅
  - Color mode support for dark/light themes
  - Semantic color tokens
  - Custom theme configuration
- **React Router v6** - Client-side routing ✅

### State Management (Implemented)
- **React Context API** - Authentication state ✅
- **React Query/TanStack Query** - Server state management ✅
- **Local state** - Component-level state for forms and UI ✅

### Forms and Validation (Implemented)
- **React Hook Form** - Form state management ✅
- **Built-in validation** - Email, password, username rules ✅

### Drag and Drop (Implemented)
- **@dnd-kit/sortable** - Smooth drag-and-drop ✅
  - @dnd-kit/core - Core functionality
  - @dnd-kit/sortable - Sortable lists
  - @dnd-kit/utilities - Helper functions

### Rich Text Editing (Implemented)
- **TipTap 2** - WYSIWYG editor for notebooks ✅
  - StarterKit (excluding codeBlock and link to avoid duplicates)
  - Typography extension
  - Highlight extension
  - CodeBlockLowlight with syntax highlighting
  - ImageResize extension (tiptap-extension-resize-image)
  - Link extension
  - Placeholder extension
  - Custom slash commands
  - Custom ColumnBlock and Column extensions for multi-column layouts
- **Lowlight** - Syntax highlighting for code blocks ✅
  - JavaScript, TypeScript, HTML, CSS, Python support

### Markdown (Implemented)
- **react-markdown** - Markdown rendering in chat ✅
- **Custom markdown to TipTap converter** - For AI-generated content ✅
  - Parses markdown text to TipTap JSON format
  - Supports paragraphs, headings, lists, code blocks
  - Enables AI to edit notebook pages
  - Now supports highlight parameter for new content

### UI Components and Utilities (Implemented)
- **Framer Motion** - Animations for chat bubble ✅
- **date-fns** - Date formatting utilities ✅
- **React Icons** - Icon library ✅

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
- **SQLite** (current) - Simple, file-based database ✅
  - Easy setup for MVP
  - No additional services required
  - Using with Knex.js for migrations
  - Tables: users, projects, tasks, notes, tags, task_tags, project_tags, attachments, notebooks, folders, pages
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

### AI Integration (Implemented)
- **Anthropic Claude API** - AI assistance ✅
  - Task enhancement ✅
  - Content generation ✅
  - Smart suggestions ✅
  - Natural language task creation ✅
  - Conversational chat interface ✅
  - Context-aware notebook editing ✅
  - Markdown to TipTap conversion ✅
  - Model: Claude 3.5 Sonnet (claude-3-5-sonnet-20241022) ✅
  - Temperature: 0.3 for consistent responses ✅

## Shared

### Language
- **TypeScript** - Shared types between frontend and backend

### Development Tools
- **npm workspaces** - Monorepo management
- **nodemon** - Development server auto-restart
- **concurrently** - Run multiple processes

### Testing (Implemented)
- **Jest** - Unit testing framework ✅
  - Frontend: jest.config.cjs with TypeScript support
  - Backend: jest.config.js for API testing
  - Coverage thresholds configured
- **React Testing Library** - Component testing ✅
  - Custom test utilities with providers
  - Mock implementations for auth and API
  - Authentication component tests implemented
- **Supertest** - API integration testing ✅
  - Backend API endpoint testing
  - Test database configuration
  - Helper utilities for authenticated requests
- **@testing-library/user-event** - User interaction simulation ✅

## Infrastructure (Implemented)

### Deployment
- **Docker** - Containerization ✅
  - Multi-stage Dockerfiles for optimized builds
  - Docker Compose for full stack orchestration
  - Nginx for frontend serving
  - Health checks and restart policies
- **GitHub Actions** - CI/CD ✅
  - Automated testing on pull requests
  - Matrix testing (Node 18.x, 20.x)
  - Code quality checks
- **Deployment Options** ✅
  - Docker Compose (recommended)
  - Self-hosting documentation

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