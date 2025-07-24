/**
 * AI-powered task enhancement routes
 */

import { Router, Request, Response } from 'express';
import authenticate from '../middleware/auth.middleware';
import { enhanceTaskWithAI, createAnthropicClient } from '../utils/anthropic';
import db from '../src/db';

const router = Router();

// Enhance an existing task
router.post('/tasks/:id/enhance', authenticate, async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user!.userId;

    // Check if user has API key
    const client = await createAnthropicClient(userId);
    if (!client) {
      return res.status(400).json({ 
        error: 'No API key configured. Please add your Anthropic API key in settings.' 
      });
    }

    // Get the task
    const task = await db('tasks')
      .where({ id: taskId, user_id: userId })
      .first();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Enhance the task
    try {
      const enhancement = await enhanceTaskWithAI(
        userId,
        task.title,
        task.description
      );

      if (!enhancement) {
        return res.status(500).json({ error: 'Failed to generate enhancement' });
      }

      res.json({
        original: {
          title: task.title,
          description: task.description,
          priority: task.priority
        },
        enhancement
      });
    } catch (aiError: any) {
      if (aiError.message === 'No API key configured') {
        return res.status(400).json({ error: aiError.message });
      }
      
      console.error('AI enhancement error:', aiError);
      return res.status(500).json({ 
        error: 'Failed to enhance task. Please check your API key and try again.' 
      });
    }
  } catch (error) {
    console.error('Enhance task error:', error);
    res.status(500).json({ error: 'Failed to enhance task' });
  }
});

// Enhance a new task (used during creation)
router.post('/enhance', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const userId = req.user!.userId;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Check if user has API key
    const client = await createAnthropicClient(userId);
    if (!client) {
      return res.status(400).json({ 
        error: 'No API key configured. Please add your Anthropic API key in settings.' 
      });
    }

    // Enhance the task
    try {
      const enhancement = await enhanceTaskWithAI(userId, title, description);

      if (!enhancement) {
        return res.status(500).json({ error: 'Failed to generate enhancement' });
      }

      res.json({ enhancement });
    } catch (aiError: any) {
      if (aiError.message === 'No API key configured') {
        return res.status(400).json({ error: aiError.message });
      }
      
      console.error('AI enhancement error:', aiError);
      return res.status(500).json({ 
        error: 'Failed to enhance task. Please check your API key and try again.' 
      });
    }
  } catch (error) {
    console.error('Enhance task error:', error);
    res.status(500).json({ error: 'Failed to enhance task' });
  }
});

// Suggest tasks based on project
router.post('/suggest-tasks', authenticate, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;
    const userId = req.user!.userId;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Check if user has API key
    const client = await createAnthropicClient(userId);
    if (!client) {
      return res.status(400).json({ 
        error: 'No API key configured. Please add your Anthropic API key in settings.' 
      });
    }

    // Get the project
    const project = await db('projects')
      .where({ id: projectId, user_id: userId })
      .first();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get existing tasks for context
    const existingTasks = await db('tasks')
      .where({ project_id: projectId })
      .select('title', 'description', 'status');

    const prompt = `Given a project titled "${project.name}" ${project.description ? `with description: "${project.description}"` : ''}, 
    and these existing tasks: ${existingTasks.map(t => `"${t.title}" (${t.status})`).join(', ')},
    suggest 3-5 new tasks that would help complete this project. 
    
    Return a JSON array of task suggestions with this structure:
    [
      {
        "title": "Task title",
        "description": "Clear description of what needs to be done",
        "priority": "low|medium|high",
        "estimatedTime": "e.g., 2 hours"
      }
    ]`;

    const response = await client.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        res.json({ suggestions });
      } else {
        res.status(500).json({ error: 'Failed to parse AI suggestions' });
      }
    } else {
      res.status(500).json({ error: 'Unexpected response format' });
    }
  } catch (error: any) {
    console.error('Suggest tasks error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate task suggestions' 
    });
  }
});

export default router;