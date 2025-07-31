/**
 * Search endpoints for finding content across the application
 */

import express from 'express';
import authenticate from '../middleware/auth.middleware';
import db from '../src/db';

const router = express.Router();

interface SearchResult {
  type: 'task' | 'project' | 'notebook' | 'page';
  id: number;
  title: string;
  description?: string;
  content?: string;
  projectId?: number;
  projectName?: string;
  notebookId?: number;
  notebookTitle?: string;
  match?: string;
  score: number;
}

// Search across all content types
router.get('/', authenticate, async (req, res) => {
  try {
    const { q, types = 'all', limit = 20 } = req.query;
    const query = (q as string || '').toLowerCase().trim();
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const results: SearchResult[] = [];
    const searchTypes = types === 'all' 
      ? ['task', 'project', 'notebook', 'page'] 
      : (types as string).split(',');

    // Search tasks
    if (searchTypes.includes('task')) {
      const tasks = await db('tasks')
        .join('projects', 'tasks.project_id', 'projects.id')
        .where('projects.user_id', req.user!.userId)
        .andWhere((builder) => {
          builder
            .whereRaw('LOWER(tasks.title) LIKE ?', [`%${query}%`])
            .orWhereRaw('LOWER(tasks.description) LIKE ?', [`%${query}%`]);
        })
        .select(
          'tasks.id',
          'tasks.title',
          'tasks.description',
          'tasks.project_id as projectId',
          'projects.title as projectName'
        );

      tasks.forEach(task => {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = task.description?.toLowerCase().includes(query);
        
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          description: task.description,
          projectId: task.projectId,
          projectName: task.projectName,
          match: titleMatch ? 'title' : 'description',
          score: titleMatch ? 10 : 5
        });
      });
    }

    // Search projects
    if (searchTypes.includes('project')) {
      const projects = await db('projects')
        .where('user_id', req.user!.userId)
        .andWhere((builder) => {
          builder
            .whereRaw('LOWER(name) LIKE ?', [`%${query}%`])
            .orWhereRaw('LOWER(description) LIKE ?', [`%${query}%`]);
        })
        .select('id', 'name', 'description');

      projects.forEach(project => {
        const titleMatch = project.name.toLowerCase().includes(query);
        const descMatch = project.description?.toLowerCase().includes(query);
        
        results.push({
          type: 'project',
          id: project.id,
          title: project.name,
          description: project.description,
          match: titleMatch ? 'title' : 'description',
          score: titleMatch ? 10 : 5
        });
      });
    }

    // Search notebooks
    if (searchTypes.includes('notebook')) {
      const notebooks = await db('notebooks')
        .where('user_id', req.user!.userId)
        .andWhere((builder) => {
          builder
            .whereRaw('LOWER(title) LIKE ?', [`%${query}%`])
            .orWhereRaw('LOWER(description) LIKE ?', [`%${query}%`]);
        })
        .select('id', 'title', 'description');

      notebooks.forEach(notebook => {
        const titleMatch = notebook.title.toLowerCase().includes(query);
        const descMatch = notebook.description?.toLowerCase().includes(query);
        
        results.push({
          type: 'notebook',
          id: notebook.id,
          title: notebook.title,
          description: notebook.description,
          match: titleMatch ? 'title' : 'description',
          score: titleMatch ? 10 : 5
        });
      });
    }

    // Search notebook pages
    if (searchTypes.includes('page')) {
      const pages = await db('notebook_pages')
        .join('notebooks', 'notebook_pages.notebook_id', 'notebooks.id')
        .where('notebooks.user_id', req.user!.userId)
        .andWhere((builder) => {
          builder
            .whereRaw('LOWER(notebook_pages.title) LIKE ?', [`%${query}%`])
            .orWhereRaw('LOWER(notebook_pages.content) LIKE ?', [`%${query}%`]);
        })
        .select(
          'notebook_pages.id',
          'notebook_pages.title',
          'notebook_pages.content',
          'notebook_pages.notebook_id as notebookId',
          'notebooks.title as notebookTitle'
        );

      pages.forEach(page => {
        const titleMatch = page.title.toLowerCase().includes(query);
        const contentMatch = page.content?.toLowerCase().includes(query);
        
        // Extract a snippet from content if it matches
        let snippet = '';
        if (contentMatch && page.content) {
          try {
            const content = JSON.parse(page.content);
            const textContent = extractTextFromTipTap(content);
            const index = textContent.toLowerCase().indexOf(query);
            if (index !== -1) {
              const start = Math.max(0, index - 50);
              const end = Math.min(textContent.length, index + query.length + 50);
              snippet = textContent.substring(start, end);
              if (start > 0) snippet = '...' + snippet;
              if (end < textContent.length) snippet = snippet + '...';
            }
          } catch (e) {
            // If content is not valid JSON, treat as plain text
            snippet = page.content.substring(0, 100) + '...';
          }
        }
        
        results.push({
          type: 'page',
          id: page.id,
          title: page.title,
          content: snippet,
          notebookId: page.notebookId,
          notebookTitle: page.notebookTitle,
          match: titleMatch ? 'title' : 'content',
          score: titleMatch ? 10 : 3
        });
      });
    }

    // Sort results by score (highest first) and limit
    results.sort((a, b) => b.score - a.score);
    const limitedResults = results.slice(0, parseInt(limit as string));

    res.json({
      query,
      results: limitedResults,
      total: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Helper function to extract text from TipTap JSON content
function extractTextFromTipTap(content: any): string {
  if (typeof content === 'string') return content;
  
  let text = '';
  
  const extractFromNode = (node: any) => {
    if (node.text) {
      text += node.text + ' ';
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(extractFromNode);
    }
  };
  
  if (content.content && Array.isArray(content.content)) {
    content.content.forEach(extractFromNode);
  }
  
  return text.trim();
}

export default router;