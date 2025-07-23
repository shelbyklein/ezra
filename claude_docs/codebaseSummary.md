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
│   │   └── index.ts       # Server entry point with health check
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

### Frontend Components
- **Board/** - Kanban board implementation
  - BoardContainer - Main board layout
  - Column - Kanban columns (To Do, In Progress, Done)
  - Card - Draggable task cards
- **Task/** - Task management
  - TaskForm - Create/edit tasks
  - TaskDetail - View task details
  - TaskList - List view of tasks
- **AI/** - AI integration components
  - AIAssistant - Chat interface
  - TaskEnhancer - AI task improvement
- **Layout/** - Application structure
  - Header - Navigation and user menu
  - Sidebar - Project navigation
  - MainContent - Primary content area

### Backend Structure
- **routes/** - API endpoint definitions
  - auth.routes - Authentication endpoints
  - tasks.routes - Task CRUD operations
  - projects.routes - Project management
  - ai.routes - AI integration endpoints
- **controllers/** - Request handling logic
- **models/** - Database models
- **middleware/** - Authentication, error handling
- **utils/** - Helper functions

## Data Flow

1. **User Interaction** → React Components
2. **API Calls** → Frontend Services → Axios/Fetch
3. **Backend Routes** → Controllers → Database Operations
4. **AI Integration** → Claude API → Response Processing
5. **State Updates** → React Context → UI Updates

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

- Initial project structure created with npm workspaces
- Documentation framework established
- Technology stack decisions finalized
- Separate server configuration implemented
- Environment-based API configuration added
- Basic frontend and backend entry points created
- TypeScript configuration for all workspaces
- Development scripts for flexible deployment options

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