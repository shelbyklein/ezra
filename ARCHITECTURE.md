# Ezra Architecture

## Overview

Ezra follows a layered architecture pattern designed for flexibility, testability, and extensibility. The system is built with a local-first approach, core functionality that works independently, and optional AI enhancements.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interfaces                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐   │
│  │   CLI   │  │ Web UI  │  │   API   │  │ Desktop App │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └──────┬──────┘   │
└───────┼────────────┼────────────┼──────────────┼───────────┘
        │            │            │              │
┌───────┴────────────┴────────────┴──────────────┴───────────┐
│                    Interface Adapter Layer                   │
│         (Command Parser, Request Handler, WebSocket)         │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                      Core Business Logic                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Task Engine │  │ Project Mgmt │  │ Analytics Engine│   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                     Data Persistence Layer                   │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │ Local SQLite │  │ File Storage│  │  Cloud Sync     │   │
│  └──────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    External Services (Optional)              │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │ Calendar API │  │ GitHub API  │  │ Email Service   │   │
│  └──────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘

                    ┌─── Optional AI Layer ───┐
                    │ (Added in Phase 4)      │
┌─────────────────────────────────────────────────────────────┐
│                   AI Enhancement Layer (Optional)            │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │ NLP Processor│  │ Task Suggest │  │ Intent Analyzer │   │
│  └──────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    LLM Providers (Optional)                  │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │    OpenAI    │  │  Anthropic  │  │  Local LLM      │   │
│  └──────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Core Components (AI-Independent)

### 1. Task Engine
**Purpose**: Central management of all task-related operations

**Key Responsibilities**:
- Task CRUD operations
- Task dependency management
- Status tracking and updates
- Priority management
- Due date handling
- Task templates

**Interfaces**:
```typescript
interface TaskEngine {
  createTask(params: CreateTaskParams): Promise<Task>
  updateTask(id: string, updates: Partial<Task>): Promise<Task>
  deleteTask(id: string): Promise<void>
  getTask(id: string): Promise<Task>
  listTasks(filters: TaskFilters): Promise<Task[]>
  getTasksByProject(projectId: string): Promise<Task[]>
  completeTask(id: string): Promise<Task>
  // AI methods added later as optional enhancements
  suggestSubtasks?(task: Task): Promise<Task[]>
}
```

### 2. Project Management
**Purpose**: Handle project-level operations and organization

**Key Responsibilities**:
- Project lifecycle management
- Project templates
- Progress calculation (based on task completion)
- Project statistics
- Archive management

**Interfaces**:
```typescript
interface ProjectManager {
  createProject(params: CreateProjectParams): Promise<Project>
  updateProject(id: string, updates: Partial<Project>): Promise<Project>
  archiveProject(id: string): Promise<void>
  getProjectStats(id: string): Promise<ProjectStats>
  calculateProgress(projectId: string): Promise<number>
  // AI methods added later as optional
  suggestNextActions?(projectId: string): Promise<Action[]>
}
```

### 3. Analytics Engine
**Purpose**: Generate insights without requiring AI

**Features**:
- Task completion rates
- Time-based analytics
- Progress tracking
- Productivity trends
- Custom date ranges
- Export functionality

**Interfaces**:
```typescript
interface AnalyticsEngine {
  getCompletionRate(timeRange: TimeRange): Promise<number>
  getProductivityTrends(): Promise<TrendData>
  getProjectProgress(projectId: string): Promise<ProgressData>
  generateReport(options: ReportOptions): Promise<Report>
}
```

### 4. Command Parser
**Purpose**: Parse structured CLI commands

**Features**:
- Structured command parsing
- Argument validation
- Help generation
- Command aliases
- No AI dependency

**Example Commands**:
```bash
ezra project create "Website Redesign"
ezra task add "Design homepage" --project 123 --priority high
ezra task list --status in-progress --due-before tomorrow
```

## Optional AI Enhancement Layer

### When Added (Phase 4)
The AI layer is added as an optional enhancement that:
- Never breaks core functionality
- Can be disabled entirely
- Provides fallbacks to structured commands
- Enhances but doesn't replace existing features

### AI Components

#### 1. NLP Processor
**Purpose**: Parse natural language into structured commands

**Features**:
- Natural language understanding
- Intent detection
- Entity extraction
- Fallback to structured parsing

