/**
 * AI-powered task enhancement routes
 */

import { Router, Request, Response } from 'express';
import authenticate from '../middleware/auth.middleware';
import { enhanceTaskWithAI, createAnthropicClient, parseNaturalLanguageCommand } from '../utils/anthropic';
import db from '../src/db';

const router = Router();

console.log('AI routes file loaded');

// Test route
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'AI routes are working' });
});

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
      model: 'claude-3-5-sonnet-20241022',
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

// Main chat endpoint for conversational interface
router.post('/chat', authenticate, async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    const userId = req.user!.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if user has API key
    const client = await createAnthropicClient(userId);
    if (!client) {
      return res.status(200).json({ 
        response: 'I need your Anthropic API key to help you. Please go to Settings and add your API key.',
        metadata: { action: 'api_key_required' }
      });
    }

    // Build comprehensive context
    const projectContext = context?.currentProjectId ? 
      await db('projects').where({ id: context.currentProjectId, user_id: userId }).first() : null;
    
    const recentTasks = context?.currentProjectId ?
      await db('tasks').where({ project_id: context.currentProjectId }).limit(10).select('id', 'title', 'status') : [];

    const userProjects = await db('projects').where({ user_id: userId }).select('id', 'name');

    // Create a comprehensive prompt
    const systemPrompt = `You are Ezra, an AI assistant for a project management app. You help users manage projects, tasks, and notes through natural conversation.

Current context:
- User has ${userProjects.length} projects
- Current project: ${projectContext ? `"${projectContext.name}" (ID: ${projectContext.id})` : 'None selected'}
- Available projects: ${userProjects.map(p => `"${p.name}" (ID: ${p.id})`).join(', ')}
${recentTasks.length > 0 ? `- Recent tasks in current project:\n${recentTasks.map(t => `  - [ID: ${t.id}] "${t.title}" (${t.status})`).join('\n')}` : ''}

IMPORTANT: When the user asks you to create, update, delete, or query tasks/projects, you MUST respond with a JSON object that includes both a conversational response AND the action to perform.

Available actions:
- create_task: Creates a new task (requires: title, optional: description, status, priority)
- create_project: Creates a new project (requires: name, optional: description, color)
- update_task: Updates existing tasks (requires: taskIds array, updates object)
- delete_task: Deletes tasks (requires: taskIds array)
- navigate: Navigate to a different page (requires: path)

Example responses:

User: "Create a task called 'Review code'"
You must respond with:
{
  "response": "I'll create the task 'Review code' for you in the current project.",
  "action": "create_task",
  "parameters": {
    "title": "Review code",
    "projectId": ${projectContext?.id || 'null'}
  }
}

User: "Add a task: Fix the login bug"  
You must respond with:
{
  "response": "I'll add the task 'Fix the login bug' to your current project.",
  "action": "create_task", 
  "parameters": {
    "title": "Fix the login bug",
    "projectId": ${projectContext?.id || 'null'}
  }
}

ALWAYS respond with a JSON object when the user requests an action. The response field should be conversational, and the action field should specify what to do.`;

    const chatResponse = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.3,  // Lower temperature for more consistent formatting
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${message}\n\nRemember to respond with a JSON object containing "response", "action", and "parameters" fields if this is a request to create, update, or delete something.`,
        },
      ],
    });

    const content = chatResponse.content[0];
    if (content.type === 'text') {
      console.log('AI Response:', content.text);
      
      // Try to parse as JSON first
      // Also check for JSON in code blocks
      let jsonMatch = content.text.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                      content.text.match(/```\s*(\{[\s\S]*?\})\s*```/) ||
                      content.text.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        try {
          // Clean the JSON string to handle common issues
          let jsonString = jsonMatch[1] || jsonMatch[0]; // Use capture group if available
          // Remove code block markers if present
          jsonString = jsonString.replace(/```json\s*/, '').replace(/```\s*$/, '').replace(/```/, '');
          
          // More robust cleaning of newlines and tabs within JSON strings
          // This regex finds strings and replaces unescaped newlines/tabs
          jsonString = jsonString.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
            return match.replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r');
          });
          
          console.log('Parsing JSON:', jsonString);
          const parsed = JSON.parse(jsonString);
          
          // Execute action if specified
          let actionResult = null;
          if (parsed.action && parsed.parameters) {
            try {
              console.log('Executing action:', parsed.action, 'with parameters:', parsed.parameters);
              actionResult = await executeAction(parsed.action, parsed.parameters, userId, context);
              console.log('Action result:', actionResult);
              parsed.metadata = { 
                ...parsed.metadata, 
                action: actionResult.action,
                result: actionResult.result 
              };
            } catch (actionError: any) {
              console.error('Action execution error:', actionError);
              console.error('Error stack:', actionError.stack);
              // Return the response but indicate the action failed
              parsed.metadata = {
                ...parsed.metadata,
                action: 'failed',
                error: actionError.message
              };
              // Also include error in response for debugging
              parsed.response = parsed.response + `\n\nI encountered an error: ${actionError.message}`;
            }
          }

          console.log('Sending response:', {
            response: parsed.response || content.text,
            metadata: parsed.metadata || {}
          });
          
          res.json({
            response: parsed.response || content.text,
            metadata: parsed.metadata || {}
          });
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.log('Raw AI response:', content.text);
          
          // Try to detect if this was meant to be a task creation
          const taskCreationPatterns = [
            /create\s+(?:a\s+)?task:?\s*["']?([^"'\n]+)["']?/i,
            /add\s+(?:a\s+)?task:?\s*["']?([^"'\n]+)["']?/i,
            /new\s+task:?\s*["']?([^"'\n]+)["']?/i,
            /make\s+(?:a\s+)?task:?\s*["']?([^"'\n]+)["']?/i
          ];
          
          let taskTitle = null;
          for (const pattern of taskCreationPatterns) {
            const match = message.match(pattern);
            if (match) {
              taskTitle = match[1].trim();
              break;
            }
          }
          
          // If we detected a task creation intent, execute it
          if (taskTitle && context?.currentProjectId) {
            try {
              const actionResult = await executeAction('create_task', {
                title: taskTitle,
                projectId: context.currentProjectId
              }, userId, context);
              
              res.json({
                response: `I'll create the task "${taskTitle}" for you.`,
                metadata: {
                  action: actionResult.action,
                  result: actionResult.result
                }
              });
              return;
            } catch (actionError: any) {
              console.error('Fallback action error:', actionError);
            }
          }
          
          // Otherwise, fallback to plain text response
          res.json({
            response: content.text,
            metadata: {}
          });
        }
      } else {
        // Fallback to plain text response
        res.json({
          response: content.text,
          metadata: {}
        });
      }
    } else {
      res.status(500).json({ error: 'Unexpected response format' });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process chat message' 
    });
  }
});

