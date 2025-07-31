# Codebase Summary - Ezra

## Project Structure Overview

```
Ezra/
├── claude_docs/           # Project documentation and planning
│   ├── projectRoadmap.md  # High-level goals and progress
│   ├── currentTask.md     # Active development focus
│   ├── techStack.md       # Technology decisions
│   └── codebaseSummary.md # This file
├── frontend/              # React TypeScript application
│   ├── src/
│   │   ├── components/    # UI components (organized by feature)
│   │   ├── services/      # API integration (api.ts configured)
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── index.html         # HTML template
│   ├── vite.config.ts     # Vite configuration with env support
│   ├── tsconfig.json      # TypeScript config
│   ├── package.json       # Frontend dependencies
│   └── .env.example       # Environment template
├── backend/               # Express TypeScript API server
│   ├── src/
│   │   ├── index.ts       # Server entry point with all routes
│   │   └── db/
│   │       └── index.ts   # Database connection setup
│   ├── routes/            # API route handlers
│   │   ├── auth.routes.ts # Authentication endpoints
│   │   ├── projects.routes.ts # Project CRUD + tags + recent endpoint
│   │   ├── tasks.routes.ts # Task CRUD + reordering + natural language
│   │   ├── notes.routes.ts # Notes CRUD
│   │   ├── tags.routes.ts  # Tags CRUD for tasks/projects
│   │   ├── attachments.routes.ts # Task attachments CRUD
│   │   ├── notebooks.routes.ts # Notebooks CRUD + recent endpoint
│   │   ├── users.routes.ts # User profile and API key management
│   │   ├── ai.routes.ts   # AI chat and natural language endpoints
│   │   └── dev.routes.ts  # Development tools (reset, seed)
│   ├── middleware/
│   │   └── auth.middleware.ts # JWT authentication
│   ├── models/            # Database models
│   │   ├── User.ts        # User model
│   │   ├── Project.ts     # Project model
│   │   └── Task.ts        # Task model
│   ├── utils/
│   │   ├── jwt.ts         # JWT token utilities
│   │   └── anthropic.ts   # Anthropic API integration utilities
│   ├── migrations/        # Database migrations
│   │   ├── 20240101_create_users.ts
│   │   ├── 20240102_create_projects.ts
│   │   ├── 20240103_create_tasks.ts
│   │   ├── 20240104_create_notes.ts
│   │   ├── 20240105_create_tags.ts
│   │   ├── 006_add_project_tags.ts
│   │   ├── 007_add_task_attachments.ts
│   │   ├── 008_create_notebooks.ts
│   │   ├── 009_add_user_api_key.ts
│   │   ├── 011_add_notebook_tags.ts
│   │   └── 012_add_notebook_project_association.ts
│   ├── tests/
│   │   └── api.test.ts    # API endpoint tests
│   ├── knexfile.ts        # Database configuration
│   ├── nodemon.json       # Development server config
│   ├── tsconfig.json      # TypeScript config
│   └── package.json       # Backend dependencies
├── shared/                # Shared TypeScript types
│   ├── src/
│   │   ├── types/         # Type definitions
│   │   │   ├── user.ts    # User/auth types
│   │   │   ├── task.ts    # Task types and enums
│   │   │   ├── project.ts # Project types
│   │   │   └── api.ts     # API response types
│   │   └── index.ts       # Main export
│   ├── tsconfig.json      # TypeScript config
│   └── package.json       # Shared package config
├── docs/                  # User-facing documentation
├── scripts/               # Utility scripts
│   └── replit-setup.sh    # Replit deployment setup script
├── nginx/                 # Nginx configurations
│   └── ezra.conf          # Production nginx config
├── .env.example           # Backend environment template
├── .env.production        # Production environment template
├── docker/                # All Docker-related files
│   ├── docker-compose.yml # Unified compose with profiles
│   ├── docker-compose.dockge.yml # Dockge deployment config
│   ├── docker-compose.dockge-local.yml # Dockge with local images
│   ├── nginx-ssl.conf     # Nginx HTTPS configuration
│   ├── .env.example       # Docker environment template
│   ├── README.md          # Docker deployment guide
│   ├── DOCKGE-DEPLOYMENT.md # Dockge-specific guide
│   ├── quick-start.sh     # Interactive setup script
│   ├── enable-ssl.sh      # SSL enablement script
│   ├── fix-docker-compose.sh # Python 3.12 fix
│   ├── build-for-dockge.sh # Build images for Dockge
│   └── generate-ssl-cert.sh # SSL certificate generation
├── .gitignore             # Git ignore rules
├── .dockerignore          # Docker build exclusions
├── .replit                # Replit configuration
├── replit.nix             # Replit system dependencies
├── ecosystem.config.js    # PM2 configuration
├── tsconfig.json          # Root TypeScript config
├── package.json           # Root workspace configuration
├── README.md              # Project documentation
└── DEPLOY_REPLIT.md       # Replit deployment guide

### Testing Structure
- **Frontend Testing**:
  - `frontend/jest.config.cjs` - Jest configuration
  - `frontend/src/setupTests.ts` - Test environment setup
  - `frontend/src/utils/test-utils.tsx` - Custom render with providers
  - `frontend/src/__tests__/` - Component test files
  - `frontend/src/components/*/tests/` - Component-specific tests
- **Backend Testing**:
  - `backend/jest.config.js` - Jest configuration
  - `backend/tests/setup.ts` - Test environment setup
  - `backend/tests/helpers.ts` - Test utilities and helpers
  - `backend/tests/*.test.ts` - API integration tests
  - `backend/.env.test` - Test environment variables
```

## Key Components and Their Interactions

### Frontend Components (Implemented)
- **Auth/** - Authentication components
  - Login - User login form with validation and "Forgot Password" link
  - Register - User registration form
  - ProtectedRoute - Route guard for authenticated users
  - LoginDevTools - Development tools access from login
  - ForgotPassword - Request password reset by email
  - ResetPassword - Reset password with token
- **Layout/** - Application structure
  - AppLayout - Main layout with navigation bar (Home, Chat, Projects, Notebooks)
    - Updated navigation header structure ✅
    - Removed "Board" from main navigation ✅
- **Projects/** - Project management
  - ProjectList - Grid view with project tags display
  - CreateProjectModal - Create/edit with tag selection
- **Board/** - Kanban board components
  - Board - Main board with DndContext and drag handlers
  - BoardColumn - Droppable columns with task click handling
  - TaskCard - Draggable/clickable cards with priority/date indicators
- **Settings/** - Application settings
  - Settings - Settings page with tabs for different sections
  - DeveloperTools - Data reset and testing tools (dev only)
  - TagsManagement - Tags CRUD interface with color picker
  - ApiKeySettings - Anthropic API key management interface
  - ProfileSettings - User profile management with avatar upload and password change
  - BackupSettings - Data export/import functionality with preview
- **Tasks/** - Task management
  - CreateTaskForm - Quick task creation modal with tag selector
  - TaskDetailModal - View/edit/delete task details with tags
  - TaskAttachments - Manage file/URL/note attachments
- **Common/** - Reusable components
  - ColorPicker - Color selection with predefined palette
  - TagSelector - Multi-select tag dropdown
- **Notebook/** - Notebook system components
  - NotebookLayout - Main notebook interface
  - NotebookSidebar/DraggableNotebookSidebar - Hierarchical file browser with drag-and-drop
  - NotebookEditor - TipTap WYSIWYG editor with toolbar
    - Star page functionality with proper UI updates ✅
    - Query invalidation for both notebook and page queries ✅
  - NotebookCoverPage - Cover page with metadata, description, tags, and project association
  - CreateNotebookModal - New notebook creation
  - CreatePageModal - New page creation
  - CreateFolderModal - New folder creation
- **AI/** - AI integration components
  - ChatBubble - Floating chat interface in bottom right ✅
    - Context-aware of current notebook/page location ✅
    - Supports task CRUD operations ✅
    - Supports notebook page editing via natural language ✅
    - Real-time query invalidation after actions ✅
    - Shows current context in header (page/notebook name) ✅
    - Dynamic greeting based on location ✅
    - Tracks navigation changes with useLocation ✅
    - Knowledge base search integration ✅
    - Visual indicators for search status ✅
    - Source attribution for recalled information ✅
  - Chat - Dedicated full-page chat interface (/app/chat) ✅
    - Full conversation history with user/assistant avatars ✅
    - Markdown rendering for AI responses ✅
    - Auto-scroll to bottom ✅
    - Clean centered layout ✅
  - NaturalLanguageInput - Command bar (Cmd/Ctrl + K) ✅
- **Dashboard/** - Recent activity display
  - Dashboard - Shows 3 recent projects and notebooks ✅
    - Favorites section displaying up to 6 starred notebook pages ✅
    - Cards with page title, notebook info, and navigation ✅
    - Fixed favorite page navigation URL pattern ✅
- **Layout/** - Application structure components
  - AppLayout - Main layout with navigation bar and user menu ✅
  - BreadcrumbFooter - Fixed footer showing navigation hierarchy ✅
    - Dynamic breadcrumb generation based on route ✅
    - Fetches names for projects/notebooks/pages ✅
    - Clickable navigation to parent sections ✅

### Backend Structure
- **routes/** - API endpoint definitions
  - auth.routes.ts - Authentication (register/login/reset-password/forgot-password/reset-password-token)
  - projects.routes.ts - Project CRUD + tags integration + /recent endpoint
  - tasks.routes.ts - Task CRUD + reordering + tags fetching + /natural-language endpoint
  - notes.routes.ts - Notes CRUD operations
  - tags.routes.ts - Tags CRUD + task/project assignment
  - attachments.routes.ts - Task attachments CRUD
  - notebooks.routes.ts - Notebooks, folders, pages CRUD + batch updates + /recent endpoint + /starred-pages endpoint + project associations
  - users.routes.ts - User profile + API key management + avatar upload
  - ai.routes.ts - AI chat endpoint (/chat) for conversational interface
    - Context-aware processing (current notebook/page/project)
    - Action execution (task CRUD, page updates, navigation)
    - Markdown to TipTap conversion for page editing
    - Support for highlight parameter in update_page action
    - Knowledge base search integration (/search-context endpoint)
    - Automatic context retrieval for questions
    - Source citation generation
  - backup.routes.ts - Data backup and restore endpoints
    - /export - Export all user data as JSON
    - /import - Import data with validation and ID mapping
    - /import/preview - Preview import data before processing
  - dev.routes.ts - Development tools (reset-all, reset-user, seed, stats)
- **models/** - Database models with TypeScript interfaces
  - User.ts - User authentication model with password reset token support
  - Project.ts - Project model (updated to use 'title' field)
  - Task.ts - Task model with position tracking
  - Notebook.ts - Notebook model with project associations and page counts
  - NotebookPage.ts - Notebook page model with starred functionality
- **middleware/** - Request processing
  - auth.middleware.ts - JWT token verification
- **utils/** - Helper functions
  - jwt.ts - Token generation and verification
  - anthropic.ts - Claude API integration, task enhancement, and natural language parsing
  - parseMarkdownToTipTap() - Converts markdown to TipTap JSON format
    - Now supports highlight parameter for marking new content
  - contextSearch.ts - Knowledge base search functionality
    - Full-text search across all content types
    - Keyword extraction and relevance scoring
    - Snippet extraction for context
    - Format context for AI consumption
    - Generate source citations
  - email.ts - Email utility functions (placeholder for production email service integration)
- **migrations/** - Database schema versioning
  - Knex.js migrations for all entities
  - 20250731121105_rename_projects_name_to_title.ts - Schema fix migration
- **src/db/** - Database configuration
  - SQLite setup with Knex.js

## Data Flow

1. **User Interaction** → React Components
2. **API Calls** → Frontend Services → Axios with JWT headers
3. **Backend Routes** → Authentication Middleware → Database Operations
4. **Database Operations** → Knex.js → SQLite
5. **Response** → JSON with consistent structure → Frontend
6. **State Updates** → React Context → UI Updates
7. **AI Integration** → Claude API → Natural Language Processing → Task Operations

## External Dependencies

### Frontend Dependencies
- react, react-dom - Core React
- @chakra-ui/react - UI components
- @dnd-kit/sortable - Drag and drop
- @tiptap/react - WYSIWYG editor
- react-markdown - Markdown rendering
- react-icons - Icon library
- axios - HTTP client
- typescript - Type safety
- framer-motion - Animations (chat bubble)
- date-fns - Date formatting
- react-router-dom - Client-side routing
- @tanstack/react-query - Server state management
- react-hook-form - Form management

### Backend Dependencies
- express - Web framework
- knex - SQL query builder
- sqlite3 - Database (initial)
- jsonwebtoken - Authentication
- bcrypt - Password hashing
- @anthropic-ai/sdk - Claude API client
- cors - Cross-origin support
- dotenv - Environment variables
- crypto - API key encryption
- multer - File upload handling (avatars)

### Development Dependencies
- vite - Frontend build tool
- nodemon - Backend hot reload
- concurrently - Run multiple processes
- kill-port - Port cleanup utility
- eslint - Linting
- prettier - Code formatting
- ts-node - TypeScript execution
- @types/* - TypeScript definitions

## Recent Significant Changes

### Testing Infrastructure Implementation ✅
- Configured Jest for both frontend and backend
- Set up React Testing Library with custom test utilities
- Created authentication component tests (Login, Register)
- Configured Supertest for API integration testing
- Created test database setup and migration support
- Implemented test helpers for user creation and auth
- Added comprehensive mock implementations

### Phase 1: MVP Kanban Board ✅ 100% COMPLETE

#### Infrastructure & Setup ✅
- Project initialization with npm workspaces
- Documentation structure (claude_docs)
- Technology stack decisions
- TypeScript configuration across all packages
- Development scripts for flexible deployment
- CORS configuration for separate servers

#### Backend Implementation ✅
- Database setup with Knex.js and SQLite
- Complete migrations for users, projects, tasks, notes
- JWT authentication system
- Full CRUD endpoints for all entities
- Task reordering endpoint for drag-and-drop
- Development tools endpoints (reset, seed, stats)
- Comprehensive error handling

#### Frontend Core Features ✅
- React Router with protected routes
- Authentication flow (login/register)
- Project management (CRUD operations)
- React Query for server state
- Chakra UI components
- Responsive navigation

#### Kanban Board Features ✅
- Three-column layout (Todo, In Progress, Done)
- Full drag-and-drop with @dnd-kit
- Task cards with priority/date indicators
- Optimistic updates for smooth UX
- Task creation form with validation
- Task detail/edit modal
- Delete task functionality
- Click-to-view task details
- Complete keyboard shortcuts:
  - N: New task
  - E: Edit selected task
  - Delete: Delete task
  - Space: Cycle task status
  - Arrow keys: Navigate/move tasks
  - ?: Show help modal
  - Visual selection indicators

#### UI/UX Enhancements ✅
- Dark/light mode with system preference support
- Project color customization
- Tags system for tasks and projects
- Tag display on task/project cards
- Task attachments (URLs, notes, files)
- Responsive design throughout
- Loading states and error handling
- Toast notifications

#### Developer Tools ✅
- Settings page with dev tools tab
- Database statistics display
- Reset all data functionality
- Reset user data functionality
- Sample data generation
- Development-only access

### Phase 2: Notebook System ✅ COMPLETED
- Complete database schema (notebooks, folders, pages)
- Full backend API with batch updates
- TipTap WYSIWYG editor integration
- Hierarchical folder structure
- Drag-and-drop file management
- Drag to notebook root functionality
- Auto-save with debouncing
- Slash commands for formatting
- Visual file/folder icons
- Notebook-project associations
- Notebook cover page with metadata
- Notebook tags support

### Phase 3: API Key Management ✅ COMPLETED
- Database field for encrypted API keys
- User routes for API key CRUD
- Secure encryption/decryption
- ApiKeySettings UI component
- Anthropic utility functions ready

### AI Integration Phase ✅ COMPLETED
- Natural language task creation via command bar
- Full conversational AI chat interface
- Task enhancement using Claude API
- Context-aware AI responses
- Dashboard showing recent activity
- Floating chat bubble interface
- Dedicated Chat page at /app/chat
- Backend AI endpoints (/chat, /natural-language)
- Model updated to Claude 3.5 Sonnet
- AI-powered notebook page editing
- Markdown to TipTap conversion
- Real-time content updates after AI actions
- Fixed React hooks errors in chat component
- Navigation header reorganized (Home, Chat, Projects, Notebooks)
- **Knowledge Base Search Integration** ✅
  - Full-text search across notebooks, projects, and tasks
  - Context retrieval based on user questions
  - Automatic source citations in AI responses
  - Visual indicators for context search and knowledge base usage
  - Search relevance scoring and snippet extraction

### Keyboard Shortcuts Phase ✅ COMPLETED
- useKeyboardShortcuts hook for global keyboard handling
- Complete keyboard navigation and task management:
  - N: Create new task
  - E: Edit selected task  
  - Delete: Delete selected task
  - Space: Cycle task status
  - Arrow keys: Navigate/move tasks
  - /: Search tasks (placeholder)
  - ?: Show keyboard shortcuts help
  - Cmd/Ctrl+K: Open AI command bar
  - Escape: Deselect/close modals
- Visual task selection with blue border
- Tooltips showing keyboard shortcuts
- KeyboardShortcutsHelp modal component
- Event-driven architecture for component communication

### Notebook-Project Integration Phase ✅ COMPLETED
- Added project_id field to notebooks table
- Updated notebook API routes to include project information
- Created notebook cover page with metadata display
- Project dropdown selector in notebook edit mode
- Display linked notebooks as clickable pills on project board
- Made project links clickable on notebook cover page
- Added notebook tags support (many-to-many relationship)
- Visual design improvements with project color indicators

### UI/UX Polish Phase ✅ COMPLETED
- Fixed overlapping buttons in task detail modal
- Moved action buttons to modal footers
- Removed unnecessary "Close" buttons
- Added edit button to project board header
- Improved modal layouts for better user experience

### User Profile Management Phase ✅ COMPLETED
- User profile endpoints (GET /profile, PUT /profile, POST /profile/avatar)
- Avatar upload with multer (5MB limit, image files only)
- ProfileSettings component in Settings page
- Avatar storage in uploads/avatars directory
- Automatic cleanup of old avatars on new upload
- Dashboard personalized welcome message
- UI layout fixes for proper flex height in Chat/Notebook views
- Password change functionality (POST /auth/reset-password)
  - Requires authentication (change password while logged in)
  - Modal UI for entering and confirming new password
  - Client-side validation (min 6 chars, password match)
  - Secure password hashing with bcrypt

### Password Recovery Phase ✅ COMPLETED
- Forgot password flow for unauthenticated users
- Password reset token generation with secure random tokens
- Token storage with SHA256 hashing and 1-hour expiration
- Backend endpoints:
  - POST /auth/forgot-password - Request password reset
  - POST /auth/reset-password-token - Reset password with token
- Frontend components:
  - ForgotPassword - Request password reset by email
  - ResetPassword - Reset password using token
- Email utility placeholder (ready for production email service)
- Security features:
  - Generic responses to prevent email enumeration
  - Secure token generation and hashing
  - Token expiration and single-use enforcement
- Development features:
  - Token displayed in UI for testing
  - Email content logged to console

### Data Backup & Import Phase ✅ COMPLETED
- Backend endpoints for data export/import with validation
- Export all user data as JSON file (projects, tasks, notebooks, tags, etc.)
- Import preview functionality to validate data before importing
- BackupSettings component in Settings page
- Transaction-based import with proper ID mapping
- Maintains all relationships between entities
- Non-destructive import (adds data without overwriting)

### Database Schema Debugging & Resolution ✅ COMPLETED
- **Root Cause Identified**: Frontend-backend field mismatch after migrations
  - Database had migrated from `projects.name` to `projects.title`
  - Frontend components still expecting `name` field
  - Project titles showing "Loading..." when `project.name` was undefined
- **Migration Created**: `20250731121105_rename_projects_name_to_title.ts`
  - Properly renames the database column with rollback support
- **Models Created**: 
  - `Notebook.ts` - Comprehensive model with associations and page counts
  - `NotebookPage.ts` - Page model with starred functionality and ownership verification
- **Frontend Components Updated**:
  - `Board.tsx`, `ProjectList.tsx`, `Dashboard.tsx` - Updated to use `title` field
  - Type interfaces updated to match backend schema
- **Routes Refactored**:
  - `notebooks.routes.ts` - Now uses Notebook and NotebookPage models
  - `projects.routes.ts` - Supports both `name` and `title` for backward compatibility
- **Build System Fixed**:
  - Cleaned up compiled JavaScript migration files
  - Updated knexfile to use TypeScript consistently across all environments
  - Fixed TypeScript migration execution with ts-node

### MVP Status
✅ **100% COMPLETE** - All MVP features have been successfully implemented!

## User Feedback Integration and Its Impact on Development

*To be populated as user feedback is received*

### Planned Feedback Channels
- In-app feedback widget
- GitHub issues
- User surveys
- Analytics data

### Feedback Categories
- Feature requests
- Bug reports
- UX improvements
- Performance issues

## Additional Documentation References

- **README.md** - Project overview and setup instructions
- **.env.example** - Backend environment configuration template
- **.env.production** - Production environment template for Replit
- **.env.docker** - Docker-specific environment template
- **frontend/.env.example** - Frontend environment configuration template
- **frontend/.env.production** - Frontend production configuration
- **DEPLOY_REPLIT.md** - Comprehensive Replit deployment guide
- **DEPLOY_DOCKER.md** - Docker deployment guide with compose setup
- **ecosystem.config.js** - PM2 process management configuration
- **claude_docs/featureIdeas.md** - Future feature considerations (if exists)

### Key Configuration Files
- **vite.config.ts** - Frontend build configuration with proxy support
- **nodemon.json** - Backend development server configuration
- **tsconfig.json** (root and per-workspace) - TypeScript configurations

## Development Considerations

### Code Organization
- Feature-based folder structure
- Shared types in dedicated folder
- Clear separation of concerns
- Consistent naming conventions

### State Management Strategy
- Local state for component-specific data
- Context API for global app state
- Future: Consider Redux/Zustand for complex state

### API Design Principles
- RESTful endpoints
- Consistent error responses
- Proper HTTP status codes
- Request validation

### Security Measures
- Input sanitization
- SQL injection prevention
- XSS protection
- Secure authentication flow

### Deployment Configuration (Multiple Options)
#### Replit Deployment
- Production build process configured
- Static file serving from backend in production
- CORS settings updated for Replit domains
- SQLite persistence in /home/runner/ezra-data/
- Environment-based configuration
- Automated setup script for easy deployment

#### Docker Deployment
- Multi-stage Dockerfiles for optimized builds
- Consolidated Docker configuration in docker/ directory
- Single docker-compose.yml with profiles:
  - default: Basic SQLite setup
  - postgres: PostgreSQL database
  - pgadmin: Database management UI
  - backup: Automated backups
  - ssl: HTTPS with nginx
  - production: Full production setup
  - alt-ports: Alternative port configuration
- SSL/HTTPS support with self-signed certificates
- Docker Compose v2 compatibility
- Dockge deployment support with pre-built images
- Interactive quick-start script for easy setup
- Nginx reverse proxy for SSL termination
- Volume mounts for data persistence
- Health checks and restart policies
- Frontend exposed on port 3005 (or 443 with SSL)
- Backend API on port 6001
- Python 3.12 compatibility fixes included