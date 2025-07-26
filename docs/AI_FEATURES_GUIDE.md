# AI Features Guide

## Overview

Ezra integrates Anthropic's Claude AI to provide intelligent assistance for project management, task automation, and content creation. This guide covers all AI-powered features and how to use them effectively.

## Getting Started with AI

### Setting Up Your API Key

1. Obtain an API key from [Anthropic Console](https://console.anthropic.com)
2. Navigate to Settings → API Keys in Ezra
3. Enter your API key and click Save
4. Your key is encrypted and stored securely

## AI Command Bar (⌘K / Ctrl+K)

The Command Bar understands natural language and can perform complex actions across your workspace.

### Task Management Commands

#### Creating Tasks
```
"Create a task to review the Q4 budget"
"Add a high priority task for fixing the login bug"
"Create 5 tasks for the user authentication feature"
```

#### Bulk Operations
```
"Create tasks for a code review: 
- Review frontend changes
- Check API endpoints  
- Test user flows
- Update documentation"
```

#### Updating Tasks
```
"Move all my done tasks to the archive"
"Change priority of all overdue tasks to high"
"Add 'urgent' tag to tasks due today"
```

#### Smart Filters
```
"Show me all high priority tasks"
"Find tasks assigned to me due this week"
"List all blocked tasks in the Backend project"
```

### Project Commands

```
"Create a new project called Customer Portal"
"Archive the old website redesign project"
"Change Mobile App project color to green"
"Show me all active projects"
```

### Navigation Commands

```
"Go to the Backend project"
"Take me to my notebooks"
"Open settings"
"Show the dashboard"
```

### AI Generation Commands

```
"Break down 'Implement payment system' into subtasks"
"Generate a project plan for launching a mobile app"
"Create a checklist for deploying to production"
"Suggest tasks for improving site performance"
```

## AI Chat Assistant

Access the chat assistant via the purple chat bubble in the bottom-right corner.

### Context-Aware Assistance

The AI assistant understands your current context:
- Which project you're viewing
- What notebook page you're editing
- Recent actions you've taken

### Capabilities

#### Task Assistant
- **Planning**: "Help me plan the next sprint"
- **Prioritization**: "Which tasks should I focus on today?"
- **Estimation**: "How long might this feature take to build?"
- **Dependencies**: "What needs to be done before I can start this task?"

#### Content Generation
- **Documentation**: "Write API documentation for this endpoint"
- **Meeting Notes**: "Summarize these meeting notes into action items"
- **Descriptions**: "Expand this task description with acceptance criteria"
- **Templates**: "Create a bug report template"

#### Knowledge Base Search
- **Find Information**: "What did we decide about the authentication flow?"
- **Cross-Reference**: "Find all mentions of the API refactor"
- **Summarize**: "Summarize all notes about the customer feedback"

### Smart Suggestions

The AI provides proactive suggestions:
- Similar tasks that might be related
- Potential blockers or dependencies
- Optimization opportunities
- Workflow improvements

## Task Enhancement

When creating or editing tasks, use the "Enhance with AI" feature to:

### Auto-Generate Details
Click "Enhance" to have AI:
- Expand brief titles into detailed descriptions
- Add acceptance criteria
- Suggest subtasks
- Recommend tags and priority
- Estimate effort/duration

### Smart Decomposition
For complex tasks, AI can:
- Break down into logical subtasks
- Identify dependencies
- Suggest optimal ordering
- Create implementation checklists

### Example
**Input**: "Implement user authentication"

**AI Enhancement**:
```
Description: Implement secure user authentication system with email/password login, session management, and password reset functionality.

Subtasks:
1. Set up authentication middleware
2. Create login/register API endpoints  
3. Build login and registration forms
4. Implement password hashing
5. Add session management
6. Create password reset flow
7. Add email verification
8. Write authentication tests

Tags: #backend #security #authentication
Priority: High
Estimated: 3-5 days
```

## Notebook AI Features

### Content Generation
In the notebook editor, select text and choose AI actions:
- **Expand**: Turn bullet points into detailed sections
- **Summarize**: Condense long content
- **Rewrite**: Adjust tone or clarity
- **Continue**: Let AI continue writing from where you left off

### Smart Templates
```
/ai-template meeting notes
/ai-template project brief
/ai-template technical spec
/ai-template retrospective
```

### AI Editing Commands
- **Fix Grammar**: "Fix grammar and spelling in this page"
- **Improve Clarity**: "Make this technical documentation clearer"
- **Add Examples**: "Add code examples to illustrate these concepts"
- **Format**: "Format this as a proper API documentation"

## Best Practices

### Effective Prompts

#### Be Specific
❌ "Create some tasks"
✅ "Create tasks for implementing the user profile feature with avatar upload"

#### Provide Context
❌ "Update the task"
✅ "Update the 'Fix login bug' task to high priority and add it to the current sprint"

#### Use Natural Language
The AI understands conversational requests:
- "I need to plan a feature for letting users export their data"
- "Help me organize my tasks for next week"
- "What should I work on first?"

### Batch Operations
Combine multiple actions in one command:
```
"Create a project called 'Mobile App', 
add these tasks: Design UI, Set up React Native, 
Create API endpoints, and make them all high priority"
```

### Contextual Commands
Reference your current view:
```
"Add a task to this project"
"Summarize all tasks in the current board"
"Archive completed tasks from this sprint"
```

## Advanced Features

### AI Workflows

Create custom workflows:
1. **Sprint Planning**: "Generate sprint tasks based on our product roadmap"
2. **Daily Standup**: "Summarize what I worked on yesterday and what's planned for today"
3. **Retrospectives**: "Analyze completed tasks and suggest process improvements"

### Integration with External Data

Reference external context:
- "Create tasks based on the latest customer feedback"
- "Import action items from our last meeting notes"
- "Generate tasks from this requirements document"

### Smart Notifications

AI can notify you about:
- Tasks that might be blocked
- Overdue items needing attention
- Suggested task groupings
- Optimization opportunities

## Troubleshooting

### AI Not Responding?
1. Check API key in settings
2. Verify internet connection
3. Check API usage limits
4. Try refreshing the page

### Unexpected Results?
- Be more specific in your prompts
- Provide additional context
- Break complex requests into steps
- Use examples in your prompts

### Performance Tips
- Batch similar operations
- Use keyboard shortcuts
- Save frequently used commands
- Enable AI suggestions

## Privacy and Security

- Your API key is encrypted at rest
- AI requests are processed securely
- No data is stored by Anthropic beyond the session
- You can disable AI features at any time
- Audit logs track AI actions

## Coming Soon

- Custom AI commands
- Team AI workflows  
- AI-powered analytics
- Voice commands
- Mobile AI assistant