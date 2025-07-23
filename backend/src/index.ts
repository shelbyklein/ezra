// Main backend entry point
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import db from './db'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Import routes
import authRoutes from '../routes/auth.routes'

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth routes
app.use('/api/auth', authRoutes)

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

// Start server
app.listen(PORT, async () => {
  console.log(`✨ Server running on port ${PORT}`)
  console.log(`🚀 Environment: ${process.env.NODE_ENV}`)
  
  // Test database connection
  try {
    await db.raw('SELECT 1')
    console.log('📚 Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
})