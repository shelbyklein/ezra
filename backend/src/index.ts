// Main backend entry point
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import db from './db'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      process.env.FRONTEND_URL
    ].filter((url): url is string => Boolean(url)),
    credentials: true
  }
})

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))
app.use(express.json())

// Import routes
import authRoutes from '../routes/auth.routes'
import projectRoutes from '../routes/projects.routes'
import taskRoutes from '../routes/tasks.routes'
import notesRoutes from '../routes/notes.routes'
import tagsRoutes from '../routes/tags.routes'
import attachmentsRoutes from '../routes/attachments.routes'
import notebooksRoutes from '../routes/notebooks.routes'
import usersRoutes from '../routes/users.routes'
import aiRoutes from '../routes/ai.routes'
import devRoutes from '../routes/dev.routes'
import chatHistoryRoutes from '../routes/chat-history.routes'
import searchRoutes from '../routes/search.routes'
import uploadRoutes from '../routes/upload.routes'
import backupRoutes from '../routes/backup.routes'

// Track backend start time for version detection
const backendStartTime = new Date().toISOString()

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    startTime: backendStartTime
  })
})

// Auth routes
app.use('/api/auth', authRoutes)

// Project routes
app.use('/api/projects', projectRoutes)

// Task routes
app.use('/api/tasks', taskRoutes)

// Notes routes
app.use('/api/notes', notesRoutes)

// Tags routes
app.use('/api/tags', tagsRoutes)

// Attachments routes
app.use('/api/attachments', attachmentsRoutes)

// Notebooks routes
app.use('/api/notebooks', notebooksRoutes)

// Users routes
app.use('/api/users', usersRoutes)

// AI routes
console.log('Registering AI routes');
app.use('/api/ai', aiRoutes)
console.log('AI routes registered');

// Chat history routes
app.use('/api/chat-history', chatHistoryRoutes)

// Search routes
app.use('/api/search', searchRoutes)

// Upload routes
app.use('/api/upload', uploadRoutes)

// Backup routes
app.use('/api/backup', backupRoutes)

// Development routes (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/dev', devRoutes)
  console.log('🛠️  Development routes enabled at /api/dev')
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong!'
    }
  })
})

// Socket.IO connection handling (development only)
if (process.env.NODE_ENV !== 'production') {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id)
    
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id)
    })
  })
  
  // Export io for use in other modules (like nodemon hooks)
  ;(global as any).io = io
}

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, async () => {
    console.log(`✨ Server running on port ${PORT}`)
    console.log(`🚀 Environment: ${process.env.NODE_ENV}`)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔌 WebSocket server enabled for development`)
    }
    
    // Test database connection
    try {
      await db.raw('SELECT 1')
      console.log('📚 Database connected successfully')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
    }
  })
}

// Export for testing
export { app, httpServer }