/**
 * Task CRUD endpoints for managing kanban tasks
 */

import express from 'express';
import authenticate from '../middleware/auth.middleware';
import db from '../src/db';

const router = express.Router();

// Get all tasks for a project
router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    // Verify user owns the project
    const project = await db('projects')
      .where({ 
        id: req.params.projectId,
        user_id: req.user!.userId 
      })
      .first();
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const tasks = await db('tasks')
      .where({ project_id: req.params.projectId })
      .orderBy('position', 'asc');
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await db('tasks as t')
      .join('projects as p', 't.project_id', 'p.id')
      .where({ 
        't.id': req.params.id,
        'p.user_id': req.user!.userId 
      })
      .select('t.*')
      .first();
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create new task
router.post('/', authenticate, async (req, res) => {
  try {
    const { project_id, title, description, status, priority, due_date } = req.body;
    
    if (!project_id || !title) {
      return res.status(400).json({ error: 'Project ID and title are required' });
    }
    
    // Verify user owns the project
    const project = await db('projects')
      .where({ 
        id: project_id,
        user_id: req.user!.userId 
      })
      .first();
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Get the highest position in the status column
    const maxPosition = await db('tasks')
      .where({ 
        project_id,
        status: status || 'todo' 
      })
      .max('position as max')
      .first();
    
    const task = {
      project_id,
      title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'medium',
      position: (maxPosition?.max || 0) + 1,
      due_date: due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await db('tasks').insert(task);
    
    // SQLite doesn't support returning clause properly, so we fetch the last inserted task
    const createdTask = await db('tasks')
      .where({ project_id })
      .orderBy('id', 'desc')
      .first();
    
    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Verify user owns the task's project
    const task = await db('tasks as t')
      .join('projects as p', 't.project_id', 'p.id')
      .where({ 
        't.id': req.params.id,
        'p.user_id': req.user!.userId 
      })
      .select('t.*')
      .first();
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const { title, description, status, priority, position, due_date } = req.body;
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (position !== undefined) updateData.position = position;
    if (due_date !== undefined) updateData.due_date = due_date;
    
    await db('tasks')
      .where({ id: req.params.id })
      .update(updateData);
    
    const updatedTask = await db('tasks')
      .where({ id: req.params.id })
      .first();
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Verify user owns the task's project
    const task = await db('tasks as t')
      .join('projects as p', 't.project_id', 'p.id')
      .where({ 
        't.id': req.params.id,
        'p.user_id': req.user!.userId 
      })
      .select('t.*')
      .first();
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await db('tasks')
      .where({ id: req.params.id })
      .delete();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Bulk update task positions (for drag and drop)
router.post('/reorder', authenticate, async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }
    
    // Start a transaction
    await db.transaction(async (trx) => {
      for (const task of tasks) {
        // Verify user owns the task's project
        const existingTask = await trx('tasks as t')
          .join('projects as p', 't.project_id', 'p.id')
          .where({ 
            't.id': task.id,
            'p.user_id': req.user!.userId 
          })
          .select('t.id')
          .first();
        
        if (!existingTask) {
          throw new Error(`Task ${task.id} not found or unauthorized`);
        }
        
        // Update task position and status
        await trx('tasks')
          .where({ id: task.id })
          .update({
            position: task.position,
            status: task.status,
            updated_at: new Date().toISOString()
          });
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

export default router;