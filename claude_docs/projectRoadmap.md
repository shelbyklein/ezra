# Project Roadmap - Ezra

## Overview
Ezra is an intelligent kanban board application with AI-powered task management, markdown notes, and future mind-mapping capabilities.

## High-Level Goals

### Phase 1: MVP Kanban Board
Create a functional kanban board with AI-powered task management

- [x] Database schema and migrations (users, projects, tasks, notes)
- [x] User authentication system (JWT-based)
- [x] Task CRUD operations (Create, Read, Update, Delete)
- [x] Project CRUD operations
- [x] Notes CRUD operations
- [x] Task reordering endpoint for drag-and-drop
- [x] Frontend authentication flow (login/register)
- [x] Project management UI (list, create, edit, delete)
- [x] Responsive UI foundation with Chakra UI
- [x] Basic kanban board UI (three columns, task display)
- [x] Task cards with priority and due date indicators
- [x] Drag-and-drop functionality with @dnd-kit
- [x] Development tools for testing (data reset, seeding)
- [x] Task creation and editing UI
- [x] Dark/light mode with system preference support
- [x] Project color customization
- [x] Comprehensive tags system for task organization
- [x] API key management for users
- [x] AI-powered task enhancement using Claude API
- [x] Natural language task creation and management
- [x] Conversational AI interface as primary interaction
- [x] Keyboard shortcuts for improved productivity

### Phase 2: Notebook System ✅ COMPLETED
Implement a comprehensive notebook system with WYSIWYG editing

- [x] Rich text editing with TipTap WYSIWYG editor
- [x] Hierarchical folder structure for organization
- [x] Drag-and-drop file management
- [x] Auto-save functionality
- [x] Slash commands for quick formatting
- [x] Drag pages/folders to notebook root
- [x] Notebook-project associations (linking notebooks to projects)
- [x] Notebook cover page with metadata display
- [x] Notebook tags support
- [ ] Attach pages to specific tasks
- [ ] AI-powered content generation and summarization
- [ ] Full-text search capabilities
- [ ] Export functionality (PDF, Markdown)

### Phase 3: Mind Mapping (Future)
Develop mind mapping capabilities for knowledge management

- [ ] Canvas-based mind mapping interface
- [ ] Multiple node types (text, URL, image, task references)
- [ ] AI-powered mind map generation
- [ ] Export capabilities (PNG, SVG, JSON)
- [ ] Integration with kanban tasks

## Key Features

### Core Functionality
- Drag-and-drop kanban board
- Real-time updates
- Multi-project support
- Task prioritization and categorization
- Due dates and reminders

### AI Integration
- Task description enhancement
- Smart task suggestions
- Automated task categorization
- Natural language task creation
- AI-powered insights and analytics

### Collaboration (Future)
- Team workspaces
- Real-time collaboration
- Comments and mentions
- Activity tracking

## Technical Considerations

### Scalability
- Database migration path (SQLite → PostgreSQL)
- Caching strategy for performance
- API rate limiting
- Horizontal scaling capabilities

### Security
- Secure API key storage
- User authentication and authorization
- Data encryption
- CORS configuration

## Completion Criteria

### MVP Release
- [x] Functional kanban board with all CRUD operations
- [x] User authentication working
- [x] Drag-and-drop task management
- [x] Tags system for organization
- [x] Dark/light mode support
- [x] AI task enhancement functional
- [x] Responsive design implemented
- [ ] Basic testing coverage
- [ ] Deployment ready

### Production Ready
- [ ] Comprehensive test suite
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Documentation complete
- [ ] CI/CD pipeline configured

## Completed Tasks

### Project Setup Phase
- [x] Project initialization and setup
- [x] Documentation structure created (claude_docs)
- [x] Monorepo configuration with npm workspaces
- [x] Frontend scaffolding (React + TypeScript + Chakra UI)
- [x] Backend scaffolding (Express + TypeScript)
- [x] Shared types package structure
- [x] TypeScript configuration for all workspaces
- [x] Environment configuration templates
- [x] Development scripts for flexible deployment
- [x] Basic API service setup with axios
- [x] Vite configuration with environment variable support
- [x] CORS configuration for separate server deployment
- [x] Basic health check endpoint
- [x] Project documentation (README.md)

