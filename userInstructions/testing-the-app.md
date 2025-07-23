# Testing the Ezra Application

## Current Status
The backend API and frontend authentication flow are now implemented and running!

## Running the Application

### Backend Server
The backend should already be running on port 3001. If not:
```bash
cd backend
npm run dev
```

### Frontend Application
The frontend should be running on port 5173. If not:
```bash
cd frontend
npm run dev
```

## Testing the Application

### 1. Open the Application
Navigate to http://localhost:5173 in your browser

### 2. Create an Account
1. You'll be redirected to the login page
2. Click "Sign up" to go to the registration page
3. Enter your details:
   - Email: your-email@example.com
   - Username: yourusername
   - Password: yourpassword (min 6 characters)
   - Confirm Password: same as above
4. Click "Create account"

### 3. Create Your First Project
1. After registration, you'll be logged in automatically
2. You'll see the "My Projects" page
3. Click "New Project" button
4. Enter:
   - Project Name: "My First Project"
   - Description: "Testing the kanban board"
5. Click "Create"

### 4. View Your Project
1. Click on the project card to navigate to the board
2. You'll see a placeholder for the kanban board (implementation coming next)

### 5. Test Authentication
1. Click on your avatar in the top right
2. Select "Sign out"
3. Try to access http://localhost:5173/projects - you'll be redirected to login
4. Log in with your credentials

## What's Working
✅ User registration and login
✅ JWT authentication
✅ Protected routes
✅ Project creation, listing, editing, and deletion
✅ Navigation and layout
✅ API integration
✅ Form validation
✅ Error handling

## What's Coming Next
- Kanban board with drag-and-drop
- Task creation and management
- Task cards with details
- Status columns (Todo, In Progress, Done)
- AI-powered task enhancement

## Troubleshooting

### Backend not responding
- Check if backend is running: `ps aux | grep node`
- Check backend logs: `cat backend/server.log`
- Restart backend: `cd backend && npm run dev`

### Frontend not loading
- Check if frontend is running on port 5173
- Clear browser cache
- Check browser console for errors
- If you see import errors for @chakra-ui/icons, run: `cd frontend && npm install @chakra-ui/icons`

### Authentication issues
- Check localStorage for authToken
- Try logging out and back in
- Check network tab for API responses

### Fixed Issues
- ✅ Missing @chakra-ui/icons package - now installed
- ✅ Drag-and-drop functionality implemented
- ✅ Development data management tools added

## Development Tools for Testing

### Reset Database During Testing
The application now includes development-only API endpoints for managing test data:

#### 1. Clear All Data
```bash
curl -X DELETE http://localhost:3001/api/dev/reset-all
```
This removes all users, projects, tasks, and notes from the database.

#### 2. Clear Your Data Only
If you're logged in and want to clear just your data:
```bash
curl -X DELETE http://localhost:3001/api/dev/reset-user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Generate Sample Data
Create a test user with sample projects and tasks:
```bash
curl -X POST http://localhost:3001/api/dev/seed
```
This creates:
- Test user: email: test@example.com, password: testpass123
- 3 sample projects with 6 tasks each
- Tasks with various statuses, priorities, and due dates

#### 4. Check Database Statistics
```bash
curl http://localhost:3001/api/dev/stats
```
Shows counts of users, projects, tasks, and notes.

### Testing the Drag-and-Drop Kanban Board
1. Log in with your account or the test account
2. Navigate to a project with tasks
3. Test drag-and-drop functionality:
   - Drag tasks within the same column to reorder
   - Drag tasks between columns to change status
   - Watch for visual feedback during drag
   - Changes are automatically saved

### Using the Developer Tools UI

The application now includes a Developer Tools panel in the Settings page:

1. Click on your avatar in the top right corner
2. Select "Settings" from the dropdown menu
3. Navigate to the "Developer Tools" tab (only visible in development mode)

From the Developer Tools panel, you can:
- View database statistics (users, projects, tasks, notes counts)
- **Reset All Data** - Clears the entire database with confirmation
- **Reset My Data Only** - Clears only your projects and tasks
- **Generate Sample Data** - Creates test user with sample projects
- View API endpoint documentation

All actions require confirmation before executing and will reload the page after completion to ensure the UI is refreshed.

### Coming Soon
- Database backup/restore functionality
- Data export/import in JSON format
- Quick actions in the main navigation