# Ezra User Guide

## Table of Contents
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [AI Features](#ai-features)
- [Getting Started](#getting-started)
- [Projects & Tasks](#projects--tasks)
- [Notebooks](#notebooks)
- [Search](#search)
- [Settings](#settings)

## Keyboard Shortcuts

Ezra includes comprehensive keyboard shortcuts to help you work more efficiently. All shortcuts work across the entire application.

### Global Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd/Ctrl + K` | Open AI Command Bar | Launch the AI assistant to execute natural language commands |
| `Cmd/Ctrl + /` | Open Search | Search across all projects, tasks, and notebooks |
| `N` | New Task | Create a new task (when on board view) |
| `?` | Show Help | Display keyboard shortcuts reference |
| `Esc` | Close Modals | Close any open modal or dialog |

### Task Management Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `↑` / `↓` | Navigate Tasks | Select previous/next task in the board |
| `←` / `→` | Move Task | Move selected task between columns (Todo → In Progress → Done) |
| `Enter` | Edit Task | Open task details for editing |
| `E` | Quick Edit | Edit selected task |
| `D` | Delete Task | Delete selected task (with confirmation) |
| `Space` | Cycle Status | Quick cycle task status: Todo → In Progress → Done → Todo |

### Navigation Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `G` then `P` | Go to Projects | Navigate to projects list |
| `G` then `B` | Go to Board | Navigate to current project board |
| `G` then `N` | Go to Notebooks | Navigate to notebooks |
| `G` then `S` | Go to Settings | Navigate to settings |

## AI Features

Ezra integrates advanced AI capabilities powered by Anthropic's Claude to help you manage projects more effectively.

### AI Command Bar (Cmd/Ctrl + K)

The AI Command Bar allows you to use natural language to:

#### Task Management
- **Create tasks**: "Create a task to review the design mockups"
- **Bulk create**: "Create tasks for setting up authentication: login page, register page, password reset"
- **Update tasks**: "Move all done tasks to archive"
- **Search**: "Show me all high priority tasks due this week"

#### Project Operations
- **Create projects**: "Create a new project called Mobile App Development"
- **Update projects**: "Change the color of the Frontend project to blue"
- **Navigate**: "Take me to the Backend project"

#### Smart Actions
- **Generate tasks**: "Break down 'Build user authentication' into subtasks"
- **Organize**: "Group similar tasks together"
- **Prioritize**: "Help me prioritize my tasks for today"

### AI Chat Assistant

Click the chat bubble in the bottom right corner to access the AI assistant. The assistant:

- **Context-aware**: Understands your current view and project
- **Notebook integration**: Can help edit and organize notebook pages
- **Task suggestions**: Provides intelligent task recommendations
- **Knowledge base**: Searches through your projects and notebooks to provide relevant information

### AI-Powered Features

#### Task Enhancement
When creating or editing tasks, click the "Enhance with AI" button to:
- Generate detailed descriptions
- Break down complex tasks into subtasks
- Add relevant tags and priorities
- Suggest due dates based on task complexity

#### Smart Search
The AI enhances search by:
- Understanding natural language queries
- Finding related content across projects
- Suggesting relevant tasks and notes

## Getting Started

### Creating Your First Project

1. Click "New Project" on the dashboard
2. Enter a project name and optional description
3. Choose a color theme
4. Click "Create Project"

### Managing Tasks

1. Navigate to a project board
2. Click "New Task" or press `N`
3. Enter task details:
   - Title (required)
   - Description (optional, supports Markdown)
   - Priority (Low, Medium, High)
   - Due date
   - Tags
4. Click "Create Task"

### Drag and Drop

Tasks can be moved between columns by:
- Dragging with mouse
- Using arrow keys when task is selected
- Using the AI Command Bar

## Notebooks

Notebooks provide a powerful way to organize documentation, meeting notes, and project information.

### Creating a Notebook

1. Navigate to Notebooks section
2. Click "New Notebook"
3. Choose an icon and color
4. Add to a project (optional)

### Notebook Features

- **Hierarchical Organization**: Create folders and nested pages
- **Rich Text Editor**: Full Markdown support with live preview
- **Image Support**: Upload images directly into your notes
- **Slash Commands**: Type `/` in the editor for quick formatting
- **AI Integration**: Use AI to generate content, summarize, or organize pages

### Adding Images to Notes

Three ways to add images:
1. **Click the image button** in the toolbar and select "Upload Image"
2. **Drag and drop** image files directly into the upload modal
3. **Paste from clipboard** (Cmd/Ctrl + V) when the upload modal is open

Supported formats: JPEG, PNG, GIF, WebP (max 5MB)

### Manipulating Images

Once an image is inserted:
- **Resize**: Click on the image to show resize handles, then drag any handle to resize
- **Maintain aspect ratio**: Resize handles automatically maintain the image's aspect ratio
- **Alignment**: Use the floating toolbar to align images left, center, or right
- **Size presets**: Quick buttons for 25%, 50%, 75%, or 100% width
- **Reset**: Return image to its original size
- **Delete**: Remove the image from the document

### Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + B` | Bold |
| `Cmd/Ctrl + I` | Italic |
| `Cmd/Ctrl + K` | Insert link |
| `/` | Show formatting menu |

## Search

Access unified search with `Cmd/Ctrl + /` to find:
- Tasks by title, description, or tags
- Projects by name
- Notebook pages by content
- Files and attachments

### Search Tips

- Use quotes for exact matches: `"project planning"`
- Filter by type: `type:task priority:high`
- Search by date: `due:tomorrow` or `created:this week`

## Settings

### API Key Configuration

1. Go to Settings → API Keys
2. Enter your Anthropic API key
3. The key is encrypted and stored securely
4. Required for AI features to work

### Profile Management

- Update username and email
- Upload profile picture
- Change password
- Enable two-factor authentication (coming soon)

### Data Management

- **Export**: Download all your data in JSON format
- **Import**: Restore from a previous backup
- **Auto-backup**: Enable automatic daily backups (Pro feature)

### Theme Customization

- Toggle between light and dark mode
- Follows system preference by default
- Custom color themes (coming soon)

## Tips and Best Practices

1. **Use AI Commands**: Natural language commands are often faster than clicking
2. **Keyboard Navigation**: Master shortcuts for efficient workflow
3. **Tag Everything**: Use tags to create cross-project connections
4. **Regular Reviews**: Use AI to help identify stale or blocked tasks
5. **Template Tasks**: Save common task structures for reuse

## Troubleshooting

### AI Features Not Working?
- Check API key in settings
- Ensure you have internet connection
- Verify API key has sufficient credits

### Performance Issues?
- Clear browser cache
- Disable browser extensions
- Use Chrome or Firefox for best performance

### Data Sync Issues?
- Check WebSocket connection (green dot in chat)
- Refresh the page
- Check browser console for errors

## Support

For additional help:
- Use the in-app chat for quick questions
- Check our [documentation](https://docs.ezra.app)
- Report issues on [GitHub](https://github.com/ezra-app/ezra)
- Email support: support@ezra.app