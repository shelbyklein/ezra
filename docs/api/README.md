# Ezra API Documentation

## Overview

The Ezra API provides programmatic access to all project management features. It follows RESTful principles and returns JSON responses.

## Base URL

```
Local: http://localhost:3000/api/v1
Production: https://api.ezra-pm.com/v1
```

## Authentication

All API requests require authentication using API keys:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.ezra-pm.com/v1/projects
```

## Quick Start

### 1. Get API Key
```bash
ezra api-key create --name "My App"
```

### 2. Make Your First Request
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST https://api.ezra-pm.com/v1/projects \
  -d '{"name": "My First Project", "description": "Created via API"}'
```

## Core Resources

### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create a project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Archive project

### Tasks
- `GET /tasks` - List all tasks
- `POST /tasks` - Create a task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### AI Endpoints
- `POST /ai/suggest-tasks` - Get AI task suggestions
- `POST /ai/parse-command` - Parse natural language command
- `POST /ai/analyze-project` - Get project insights

## Request/Response Format

### Request Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
Accept: application/json
```

### Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "name",
      "reason": "Required field missing"
    }
  }
}
```

## Endpoints

### Projects

#### List Projects
```http
GET /api/v1/projects
```

**Query Parameters:**
- `status` (string): Filter by status (active, archived, completed)
- `sort` (string): Sort field (created_at, updated_at, name)
- `order` (string): Sort order (asc, desc)
- `limit` (integer): Results per page (default: 20, max: 100)
- `offset` (integer): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_123",
        "name": "Website Redesign",
        "description": "Redesign company website",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "task_count": 15,
        "completed_task_count": 8,
        "progress": 0.53
      }
    ],
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

#### Create Project
```http
POST /api/v1/projects
```

**Request Body:**
```json
{
  "name": "Mobile App Development",
  "description": "Build iOS and Android app",
  "template_id": "template_software_dev",
  "settings": {
    "ai_suggestions": true,
    "auto_scheduling": false
  }
}
```

### Tasks

#### Create Task
```http
POST /api/v1/tasks
```

**Request Body:**
```json
{
  "project_id": "proj_123",
  "title": "Design homepage mockup",
  "description": "Create initial design concepts",
  "priority": "high",
  "due_date": "2024-01-20T17:00:00Z",
  "estimated_hours": 8,
  "tags": ["design", "frontend"],
  "dependencies": ["task_456"]
}
```

#### Update Task Status
```http
PUT /api/v1/tasks/:id/status
```

**Request Body:**
```json
{
  "status": "in_progress",
  "progress": 0.25,
  "notes": "Started working on wireframes"
}
```

### AI Features

#### Natural Language Command
```http
POST /api/v1/ai/command
```

**Request Body:**
```json
{
  "command": "Create a task to review the marketing proposal by Friday",
  "context": {
    "project_id": "proj_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "intent": "create_task",
    "confidence": 0.95,
    "action": {
      "type": "task_created",
      "task": {
        "id": "task_789",
        "title": "Review marketing proposal",
        "due_date": "2024-01-19T17:00:00Z"
      }
    },
    "natural_response": "I've created a task to review the marketing proposal with a due date of Friday, January 19th."
  }
}
```

#### Task Suggestions
```http
POST /api/v1/ai/suggest-tasks
```

**Request Body:**
```json
{
  "project_id": "proj_123",
  "parent_task": "Build user authentication",
  "max_suggestions": 5
}
```

## Webhooks

Configure webhooks to receive real-time updates:

```http
POST /api/v1/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["task.created", "task.completed", "project.updated"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events
- `project.created`
- `project.updated`
- `project.archived`
- `task.created`
- `task.updated`
- `task.completed`
- `task.deleted`

## Rate Limiting

- 1000 requests per hour per API key
- 10,000 requests per day per API key
- AI endpoints: 100 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642255200
```

## SDKs

Official SDKs available for:
- JavaScript/TypeScript
- Python
- Go
- Ruby

### JavaScript Example
```javascript
import { EzraClient } from '@ezra/sdk';

const client = new EzraClient({
  apiKey: process.env.EZRA_API_KEY
});

// Create a project
const project = await client.projects.create({
  name: 'Q1 Marketing Campaign',
  description: 'Planning and execution of Q1 campaigns'
});

// Add a task
const task = await client.tasks.create({
  projectId: project.id,
  title: 'Design email templates',
  priority: 'high'
});

// Use AI features
const suggestions = await client.ai.suggestTasks({
  projectId: project.id,
  context: 'email marketing campaign'
});
```

## Best Practices

### 1. Use Pagination
Always paginate when fetching lists:
```
GET /api/v1/tasks?limit=50&offset=0
```

### 2. Handle Errors Gracefully
Check for specific error codes and implement retry logic:
```javascript
if (error.code === 'RATE_LIMIT_EXCEEDED') {
  await sleep(error.retryAfter);
  return retry();
}
```

### 3. Use Webhooks for Real-time Updates
Instead of polling, use webhooks to receive updates.

### 4. Cache Responses
Implement caching for frequently accessed data.

### 5. Use Bulk Operations
When possible, use bulk endpoints:
```
POST /api/v1/tasks/bulk
```

## Migration Guide

### From v0 to v1
- Authentication method changed from API tokens to Bearer tokens
- Project IDs now use prefixed format (proj_xxx)
- Task status values standardized

## Support

- API Status: https://status.ezra-pm.com
- Documentation: https://docs.ezra-pm.com
- Support: api-support@ezra-pm.com
- GitHub: https://github.com/ezra/api-examples