### Backend Implementation Phase
- [x] Database setup with Knex.js and SQLite
- [x] Database migrations for all entities
- [x] User model and authentication implementation
- [x] JWT token generation and verification
- [x] Authentication middleware
- [x] Project CRUD endpoints
- [x] Task CRUD endpoints with position tracking
- [x] Notes CRUD endpoints
- [x] Task reordering endpoint for drag-and-drop
- [x] API endpoint testing
- [x] Proper error handling and responses

### Frontend Implementation Phase
- [x] React Router setup with navigation
- [x] Authentication context and JWT management
- [x] Login and register components
- [x] Protected routes implementation
- [x] App layout with responsive navigation
- [x] Project list with grid view
- [x] Create/edit project modal
- [x] React Query integration
- [x] Form validation with react-hook-form
- [x] Toast notifications for user feedback
- [x] @chakra-ui/icons dependency fix

### Kanban Board Implementation Phase
- [x] Board component with project context
- [x] Task fetching with React Query
- [x] Three-column layout (Todo, In Progress, Done)
- [x] BoardColumn component with counts
- [x] TaskCard component with rich display
- [x] Priority color indicators
- [x] Smart due date formatting
- [x] Responsive grid layout
- [x] Loading and error states
- [x] Hover effects and visual feedback

### Drag-and-Drop Implementation Phase
- [x] @dnd-kit integration with DndContext
- [x] Draggable task cards with useSortable
- [x] Droppable columns with useDroppable
- [x] Drag event handlers (start, over, end)
- [x] Optimistic updates for smooth UX
- [x] Task reordering within columns
- [x] Task movement between columns
- [x] Visual feedback during drag operations
- [x] Backend persistence of changes

### Development Tools Phase
- [x] Backend dev routes (reset, seed, stats)
- [x] Environment-based protection
- [x] Database reset endpoints
- [x] Sample data generation
- [x] User-specific data clearing
- [x] Frontend developer tools panel in Settings
- [x] Database reset functionality with modals
- [x] Statistics display with auto-refresh

### Task Management UI Phase
- [x] Task creation form with validation
- [x] Task detail/edit modal
- [x] Delete task functionality
- [x] Click-to-view task details
- [x] Inline editing capabilities
- [x] Form validation with react-hook-form
- [x] Toast notifications for feedback

### Theme and Customization Phase
- [x] Dark/light mode toggle implementation
- [x] System color preference detection
- [x] Semantic color tokens for consistent theming
- [x] Theme persistence across sessions
- [x] Project color picker with hex input
- [x] Color display throughout UI

### Tags System Phase
- [x] Database schema for tags (many-to-many)
- [x] Tags CRUD API endpoints
- [x] Tags management UI in Settings
- [x] Custom color picker for tags
- [x] Tag assignment during task creation
- [x] Tag display on task cards
- [x] Tag editing in task detail modal
- [x] User-specific tag isolation
- [x] Overflow handling for multiple tags

### Project Tags & Attachments Phase
- [x] Project tags database schema (project_tags table)
- [x] Project tags API endpoints
- [x] Project tags display on project cards
- [x] Tag selection in create/edit project modal
- [x] Attachments database schema (supporting files, URLs, notes)
- [x] Attachments CRUD API endpoints
- [x] Task attachments UI component
- [x] Support for URL, note, and file attachments
- [x] Attachment management in task detail modal

### Notebook System Phase
- [x] Complete database schema (notebooks, folders, pages, blocks)
- [x] Full backend API for notebooks CRUD operations
- [x] TipTap WYSIWYG editor integration
- [x] Rich text editing with formatting toolbar
- [x] Slash commands for quick content insertion
- [x] Hierarchical folder structure with nesting
- [x] Drag-and-drop file management for pages and folders
- [x] Auto-save functionality with debouncing
- [x] JSON-based content storage for flexibility
- [x] Visual file/folder icons for better UX
- [x] Auto-expand folders during drag operations
- [x] Batch update API for efficient position changes

### Development Environment Improvements
- [x] Port configuration changed from 3001 to 5001
- [x] Automatic port cleanup with kill-port
- [x] Startup scripts for clean development
- [x] Fixed infinite loop in CreateProjectModal
- [x] TypeScript error fixes in editor components

### API Key Management Phase
- [x] Database migration for anthropic_api_key field
- [x] User routes for API key CRUD operations
- [x] Secure encryption/decryption for API keys
- [x] ApiKeySettings component in Account Settings
- [x] Anthropic utility functions for AI operations
- [x] Fixed user profile query column names

