// Development-only routes for testing and data management
import { Router, Request, Response } from 'express';
import db from '../src/db';
import { authenticate } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';

const router = Router();

// Middleware to ensure these routes only work in development
const devOnly = (req: Request, res: Response, next: Function) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'This endpoint is only available in development environment' 
    });
  }
  next();
};

// Apply devOnly middleware to all routes
router.use(devOnly);

// Reset all data (delete everything)
router.delete('/reset-all', async (req: Request, res: Response) => {
  try {
    // Delete in order to respect foreign key constraints
    await db('notes').del();
    await db('tasks').del();
    await db('projects').del();
    await db('users').del();
    
    res.json({ 
      message: 'All data has been deleted successfully',
      tables: ['notes', 'tasks', 'projects', 'users']
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

// Reset current user's data only
router.delete('/reset-user', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Get all user's projects
    const projects = await db('projects').where({ user_id: userId }).select('id');
    const projectIds = projects.map(p => p.id);
    
    if (projectIds.length > 0) {
      // Delete all notes for user's tasks
      await db('notes')
        .whereIn('task_id', db('tasks').select('id').whereIn('project_id', projectIds))
        .del();
      
      // Delete all tasks for user's projects
      await db('tasks').whereIn('project_id', projectIds).del();
    }
    
    // Delete all user's projects
    await db('projects').where({ user_id: userId }).del();
    
    res.json({ 
      message: 'Your data has been deleted successfully',
      deletedProjects: projectIds.length
    });
  } catch (error) {
    console.error('Error resetting user data:', error);
    res.status(500).json({ error: 'Failed to reset user data' });
  }
});

// Seed database with sample data
router.post('/seed', async (req: Request, res: Response) => {
  try {
    // Create a test user if none exists
    const existingUser = await db('users').where({ email: 'test@example.com' }).first();
    let userId;
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('testpass123', 10);
      const [user] = await db('users').insert({
        email: 'test@example.com',
        username: 'testuser',
        password_hash: hashedPassword,
        full_name: 'Test User',
        is_active: true
      });
      userId = user;
    } else {
      userId = existingUser.id;
    }
    
    // Create sample projects
    const projects = [
      { name: 'Website Redesign', description: 'Redesign company website with modern UI', user_id: userId },
      { name: 'Mobile App', description: 'Build mobile app for iOS and Android', user_id: userId },
      { name: 'API Development', description: 'Create RESTful API for new features', user_id: userId }
    ];
    
    for (const project of projects) {
      const existingProject = await db('projects')
        .where({ name: project.name, user_id: userId })
        .first();
      
      if (!existingProject) {
        const [projectId] = await db('projects').insert(project);
        
        // Create sample tasks for each project
        const tasks = [
          {
            title: 'Research and planning',
            description: 'Gather requirements and create project plan',
            status: 'done',
            priority: 'high',
            project_id: projectId,
            position: 0
          },
          {
            title: 'Design mockups',
            description: 'Create UI/UX mockups for review',
            status: 'in_progress',
            priority: 'high',
            project_id: projectId,
            position: 0,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          },
          {
            title: 'Development phase 1',
            description: 'Implement core features',
            status: 'in_progress',
            priority: 'medium',
            project_id: projectId,
            position: 1,
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
          },
          {
            title: 'Testing',
            description: 'Unit tests and integration tests',
            status: 'todo',
            priority: 'medium',
            project_id: projectId,
            position: 0
          },
          {
            title: 'Documentation',
            description: 'Write user and developer documentation',
            status: 'todo',
            priority: 'low',
            project_id: projectId,
            position: 1
          },
          {
            title: 'Deployment',
            description: 'Deploy to production environment',
            status: 'todo',
            priority: 'high',
            project_id: projectId,
            position: 2,
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          }
        ];
        
        await db('tasks').insert(tasks);
      }
    }
    
    res.json({ 
      message: 'Sample data has been created successfully',
      testUser: {
        email: 'test@example.com',
        password: 'testpass123'
      }
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

// Get database statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userCount = await db('users').count('* as count').first();
    const projectCount = await db('projects').count('* as count').first();
    const taskCount = await db('tasks').count('* as count').first();
    const noteCount = await db('notes').count('* as count').first();
    
    res.json({
      users: userCount?.count || 0,
      projects: projectCount?.count || 0,
      tasks: taskCount?.count || 0,
      notes: noteCount?.count || 0,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;