#### 2. Task Suggester
**Purpose**: Provide intelligent task suggestions

**Features**:
- Task breakdown suggestions
- Priority recommendations
- Time estimates
- Similar task detection

#### 3. Intent Analyzer
**Purpose**: Understand user intent from context

**Features**:
- Context maintenance
- Multi-turn conversations
- Ambiguity resolution
- Command suggestions

### AI Integration Pattern
```typescript
// Core functionality works without AI
class TaskService {
  private aiEnhancer?: AIEnhancer;

  constructor(options: { enableAI?: boolean }) {
    if (options.enableAI) {
      this.aiEnhancer = new AIEnhancer();
    }
  }

  async createTask(input: string | CreateTaskParams): Promise<Task> {
    let params: CreateTaskParams;
    
    if (typeof input === 'string' && this.aiEnhancer) {
      // Try AI parsing
      try {
        params = await this.aiEnhancer.parseTaskInput(input);
      } catch {
        // Fallback to structured command
        throw new Error('Please use structured format: task add <title>');
      }
    } else {
      params = input as CreateTaskParams;
    }
    
    // Core logic works the same regardless
    return this.taskEngine.createTask(params);
  }
}
```

## Data Models

### Core Entities
```typescript
interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'archived' | 'completed'
  createdAt: Date
  updatedAt: Date
}

interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  dependencies?: string[]
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}
```

## Development Patterns

### Dependency Injection
```typescript
// Core services work without AI
const taskEngine = new TaskEngine(taskRepository);
const projectManager = new ProjectManager(projectRepository);
const analyticsEngine = new AnalyticsEngine(taskRepository, projectRepository);

// AI can be injected later
if (config.enableAI) {
  const aiService = new AIService(config.aiProvider);
  taskEngine.setAIEnhancer(aiService);
}
```

### Progressive Enhancement
1. **Phase 1-3**: Build complete functionality without AI
2. **Phase 4**: Add AI as optional enhancement
3. **Always**: Maintain non-AI fallbacks

### Feature Flags
```typescript
interface Features {
  enableAI: boolean
  enableNaturalLanguage: boolean
  enableTaskSuggestions: boolean
  enablePredictiveAnalytics: boolean
}
```

## Testing Strategy

### Core Testing (No AI Required)
```typescript
describe('TaskEngine', () => {
  it('creates tasks with structured input', async () => {
    const task = await taskEngine.createTask({
      title: 'Test Task',
      projectId: '123'
    });
    expect(task.title).toBe('Test Task');
  });
});
```

### AI Testing (When Added)
```typescript
describe('TaskEngine with AI', () => {
  it('creates tasks from natural language', async () => {
    const task = await taskEngine.createTask(
      'Create a task to review the budget by Friday'
    );
    expect(task.title).toContain('review the budget');
    expect(task.dueDate).toBeDefined();
  });

  it('falls back when AI fails', async () => {
    mockAIService.fail();
    await expect(
      taskEngine.createTask('invalid input')
    ).rejects.toThrow('Please use structured format');
  });
});
```

## Security Architecture

### Core Security
- Input validation for all commands
- SQL injection prevention
- Local data encryption
- Secure credential storage

### AI Security (When Added)
- Prompt injection prevention
- API key management
- Rate limiting
- Response validation

## Performance Considerations

### Core Performance
- SQLite indexes on common queries
- Efficient pagination
- Lazy loading
- < 100ms response time for all operations

### AI Performance (When Added)
- Response caching
- Streaming for long operations
- Timeout handling
- Graceful degradation

## Deployment Architecture

### Phase 1-3 Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Phase 4+ Deployment
- Add AI service configuration
- Optional API key management
- Feature flag configuration
- Monitoring for AI usage

## Architecture Principles

1. **Core Independence**: Every feature must work without AI
2. **Progressive Enhancement**: AI improves but never replaces
3. **Graceful Degradation**: System remains functional if AI fails
4. **User Control**: AI features can be completely disabled
5. **Local First**: Full functionality without internet (except AI)
6. **Performance First**: Core operations < 100ms
7. **Type Safety**: Full TypeScript coverage
8. **Testability**: All components independently testable

This architecture ensures Ezra is a robust project management tool that works excellently on its own, with AI serving as an optional enhancement layer that can be added when desired.