### AI-Powered Features Phase
- [x] Natural language task creation via command bar (Cmd/Ctrl + K)
- [x] AI chat endpoint for conversational interface
- [x] Task enhancement with Claude API
- [x] Context-aware AI responses (current project, recent tasks)
- [x] Support for task CRUD via natural language
- [x] Navigation commands through chat
- [x] Error handling for AI responses
- [x] Model updated to Claude 3.5 Sonnet

### Dashboard & Chat Interface Redesign
- [x] Dashboard as home page showing recent activity
- [x] Recent projects display with task counts and tags
- [x] Recent notebooks display with page counts
- [x] Floating chat bubble interface
- [x] Expandable/collapsible chat window
- [x] Chat context awareness (current page/project)
- [x] Backend endpoints for recent items
- [x] Time-based activity display with date-fns

### AI Chat Enhancements Phase
- [x] React hooks error fix in ChatBubble component
- [x] Task creation functionality in chat bubble
- [x] Task update/move functionality
- [x] Task deletion functionality
- [x] Improved JSON parsing with error handling
- [x] Fallback patterns for natural language commands
- [x] Debug logging for troubleshooting

### Notebook AI Integration Phase
- [x] Context-aware notebook editing via chat
- [x] Page content update functionality (append/replace)
- [x] Markdown to TipTap JSON conversion
- [x] Create new pages through chat
- [x] Fixed TipTap duplicate extension warning
- [x] Query invalidation for real-time updates
- [x] Proper content refresh after AI edits
- [x] Highlight feature for AI-created content
- [x] Fixed navigation context updates

### UI/UX Enhancement Phase
- [x] Breadcrumb footer for navigation context
- [x] Context-aware chat bubble header
- [x] Dynamic greeting messages based on location
- [x] Fixed page navigation URL updates
- [x] React hooks initialization fixes

### Navigation & Chat Improvements Phase
- [x] Reorganized navigation header (Home, Chat, Projects, Notebooks)
- [x] Created dedicated Chat page component at /app/chat
- [x] Full conversation history with user/assistant avatars
- [x] Markdown rendering for AI responses in chat
- [x] Auto-scroll to bottom in chat conversations
- [x] Updated default /app redirect to go to Chat page
- [x] Removed "Board" from main navigation (accessible via project cards)

### Keyboard Shortcuts Implementation Phase
- [x] Created useKeyboardShortcuts hook for global keyboard handling
- [x] Task creation shortcut (N)
- [x] Task editing shortcut (E)
- [x] Task deletion shortcut (Delete)
- [x] Task status cycling (Space)
- [x] Task navigation with arrow keys (up/down)
- [x] Task movement between columns (left/right arrows)
- [x] AI command bar shortcut (Cmd/Ctrl + K)
- [x] Search placeholder (/)
- [x] Help modal (?)
- [x] Visual selection indicator on tasks
- [x] Keyboard shortcut tooltips on buttons
- [x] Escape key to deselect/close modals

### Notebook-Project Integration Phase
- [x] Added project_id field to notebooks table
- [x] Updated notebook API routes to include project information
- [x] Created notebook cover page with metadata display
- [x] Project dropdown selector in notebook edit mode
- [x] Display linked notebooks as clickable pills on project board
- [x] Made project links clickable on notebook cover page
- [x] Added notebook tags support (many-to-many relationship)
- [x] Visual design improvements with project color indicators

### UI/UX Polish Phase
- [x] Fixed overlapping buttons in task detail modal
- [x] Moved action buttons to modal footers
- [x] Removed unnecessary "Close" buttons
- [x] Added edit button to project board header
- [x] Improved modal layouts for better user experience

### User Profile Management Phase
- [x] User profile view endpoint with avatar support
- [x] User profile update endpoint (username, avatar)
- [x] Avatar upload with multer (5MB limit, image files only)
- [x] ProfileSettings component with avatar display/upload
- [x] Display user email, username, and member since date
- [x] Avatar storage in uploads/avatars directory
- [x] Automatic cleanup of old avatars on new upload
- [x] Dashboard personalized welcome message with settings button
- [x] UI layout fixes for Chat and Notebook views
- [x] Full-width layout for individual notebook views

### Data Backup & Import Phase
- [x] Backend endpoints for data export (JSON format)
- [x] Backend endpoints for data import with validation
- [x] Import preview functionality
- [x] BackupSettings component in Settings page
- [x] Export all user data (projects, tasks, notebooks, tags, attachments)
- [x] Import with proper ID mapping and relationship preservation
- [x] Transaction-based import for data integrity
- [x] User-friendly UI with clear warnings and previews