# Ezra Development Guide

This guide provides comprehensive information for developers working on Ezra, including setup instructions, architecture details, and best practices.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Core Concepts](#core-concepts)
4. [AI Integration](#ai-integration)
5. [Testing Strategy](#testing-strategy)
6. [Debugging](#debugging)
7. [Performance Optimization](#performance-optimization)
8. [Security Guidelines](#security-guidelines)
9. [Deployment](#deployment)

## Development Setup

### Prerequisites

- Node.js 18+ (recommend using nvm)
- Git
- PostgreSQL 14+ (for production-like environment)
- Redis (for caching and queues)
- An LLM API key (OpenAI or Anthropic)

### Initial Setup

1. **Clone and install**:
   ```bash
   git clone https://github.com/yourusername/ezra.git
   cd ezra
   npm install
   ```

2. **Environment configuration**:
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your settings
   ```

3. **Database setup**:
   ```bash
   npm run db:create
   npm run db:migrate
   npm run db:seed  # Optional: add sample data
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

### Development Tools

#### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "orta.vscode-jest",
    "aaron-bond.better-comments",
    "wayou.vscode-todo-highlight"
  ]
}
```

#### Git Hooks
Pre-commit hooks are configured using Husky:
- Linting (ESLint)
- Formatting (Prettier)
- Type checking (TypeScript)
- Unit tests for changed files

## Project Structure

```
ezra/
├── src/
│   ├── core/                 # Business logic
│   │   ├── projects/        # Project management
│   │   ├── tasks/          # Task management
│   │   └── analytics/      # Analytics engine
│   ├── ai/                  # AI services
│   │   ├── providers/      # LLM provider adapters
│   │   ├── processors/     # NLP processors
│   │   └── prompts/        # Prompt templates
│   ├── interfaces/          # User interfaces
│   │   ├── cli/           # Command line interface
│   │   ├── api/           # REST API
│   │   └── web/           # Web UI (React)
│   ├── data/               # Data layer
│   │   ├── models/        # Data models
│   │   ├── repositories/  # Data access
│   │   └── migrations/    # Database migrations
│   ├── integrations/       # External integrations
│   └── shared/             # Shared utilities
├── tests/                  # Test files
├── scripts/                # Build and utility scripts
└── docs/                   # Documentation
```

## Core Concepts

### Domain-Driven Design

Ezra follows DDD principles with clear boundaries:

```typescript
// Domain entity
export class Project {
  private constructor(
    private readonly id: ProjectId,
    private name: string,
    private description: string,
    private status: ProjectStatus
  ) {}

  static create(params: CreateProjectParams): Project {
    // Factory method with validation
  }

  rename(newName: string): void {
    // Business logic here
  }
}

// Repository interface
export interface ProjectRepository {
  save(project: Project): Promise<void>
  findById(id: ProjectId): Promise<Project | null>
  findAll(filter: ProjectFilter): Promise<Project[]>
}
```

### Event-Driven Architecture

Key events flow through the system:

```typescript
// Event definition
export class TaskCompletedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly completedAt: Date
  ) {
    super();
  }
}

// Event handler
@EventHandler(TaskCompletedEvent)
export class UpdateProjectProgressHandler {
  async handle(event: TaskCompletedEvent): Promise<void> {
    // Update project progress
  }
}
```

## AI Integration

### Provider Abstraction

```typescript
// AI provider interface
export interface AIProvider {
  generateCompletion(prompt: string, options?: CompletionOptions): Promise<string>
  parseCommand(input: string): Promise<ParsedCommand>
  suggestTasks(context: TaskContext): Promise<TaskSuggestion[]>
}

// Implementation
export class OpenAIProvider implements AIProvider {
  async generateCompletion(prompt: string, options?: CompletionOptions): Promise<string> {
    // OpenAI specific implementation
  }
}
```

### Prompt Engineering

```typescript
// Prompt template
export const taskSuggestionPrompt = `
Given the following project context:
Project: {{projectName}}
Description: {{projectDescription}}
Existing tasks: {{existingTasks}}

Suggest 5 relevant tasks that would help complete this project.
Format each task as: "- [Task Title]: Brief description"
`;

// Usage
const prompt = renderTemplate(taskSuggestionPrompt, {
  projectName: project.name,
  projectDescription: project.description,
  existingTasks: tasks.map(t => t.title).join(', ')
});
```

### Response Caching

```typescript
export class AICache {
  private cache: LRUCache<string, CachedResponse>

  async get(key: string): Promise<string | null> {
    const cached = this.cache.get(key)
    if (cached && !this.isExpired(cached)) {
      return cached.response
    }
    return null
  }
}
```

## Testing Strategy

### Test Types

1. **Unit Tests** (Jest)
   ```typescript
   describe('TaskEngine', () => {
     it('should create task with valid input', async () => {
       const task = await taskEngine.createTask({
         title: 'Test Task',
         projectId: 'proj_123'
       })
       expect(task.title).toBe('Test Task')
     })
   })
   ```

2. **Integration Tests**
   ```typescript
   describe('Project API', () => {
     it('should create project via API', async () => {
       const response = await request(app)
         .post('/api/v1/projects')
         .send({ name: 'Test Project' })
       expect(response.status).toBe(201)
     })
   })
   ```

3. **E2E Tests** (Playwright)
   ```typescript
   test('complete project workflow', async ({ page }) => {
     await page.goto('/')
     await page.click('text=New Project')
     // ... full workflow
   })
   ```

### AI Testing

```typescript
// Mock AI responses for consistent testing
export const mockAIProvider: AIProvider = {
  async suggestTasks(context) {
    return [
      { title: 'Mock Task 1', description: 'Test task' },
      { title: 'Mock Task 2', description: 'Test task' }
    ]
  }
}
```

## Debugging

### Debug Configuration

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "program": "${workspaceFolder}/src/interfaces/api/server.ts",
      "env": {
        "DEBUG": "ezra:*"
      }
    }
  ]
}
```

### Logging

```typescript
import { logger } from '@/shared/logger'

logger.info('Processing task', { taskId, projectId })
logger.error('Failed to process task', { error, taskId })
```

### AI Debugging

```typescript
// Enable AI debug mode
process.env.AI_DEBUG = 'true'

// Logs full prompts and responses
```

## Performance Optimization

### Database Optimization

```typescript
// Use indexes
@Index(['projectId', 'status'])
export class Task {
  // ...
}

// Batch operations
await taskRepository.bulkUpdate(tasks)

// Pagination
const tasks = await taskRepository.findAll({
  limit: 50,
  offset: 100
})
```

### Caching Strategy

```typescript
// Redis caching
@Cacheable('project:{id}', 300) // 5 minutes
async getProject(id: string): Promise<Project> {
  return this.projectRepository.findById(id)
}
```

### AI Optimization

```typescript
// Streaming responses
const stream = await aiProvider.streamCompletion(prompt)
for await (const chunk of stream) {
  // Process chunk immediately
}

// Batch AI operations
const suggestions = await aiProvider.batchSuggest(contexts)
```

## Security Guidelines

### Input Validation

```typescript
import { z } from 'zod'

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  projectId: z.string().regex(/^proj_[a-zA-Z0-9]+$/)
})

export async function createTask(input: unknown) {
  const validated = CreateTaskSchema.parse(input)
  // Safe to use validated input
}
```

### API Security

```typescript
// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}))

// Authentication
app.use('/api', authenticate)
```

### Prompt Injection Prevention

```typescript
function sanitizeUserInput(input: string): string {
  // Remove potential injection attempts
  return input
    .replace(/\{\{/g, '')
    .replace(/\}\}/g, '')
    .slice(0, 1000) // Limit length
}
```

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Run production build
NODE_ENV=production npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Environment Variables

```bash
# Production essentials
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
AI_API_KEY=sk-...
JWT_SECRET=...
```

### Monitoring

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      ai: await checkAIProvider()
    }
  }
  res.json(health)
})
```

## Troubleshooting

### Common Issues

1. **AI Provider Errors**
   - Check API key validity
   - Verify rate limits
   - Check network connectivity

2. **Database Connection Issues**
   - Verify connection string
   - Check database server status
   - Review migration status

3. **Performance Problems**
   - Enable query logging
   - Profile with Chrome DevTools
   - Check for N+1 queries

### Debug Commands

```bash
# Check system status
npm run system:check

# Run diagnostics
npm run diagnose

# Clear all caches
npm run cache:clear

# Reset database
npm run db:reset
```

## Additional Resources

- [Architecture Decision Records](./adr/)
- [API Design Guidelines](./api-design.md)
- [Security Best Practices](./security.md)
- [Performance Tuning Guide](./performance.md)
- [Troubleshooting Guide](./troubleshooting.md)