/**
 * Tag CRUD endpoints for task organization
 */

import express from 'express';
import authenticate from '../middleware/auth.middleware';
import db from '../src/db';

const router = express.Router();

// Get all tags for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const tags = await db('tags')
      .where({ user_id: req.user!.userId })
      .orderBy('name', 'asc');
    
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Create new tag
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name || !color) {
      return res.status(400).json({ error: 'Tag name and color are required' });
    }
    
    // Validate color format
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({ error: 'Invalid color format. Use hex format like #3182CE' });
    }
    
    const tag = {
      user_id: req.user!.userId,
      name: name.trim(),
      color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    try {
      await db('tags').insert(tag);
      
      // Fetch the created tag
      const createdTag = await db('tags')
        .where({ user_id: req.user!.userId, name: tag.name })
        .first();
      
      res.status(201).json(createdTag);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ error: 'A tag with this name already exists' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Update tag
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, color } = req.body;
    
    // Validate color format if provided
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({ error: 'Invalid color format. Use hex format like #3182CE' });
    }
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;
    
    const updated = await db('tags')
      .where({ 
        id: req.params.id,
        user_id: req.user!.userId 
      })
      .update(updateData);
    
    if (!updated) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    const tag = await db('tags')
      .where({ id: req.params.id })
      .first();
    
    res.json(tag);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'A tag with this name already exists' });
    }
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

// Delete tag
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // First remove all associations in task_tags
    await db('task_tags')
      .where({ tag_id: req.params.id })
      .delete();
    
    // Then delete the tag
    const deleted = await db('tags')
      .where({ 
        id: req.params.id,
        user_id: req.user!.userId 
      })
      .delete();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// Get tags for a specific task
router.get('/task/:taskId', authenticate, async (req, res) => {
  try {
    // First verify the task belongs to the user
    const task = await db('tasks')
      .join('projects', 'tasks.project_id', 'projects.id')
      .where({ 
        'tasks.id': req.params.taskId,
        'projects.user_id': req.user!.userId 
      })
      .select('tasks.id')
      .first();
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get tags for the task
    const tags = await db('tags')
      .join('task_tags', 'tags.id', 'task_tags.tag_id')
      .where({ 'task_tags.task_id': req.params.taskId })
      .select('tags.*');
    
    res.json(tags);
  } catch (error) {
    console.error('Error fetching task tags:', error);
    res.status(500).json({ error: 'Failed to fetch task tags' });
  }
});

// Assign tags to a task
router.post('/task/:taskId', authenticate, async (req, res) => {
  try {
    const { tagIds } = req.body;
    
    if (!Array.isArray(tagIds)) {
      return res.status(400).json({ error: 'tagIds must be an array' });
    }
    
    // Verify the task belongs to the user
    const task = await db('tasks')
      .join('projects', 'tasks.project_id', 'projects.id')
      .where({ 
        'tasks.id': req.params.taskId,
        'projects.user_id': req.user!.userId 
      })
      .select('tasks.id')
      .first();
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Verify all tags belong to the user
    const userTags = await db('tags')
      .where({ user_id: req.user!.userId })
      .whereIn('id', tagIds)
      .pluck('id');
    
    if (userTags.length !== tagIds.length) {
      return res.status(400).json({ error: 'One or more tags not found' });
    }
    
    // Remove existing tags and add new ones
    await db.transaction(async (trx) => {
      await trx('task_tags')
        .where({ task_id: req.params.taskId })
        .delete();
      
      if (tagIds.length > 0) {
        const taskTags = tagIds.map(tagId => ({
          task_id: parseInt(req.params.taskId),
          tag_id: tagId
        }));
        
        await trx('task_tags').insert(taskTags);
      }
    });
    
    // Return updated tags
    const tags = await db('tags')
      .join('task_tags', 'tags.id', 'task_tags.tag_id')
      .where({ 'task_tags.task_id': req.params.taskId })
      .select('tags.*');
    
    res.json(tags);
  } catch (error) {
    console.error('Error assigning tags:', error);
    res.status(500).json({ error: 'Failed to assign tags' });
  }
});

