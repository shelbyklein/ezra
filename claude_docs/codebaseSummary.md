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
│   │   └── 009_add_user_api_key.ts
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
├── .env.example           # Backend environment template
├── .gitignore             # Git ignore rules
├── tsconfig.json          # Root TypeScript config
├── package.json           # Root workspace configuration
└── README.md              # Project documentation
```

## Key Components and Their Interactions

### Frontend Components (Implemented)
- **Auth/** - Authentication components
  - Login - User login form with validation
  - Register - User registration form
  - ProtectedRoute - Route guard for authenticated users
  - LoginDevTools - Development tools access from login
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
  - Chat - Dedicated full-page chat interface (/app/chat) ✅
    - Full conversation history with user/assistant avatars ✅
    - Markdown rendering for AI responses ✅
    - Auto-scroll to bottom ✅
    - Clean centered layout ✅
  - NaturalLanguageInput - Command bar (Cmd/Ctrl + K) ✅
- **Dashboard/** - Recent activity display
  - Dashboard - Shows 3 recent projects and notebooks ✅
- **Layout/** - Application structure components
  - AppLayout - Main layout with navigation bar and user menu ✅
  - BreadcrumbFooter - Fixed footer showing navigation hierarchy ✅
    - Dynamic breadcrumb generation based on route ✅
    - Fetches names for projects/notebooks/pages ✅
    - Clickable navigation to parent sections ✅

### Backend Structure
- **routes/** - API endpoint definitions
  - auth.routes.ts - Authentication (register/login)
  - projects.routes.ts - Project CRUD + tags integration + /recent endpoint
  - tasks.routes.ts - Task CRUD + reordering + tags fetching + /natural-language endpoint
  - notes.routes.ts - Notes CRUD operations
  - tags.routes.ts - Tags CRUD + task/project assignment
  - attachments.routes.ts - Task attachments CRUD
  - notebooks.routes.ts - Notebooks, folders, pages CRUD + batch updates + /recent endpoint
  - users.routes.ts - User profile + API key management
  - ai.routes.ts - AI chat endpoint (/chat) for conversational interface
    - Context-aware processing (current notebook/page/project)
    - Action execution (task CRUD, page updates, navigation)
    - Markdown to TipTap conversion for page editing
    - Support for highlight parameter in update_page action
  - dev.routes.ts - Development tools (reset-all, reset-user, seed, stats)
- **models/** - Database models with TypeScript interfaces
  - User.ts - User authentication model
  - Project.ts - Project model
  - Task.ts - Task model with position tracking
- **middleware/** - Request processing
  - auth.middleware.ts - JWT token verification
- **utils/** - Helper functions
  - jwt.ts - Token generation and verification
  - anthropic.ts - Claude API integration, task enhancement, and natural language parsing
  - parseMarkdownToTipTap() - Converts markdown to TipTap JSON format
    - Now supports highlight parameter for marking new content
- **migrations/** - Database schema versioning
  - Knex.js migrations for all entities
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
- **frontend/.env.example** - Frontend environment configuration template
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