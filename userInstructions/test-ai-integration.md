# Testing AI Integration Features

The AI integration for task enhancement has been implemented. Here's how to test it:

## Setup

1. The app should be running at http://localhost:5175
2. The backend is running on port 6001

## Testing Steps

### 1. Create an Account
- Click "Register" on the login page
- Enter:
  - Email: test@example.com
  - Username: testuser  
  - Full Name: Test User
  - Password: password123
- Click "Register"

### 2. Add Your Anthropic API Key
- After logging in, go to Settings (gear icon in top-right)
- Look for the "API Key" section
- Enter your Anthropic API key (get one from https://console.anthropic.com/)
- Click "Save API Key"

### 3. Test AI Task Enhancement

#### A. During Task Creation:
1. Create a new project or use an existing one
2. Click the "+" button to add a new task
3. Enter a basic task title like "Build user dashboard"
4. Click the magic wand icon (🪄) in the modal header
5. The AI will analyze your task and suggest:
   - Enhanced title
   - Detailed description
   - Subtasks
   - Priority level
   - Time estimate
   - Relevant tags
6. Click "Apply Enhancements" to use the suggestions

#### B. For Existing Tasks:
1. Click on any existing task to open the detail modal
2. Click the Edit icon
3. Click the magic wand icon (🪄) that appears
4. Review and apply the AI suggestions

### 4. Test AI Task Suggestions for Projects
1. Open a project
2. Look for the "AI Task Suggestions" button (purple with magic wand icon)
3. Click it to generate task suggestions based on your project
4. The AI will suggest relevant tasks with:
   - Title
   - Description
   - Priority
   - Time estimate
5. Click the "+" icon on any suggestion to add it to your board

## Troubleshooting

- If you get an "API Key Required" message, make sure you've added your key in Settings
- If the API key is invalid, you'll see an error message
- The AI features require an active internet connection

## What to Look For

- The AI should provide contextually relevant enhancements
- Subtasks should be logical breakdowns of the main task
- Priority and time estimates should be reasonable
- The suggestions should improve clarity and actionability

## Notes

- The AI enhancement is powered by Claude (Anthropic)
- All API calls are made from the backend to keep your key secure
- Your API key is encrypted before being stored in the database