// Helper function to execute actions based on chat intent
async function executeAction(action: string, parameters: any, userId: number, context: any) {
  try {
    switch (action) {
      case 'create_project':
        const newProject = await db('projects').insert({
          user_id: userId,
          name: parameters.name,
          description: parameters.description || null,
          color: parameters.color || '#3182CE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        const createdProject = await db('projects')
          .where({ user_id: userId })
          .orderBy('id', 'desc')
          .first();
        
        return {
          action: 'created_project',
          result: { 
            projectId: createdProject.id,
            projectName: createdProject.name 
          }
        };

      case 'create_task':
        const projectId = parameters.projectId || context?.currentProjectId;
        if (!projectId) {
          throw new Error('No project selected. Please specify a project or navigate to a project board first.');
        }

        // Verify user owns the project
        const projectCheck = await db('projects')
          .where({ 
            id: projectId,
            user_id: userId 
          })
          .first();
        
        if (!projectCheck) {
          throw new Error('Project not found or you don\'t have access to it');
        }

        const maxPosition = await db('tasks')
          .where({ 
            project_id: projectId,
            status: parameters.status || 'todo' 
          })
          .max('position as max')
          .first();
        
        const newTask = {
          project_id: projectId,
          title: parameters.title,
          description: parameters.description || null,
          status: parameters.status || 'todo',
          priority: parameters.priority || 'medium',
          position: (maxPosition?.max || 0) + 1,
          due_date: parameters.due_date || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await db('tasks').insert(newTask);
        
        const createdTask = await db('tasks')
          .where({ project_id: projectId })
          .orderBy('id', 'desc')
          .first();
        
        return {
          action: 'created_task',
          result: { 
            taskId: createdTask.id,
            taskTitle: createdTask.title,
            projectId: projectId
          }
        };

      case 'update_task':
      case 'move_task':
        if (!parameters.taskIds || parameters.taskIds.length === 0) {
          throw new Error('No tasks specified');
        }

        await db('tasks')
          .whereIn('id', parameters.taskIds)
          .update({
            ...parameters.updates,
            updated_at: new Date().toISOString()
          });
        
        return {
          action: 'updated_task',
          result: { 
            count: parameters.taskIds.length,
            taskIds: parameters.taskIds 
          }
        };

      case 'delete_task':
        if (!parameters.taskIds || parameters.taskIds.length === 0) {
          throw new Error('No tasks specified for deletion');
        }

        // Verify tasks exist and user has access
        const tasksToDelete = await db('tasks as t')
          .join('projects as p', 't.project_id', 'p.id')
          .whereIn('t.id', parameters.taskIds)
          .where('p.user_id', userId)
          .select('t.id');
        
        if (tasksToDelete.length === 0) {
          throw new Error('No tasks found or you don\'t have access to delete them');
        }

        // Delete the tasks
        await db('tasks')
          .whereIn('id', tasksToDelete.map(t => t.id))
          .delete();
        
        return {
          action: 'deleted_task',
          result: { 
            count: tasksToDelete.length,
            taskIds: tasksToDelete.map(t => t.id)
          }
        };

      case 'create_note':
        // For now, notes are part of the notebook system
        // We'll return a message indicating this
        return {
          action: 'navigate',
          result: { 
            path: '/app/notebooks',
            message: 'Notes are created in the Notebooks section. I\'ll take you there!'
          }
        };

      case 'navigate':
        return {
          action: 'navigate',
          result: { path: parameters.path }
        };

      case 'query_tasks':
      case 'query_projects':
        // These are handled in the frontend with existing data
        return {
          action: action,
          result: parameters
        };

      default:
        console.log('Unknown action:', action);
        // Don't throw error, just return no action
        return {
          action: 'none',
          result: { message: `I understand you want to ${action}, but I can't do that directly yet.` }
        };
    }
  } catch (error: any) {
    console.error('Action execution error:', error);
    throw error;
  }
}

export default router;