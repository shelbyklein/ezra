# Ezra - LLM-Powered Project Management

An intelligent kanban board application with AI-powered task management, markdown notes, and future mind-mapping capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ezra
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

4. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## 📂 Project Structure

```
ezra/
├── frontend/          # React TypeScript application
├── backend/           # Express TypeScript API
├── shared/            # Shared types and utilities
├── claude_docs/       # Project documentation
└── docs/              # User documentation
```

## 🛠️ Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend-only` - Start only the frontend (for separate backend server)
- `npm run dev:backend-only` - Start only the backend
- `npm run build` - Build all workspaces for production
- `npm run test` - Run tests in all workspaces
- `npm run lint` - Lint all workspaces

### Running with Separate Servers

If you're running the backend on a separate server:

1. **Frontend Setup:**
   ```bash
   # Copy the frontend environment template
   cp frontend/.env.example frontend/.env
   
   # Edit frontend/.env and set your backend URL:
   # VITE_API_URL=http://your-backend-server:port
   
   # Run only the frontend
   npm run dev:frontend-only
   ```

2. **Backend Setup (on separate server):**
   ```bash
   # Set up backend environment
   cp .env.example .env
   # Edit .env and update FRONTEND_URL to match your frontend URL
   
   # Run only the backend
   npm run dev:backend-only
   # Or use nodemon directly: cd backend && npm run dev
   ```

3. **CORS Configuration:**
   Make sure the backend's `FRONTEND_URL` environment variable matches where your frontend is running to allow cross-origin requests.

## 📝 License

MIT License - see LICENSE file for details