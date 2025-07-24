/**
 * Project CRUD endpoints for managing kanban projects
 */

import express from 'express';
import authenticate from '../middleware/auth.middleware';
import db from '../src/db';

const router = express.Router();

// Get all projects for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await db('projects')
      .where({ user_id: req.user!.userId })
      .orderBy('created_at', 'desc');
    
    // Fetch tags for all projects
    const projectIds = projects.map(project => project.id);
    let projectTags: Array<{ project_id: number; id: number; name: string; color: string }> = [];
    if (projectIds.length > 0) {
      projectTags = await db('project_tags as pt')
        .join('tags as t', 'pt.tag_id', 't.id')
        .whereIn('pt.project_id', projectIds)
        .select('pt.project_id', 't.id', 't.name', 't.color');
    }
    
    // Group tags by project
    const tagsByProject = projectTags.reduce((acc, tag) => {
      if (!acc[tag.project_id]) {
        acc[tag.project_id] = [];
      }
      acc[tag.project_id].push({
        id: tag.id,
        name: tag.name,
        color: tag.color
      });
      return acc;
    }, {} as Record<number, Array<{ id: number; name: string; color: string }>>);
    
    // Add tags to projects
    const projectsWithTags = projects.map(project => ({
      ...project,
      tags: tagsByProject[project.id] || []
    }));
    
    res.json(projectsWithTags);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await db('projects')
      .where({ 
        id: req.params.id,
        user_id: req.user!.userId 
      })
      .first();
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Fetch tags for this project
    const projectTags = await db('project_tags as pt')
      .join('tags as t', 'pt.tag_id', 't.id')
      .where('pt.project_id', project.id)
      .select('t.id', 't.name', 't.color');
    
    res.json({
      ...project,
      tags: projectTags
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    // Validate color format (hex)
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({ error: 'Invalid color format. Use hex format like #3182CE' });
    }
    
    const project = {
      user_id: req.user!.userId,
      name,
      description: description || null,
      color: color || '#3182CE', // Default blue if not provided
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await db('projects').insert(project);
    
    // SQLite doesn't support returning clause properly, so we fetch the last inserted project
    const createdProject = await db('projects')
      .where({ user_id: req.user!.userId })
      .orderBy('id', 'desc')
      .first();
    
    res.status(201).json(createdProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    // Validate color format if provided
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({ error: 'Invalid color format. Use hex format like #3182CE' });
    }
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    
    const updated = await db('projects')
      .where({ 
        id: req.params.id,
        user_id: req.user!.userId 
      })
      .update(updateData);
    
    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = await db('projects')
      .where({ id: req.params.id })
      .first();
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // First delete all tasks associated with the project
    await db('tasks')
      .where({ project_id: req.params.id })
      .delete();
    
    // Then delete the project
    const deleted = await db('projects')
      .where({ 
        id: req.params.id,
        user_id: req.user!.userId 
      })
      .delete();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;