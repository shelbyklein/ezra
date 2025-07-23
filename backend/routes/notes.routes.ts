/**
 * Notes CRUD endpoints for managing markdown notes
 */

import express from 'express';
import authenticate from '../middleware/auth.middleware';
import db from '../src/db';

const router = express.Router();

// Get all notes for a project
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
    
    const notes = await db('notes')
      .where({ project_id: req.params.projectId })
      .orderBy('created_at', 'desc');
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get all notes for a task
router.get('/task/:taskId', authenticate, async (req, res) => {
  try {
    // Verify user owns the task's project
    const task = await db('tasks as t')
      .join('projects as p', 't.project_id', 'p.id')
      .where({ 
        't.id': req.params.taskId,
        'p.user_id': req.user!.userId 
      })
      .select('t.*')
      .first();
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const notes = await db('notes')
      .where({ task_id: req.params.taskId })
      .orderBy('created_at', 'desc');
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const note = await db('notes as n')
      .join('projects as p', 'n.project_id', 'p.id')
      .where({ 
        'n.id': req.params.id,
        'p.user_id': req.user!.userId 
      })
      .select('n.*')
      .first();
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create new note
router.post('/', authenticate, async (req, res) => {
  try {
    const { project_id, task_id, title, content } = req.body;
    
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
    
    // If task_id is provided, verify it belongs to the project
    if (task_id) {
      const task = await db('tasks')
        .where({ 
          id: task_id,
          project_id 
        })
        .first();
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found in this project' });
      }
    }
    
    const note = {
      project_id,
      task_id: task_id || null,
      title,
      content: content || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await db('notes').insert(note);
    
    // SQLite doesn't support returning clause properly, so we fetch the last inserted note
    const createdNote = await db('notes')
      .where({ project_id })
      .orderBy('id', 'desc')
      .first();
    
    res.status(201).json(createdNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Verify user owns the note's project
    const note = await db('notes as n')
      .join('projects as p', 'n.project_id', 'p.id')
      .where({ 
        'n.id': req.params.id,
        'p.user_id': req.user!.userId 
      })
      .select('n.*')
      .first();
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const { title, content } = req.body;
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    
    await db('notes')
      .where({ id: req.params.id })
      .update(updateData);
    
    const updatedNote = await db('notes')
      .where({ id: req.params.id })
      .first();
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Verify user owns the note's project
    const note = await db('notes as n')
      .join('projects as p', 'n.project_id', 'p.id')
      .where({ 
        'n.id': req.params.id,
        'p.user_id': req.user!.userId 
      })
      .select('n.id')
      .first();
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    await db('notes')
      .where({ id: req.params.id })
      .delete();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;