// Get tags for a specific project
router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    // First verify the project belongs to the user
    const project = await db('projects')
      .where({ 
        id: req.params.projectId,
        user_id: req.user!.userId 
      })
      .first();
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Get tags for the project
    const tags = await db('tags')
      .join('project_tags', 'tags.id', 'project_tags.tag_id')
      .where({ 'project_tags.project_id': req.params.projectId })
      .select('tags.*');
    
    res.json(tags);
  } catch (error) {
    console.error('Error fetching project tags:', error);
    res.status(500).json({ error: 'Failed to fetch project tags' });
  }
});

// Assign tags to a project
router.post('/project/:projectId', authenticate, async (req, res) => {
  try {
    const { tagIds } = req.body;
    
    if (!Array.isArray(tagIds)) {
      return res.status(400).json({ error: 'tagIds must be an array' });
    }
    
    // Verify the project belongs to the user
    const project = await db('projects')
      .where({ 
        id: req.params.projectId,
        user_id: req.user!.userId 
      })
      .first();
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Verify all tags belong to the user
    const userTags = await db('tags')
      .where({ user_id: req.user!.userId })
      .whereIn('id', tagIds)
      .pluck('id');
    
    if (userTags.length !== tagIds.length) {
      return res.status(400).json({ error: 'One or more tags not found' });
    }
    
    // Remove existing tags and add new ones
    await db.transaction(async (trx) => {
      await trx('project_tags')
        .where({ project_id: req.params.projectId })
        .delete();
      
      if (tagIds.length > 0) {
        const projectTags = tagIds.map(tagId => ({
          project_id: parseInt(req.params.projectId),
          tag_id: tagId
        }));
        
        await trx('project_tags').insert(projectTags);
      }
    });
    
    // Return updated tags
    const tags = await db('tags')
      .join('project_tags', 'tags.id', 'project_tags.tag_id')
      .where({ 'project_tags.project_id': req.params.projectId })
      .select('tags.*');
    
    res.json(tags);
  } catch (error) {
    console.error('Error assigning project tags:', error);
    res.status(500).json({ error: 'Failed to assign project tags' });
  }
});

// Get tags for a specific notebook
router.get('/notebook/:notebookId', authenticate, async (req, res) => {
  try {
    // First verify the notebook belongs to the user
    const notebook = await db('notebooks')
      .where({ 
        id: req.params.notebookId,
        user_id: req.user!.userId 
      })
      .first();
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    // Get tags for the notebook
    const tags = await db('tags')
      .join('notebook_tags', 'tags.id', 'notebook_tags.tag_id')
      .where({ 'notebook_tags.notebook_id': req.params.notebookId })
      .select('tags.*');
    
    res.json(tags);
  } catch (error) {
    console.error('Error fetching notebook tags:', error);
    res.status(500).json({ error: 'Failed to fetch notebook tags' });
  }
});

// Assign tags to a notebook
router.post('/notebook/:notebookId', authenticate, async (req, res) => {
  try {
    const { tagIds } = req.body;
    
    if (!Array.isArray(tagIds)) {
      return res.status(400).json({ error: 'tagIds must be an array' });
    }
    
    // Verify the notebook belongs to the user
    const notebook = await db('notebooks')
      .where({ 
        id: req.params.notebookId,
        user_id: req.user!.userId 
      })
      .first();
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    // Verify all tags belong to the user
    const userTags = await db('tags')
      .where({ user_id: req.user!.userId })
      .whereIn('id', tagIds)
      .pluck('id');
    
    if (userTags.length !== tagIds.length) {
      return res.status(400).json({ error: 'One or more tags not found' });
    }
    
    // Remove existing tags and add new ones
    await db.transaction(async (trx) => {
      await trx('notebook_tags')
        .where({ notebook_id: req.params.notebookId })
        .delete();
      
      if (tagIds.length > 0) {
        const notebookTags = tagIds.map(tagId => ({
          notebook_id: parseInt(req.params.notebookId),
          tag_id: tagId
        }));
        
        await trx('notebook_tags').insert(notebookTags);
      }
    });
    
    // Return updated tags
    const tags = await db('tags')
      .join('notebook_tags', 'tags.id', 'notebook_tags.tag_id')
      .where({ 'notebook_tags.notebook_id': req.params.notebookId })
      .select('tags.*');
    
    res.json(tags);
  } catch (error) {
    console.error('Error assigning notebook tags:', error);
    res.status(500).json({ error: 'Failed to assign notebook tags' });
  }
});

export default router;