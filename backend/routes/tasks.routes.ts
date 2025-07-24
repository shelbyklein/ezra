/**
 * Task CRUD endpoints for managing kanban tasks
 */

import express from 'express';
import authenticate from '../middleware/auth.middleware';
import db from '../src/db';
import { parseNaturalLanguageCommand } from '../utils/anthropic';

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
    
    // Fetch tags for all tasks
    const taskIds = tasks.map(task => task.id);
    let taskTags: Array<{ task_id: number; id: number; name: string; color: string }> = [];
    if (taskIds.length > 0) {
      taskTags = await db('task_tags as tt')
        .join('tags as t', 'tt.tag_id', 't.id')
        .whereIn('tt.task_id', taskIds)
        .select('tt.task_id', 't.id', 't.name', 't.color');
    }
    
    // Group tags by task
    const tagsByTask = taskTags.reduce((acc, tag) => {
      if (!acc[tag.task_id]) {
        acc[tag.task_id] = [];
      }
      acc[tag.task_id].push({
        id: tag.id,
        name: tag.name,
        color: tag.color
      });
      return acc;
    }, {} as Record<number, Array<{ id: number; name: string; color: string }>>);
    
    // Add tags to tasks
    const tasksWithTags = tasks.map(task => ({
      ...task,
      tags: tagsByTask[task.id] || []
    }));
    
    res.json(tasksWithTags);
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

// Natural language command processing
router.post('/natural-language', authenticate, async (req, res) => {
  try {
    const { command, projectId } = req.body;
    
    if (!command || !projectId) {
      return res.status(400).json({ error: 'Command and project ID are required' });
    }
    
    // Verify user owns the project
    const project = await db('projects')
      .where({ 
        id: projectId,
        user_id: req.user!.userId 
      })
      .first();
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Get current tasks for context
    const currentTasks = await db('tasks')
      .where({ project_id: projectId })
      .select('id', 'title', 'status');
    
    // Parse the natural language command
    const parsedCommand = await parseNaturalLanguageCommand(
      req.user!.userId,
      command,
      { projectId, currentTasks }
    );
    
    if (!parsedCommand) {
      return res.status(400).json({ error: 'Could not understand the command' });
    }
    
    // Execute the command based on the action
    let result: any = null;
    
    switch (parsedCommand.action) {
      case 'create':
        if (!parsedCommand.taskData?.title) {
          return res.status(400).json({ error: 'Task title is required for creation' });
        }
        
        const maxPosition = await db('tasks')
          .where({ 
            project_id: projectId,
            status: parsedCommand.taskData.status || 'todo' 
          })
          .max('position as max')
          .first();
        
        const newTask = {
          project_id: projectId,
          title: parsedCommand.taskData.title,
          description: parsedCommand.taskData.description || null,
          status: parsedCommand.taskData.status || 'todo',
          priority: parsedCommand.taskData.priority || 'medium',
          position: (maxPosition?.max || 0) + 1,
          due_date: parsedCommand.taskData.due_date || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await db('tasks').insert(newTask);
        
        const createdTask = await db('tasks')
          .where({ project_id: projectId })
          .orderBy('id', 'desc')
          .first();
        
        result = { action: 'created', task: createdTask };
        break;
        
      case 'update':
      case 'move':
        if (!parsedCommand.targetTasks?.taskIds?.length || !parsedCommand.updates) {
          return res.status(400).json({ error: 'Task IDs and updates are required' });
        }
        
        // Verify user owns all tasks
        const tasksToUpdate = await db('tasks')
          .whereIn('id', parsedCommand.targetTasks.taskIds)
          .where({ project_id: projectId });
        
        if (tasksToUpdate.length !== parsedCommand.targetTasks.taskIds.length) {
          return res.status(404).json({ error: 'Some tasks not found' });
        }
        
        await db('tasks')
          .whereIn('id', parsedCommand.targetTasks.taskIds)
          .update({
            ...parsedCommand.updates,
            updated_at: new Date().toISOString()
          });
        
        result = { 
          action: 'updated', 
          count: parsedCommand.targetTasks.taskIds.length,
          taskIds: parsedCommand.targetTasks.taskIds 
        };
        break;
        
      case 'delete':
        if (!parsedCommand.targetTasks?.taskIds?.length) {
          return res.status(400).json({ error: 'Task IDs are required for deletion' });
        }
        
        // Verify user owns all tasks
        const tasksToDelete = await db('tasks')
          .whereIn('id', parsedCommand.targetTasks.taskIds)
          .where({ project_id: projectId });
        
        if (tasksToDelete.length !== parsedCommand.targetTasks.taskIds.length) {
          return res.status(404).json({ error: 'Some tasks not found' });
        }
        
        await db('tasks')
          .whereIn('id', parsedCommand.targetTasks.taskIds)
          .delete();
        
        result = { 
          action: 'deleted', 
          count: parsedCommand.targetTasks.taskIds.length 
        };
        break;
        
      case 'bulk':
        if (!parsedCommand.targetTasks?.filter || !parsedCommand.updates) {
          return res.status(400).json({ error: 'Filter and updates are required for bulk operations' });
        }
        
        let query = db('tasks').where({ project_id: projectId });
        
        if (parsedCommand.targetTasks.filter.status) {
          query = query.where('status', parsedCommand.targetTasks.filter.status);
        }
        if (parsedCommand.targetTasks.filter.priority) {
          query = query.where('priority', parsedCommand.targetTasks.filter.priority);
        }
        if (parsedCommand.targetTasks.filter.overdue) {
          query = query.where('due_date', '<', new Date().toISOString());
        }
        
        const affectedTasks = await query.select('id');
        const affectedIds = affectedTasks.map(t => t.id);
        
        if (affectedIds.length > 0) {
          await db('tasks')
            .whereIn('id', affectedIds)
            .update({
              ...parsedCommand.updates,
              updated_at: new Date().toISOString()
            });
        }
        
        result = { 
          action: 'bulk_updated', 
          count: affectedIds.length,
          taskIds: affectedIds 
        };
        break;
        
      case 'query':
        // For queries, just return the parsed command for the frontend to handle
        result = { action: 'query', parsedCommand };
        break;
        
      default:
        return res.status(400).json({ error: 'Unsupported action' });
    }
    
    res.json({ 
      success: true, 
      parsedCommand,
      result 
    });
  } catch (error) {
    console.error('Error processing natural language command:', error);
    res.status(500).json({ error: 'Failed to process command' });
  }
});

export default router;