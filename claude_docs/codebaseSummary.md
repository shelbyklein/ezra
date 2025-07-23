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
│   │   ├── projects.routes.ts # Project CRUD
│   │   ├── tasks.routes.ts # Task CRUD + reordering
│   │   └── notes.routes.ts # Notes CRUD
│   ├── middleware/
│   │   └── auth.middleware.ts # JWT authentication
│   ├── models/            # Database models
│   │   ├── User.ts        # User model
│   │   ├── Project.ts     # Project model
│   │   └── Task.ts        # Task model
│   ├── utils/
│   │   └── jwt.ts         # JWT token utilities
│   ├── migrations/        # Database migrations
│   │   ├── 20240101_create_users.ts
│   │   ├── 20240102_create_projects.ts
│   │   ├── 20240103_create_tasks.ts
│   │   └── 20240104_create_notes.ts
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
- **Layout/** - Application structure
  - AppLayout - Main layout with navigation bar
- **Projects/** - Project management
  - ProjectList - Grid view of all projects
  - CreateProjectModal - Create/edit project form

### Frontend Components (Planned)
- **Board/** - Kanban board implementation
  - Board - Main board container
  - Column - Kanban columns (Todo, In Progress, Done)
  - TaskCard - Draggable task cards
- **Tasks/** - Task management
  - CreateTaskForm - Add new tasks
  - TaskDetailModal - View/edit task details
- **AI/** - AI integration
  - TaskEnhancer - AI-powered task improvement

### Backend Structure
- **routes/** - API endpoint definitions
  - auth.routes.ts - Authentication (register/login)
  - projects.routes.ts - Project CRUD operations
  - tasks.routes.ts - Task CRUD + reordering endpoint
  - notes.routes.ts - Notes CRUD operations
- **models/** - Database models with TypeScript interfaces
  - User.ts - User authentication model
  - Project.ts - Project model
  - Task.ts - Task model with position tracking
- **middleware/** - Request processing
  - auth.middleware.ts - JWT token verification
- **utils/** - Helper functions
  - jwt.ts - Token generation and verification
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
7. **AI Integration** (planned) → Claude API → Task Enhancement

## External Dependencies

### Frontend Dependencies
- react, react-dom - Core React
- @chakra-ui/react - UI components
- @dnd-kit/sortable - Drag and drop
- react-markdown - Markdown rendering
- axios - HTTP client
- typescript - Type safety

### Backend Dependencies
- express - Web framework
- knex - SQL query builder
- sqlite3 - Database (initial)
- jsonwebtoken - Authentication
- bcrypt - Password hashing
- anthropic - Claude API client
- cors - Cross-origin support
- dotenv - Environment variables

### Development Dependencies
- vite - Frontend build tool
- nodemon - Backend hot reload
- concurrently - Run multiple processes
- eslint - Linting
- prettier - Code formatting
- ts-node - TypeScript execution
- @types/* - TypeScript definitions

## Recent Significant Changes

### Initial Setup (Completed)
- Initial project structure created with npm workspaces
- Documentation framework established
- Technology stack decisions finalized
- Separate server configuration implemented
- Environment-based API configuration added
- Basic frontend and backend entry points created
- TypeScript configuration for all workspaces
- Development scripts for flexible deployment options

### Backend Implementation (Completed)
- Database setup with Knex.js and SQLite
- Complete database schema with migrations
- User authentication system with JWT tokens
- Full CRUD API endpoints for projects, tasks, and notes
- Task reordering endpoint for drag-and-drop support
- Proper error handling and response formatting
- API endpoint testing suite
- Authentication middleware with user context

### Frontend Implementation (In Progress)
- React Router setup with protected routes
- Authentication system with JWT management
- Login and register forms with validation
- Project management UI (list, create, edit, delete)
- React Query for server state management
- Chakra UI component integration
- Fixed @chakra-ui/icons dependency issue
- Application layout with responsive navigation

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