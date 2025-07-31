/**
 * AI-powered task enhancement routes
 */

import { Router, Request, Response } from 'express';
import authenticate from '../middleware/auth.middleware';
import { enhanceTaskWithAI, createAnthropicClient, parseNaturalLanguageCommand } from '../utils/anthropic';
import db from '../src/db';
import { searchUserContent, formatContextForAI, generateSourceCitations, extractTextFromTipTap } from '../utils/contextSearch';

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

    const prompt = `Given a project titled "${project.title}" ${project.description ? `with description: "${project.description}"` : ''}, 
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

// Search user's content for context
router.post('/search-context', authenticate, async (req: Request, res: Response) => {
  try {
    const { query, options = {} } = req.body;
    const userId = req.user!.userId;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await searchUserContent(query, userId, options);
    
    res.json({
      results,
      formattedContext: formatContextForAI(results),
      citations: generateSourceCitations(results)
    });
  } catch (error: any) {
    console.error('Context search error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to search content' 
    });
  }
});

// Main chat endpoint for conversational interface
router.post('/chat', authenticate, async (req: Request, res: Response) => {
  try {
    const { message, context, conversationId } = req.body;
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

    // Search for relevant context based on the user's message
    let searchResults: any[] = [];
    let searchContext = '';
    let citations = '';
    
    // Always perform context search to find relevant content
    // This ensures the AI can find specific references like "fakeNumberReference"
    try {
      // Search with a higher limit to ensure we capture relevant content
      searchResults = await searchUserContent(message, userId, { limit: 10 });
      if (searchResults.length > 0) {
        searchContext = formatContextForAI(searchResults);
        citations = generateSourceCitations(searchResults);
      }
    } catch (searchError: any) {
      console.error('Context search failed:', searchError);
      console.error('Search error details:', searchError.message);
      console.error('Stack trace:', searchError.stack);
      // Continue without search context
    }

    // Build comprehensive context
    const projectContext = context?.currentProjectId ? 
      await db('projects').where({ id: context.currentProjectId, user_id: userId }).first() : null;
    
    const recentTasks = context?.currentProjectId ?
      await db('tasks').where({ project_id: context.currentProjectId }).limit(10).select('id', 'title', 'status') : [];

    const userProjects = await db('projects').where({ user_id: userId }).select('id', 'title');

    // Get notebook context if available
    const notebookContext = context?.currentNotebookId ?
      await db('notebooks').where({ id: context.currentNotebookId, user_id: userId }).first() : null;
    
    const pageContext = context?.currentPageId ?
      await db('notebook_pages as p')
        .join('notebooks as n', 'p.notebook_id', 'n.id')
        .where({ 'p.id': context.currentPageId, 'n.user_id': userId })
        .select('p.*')
        .first() : null;

    // Create a comprehensive prompt
    const systemPrompt = `You are Ezra, an AI assistant for a project management app with full access to the user's knowledge base. You help users manage projects, tasks, and notes through natural conversation.

${searchContext ? `## Relevant Information from User's Knowledge Base:\n${searchContext}\n` : ''}

Current context:
- User has ${userProjects.length} projects
- Current project: ${projectContext ? `"${projectContext.title}" (ID: ${projectContext.id})` : 'None selected'}
- Available projects: ${userProjects.map(p => `"${p.title}" (ID: ${p.id})`).join(', ')}
${recentTasks.length > 0 ? `- Recent tasks in current project:\n${recentTasks.map(t => `  - [ID: ${t.id}] "${t.title}" (${t.status})`).join('\n')}` : ''}
${notebookContext ? `- Current notebook: "${notebookContext.name}" (ID: ${notebookContext.id})` : ''}
${pageContext ? `- Current page: "${pageContext.title}" (ID: ${pageContext.id})\n- You CAN edit this page using the update_page action` : ''}

${pageContext ? `## Current Page Content:\nYou are currently viewing the page "${pageContext.title}" which contains:\n${extractTextFromTipTap(JSON.parse(pageContext.content))}\n` : ''}

IMPORTANT INSTRUCTIONS:
1. When the user asks you to create, update, delete, or query tasks/projects/pages, you MUST respond with a JSON object that includes both a conversational response AND the action to perform.
2. When creating tasks, ALWAYS provide a clear, specific title. Never send null or empty titles. If parsing an email or text, extract meaningful task titles from the content.
3. When navigating to a project, find the project ID from the userProjects list and use the path "/app/board/[projectId]" replacing [projectId] with the actual ID number.
4. When answering questions using information from the knowledge base:
   - FIRST check if the answer is in the current page content (if viewing a page)
   - Then CAREFULLY PARSE the FULL CONTENT provided in the search results
   - Look for EXACT matches or references to what the user is asking about
   - The search results contain the COMPLETE content of matching pages - read them thoroughly
   - If you find the specific information (like a number, code, or reference), provide it exactly as written
   - If you reference information from the knowledge base, mention the source naturally in your response
   - Be clear when information comes from the user's own content vs general knowledge
   - If no relevant information is found after parsing all content, say so clearly
5. When on a notebook page, you CAN:
- Add content to the current page (append mode)
- Replace the entire page content
- Edit the page title
- You do NOT need to see the current content to add to it - just use append: true

Available actions:
- create_task: Creates a new task (requires: title, optional: description, status, priority)
- create_multiple_tasks: Creates multiple tasks at once (requires: tasks array with title for each, optional: description, status, priority for each)
- create_project: Creates a new project (requires: name, optional: description, color)
- update_task: Updates existing tasks (requires: taskIds array, updates object)
- delete_task: Deletes tasks (requires: taskIds array)
- update_page: Updates the current notebook page content (requires: pageId, content; optional: title, append)
- create_page: Creates a new page in a notebook (requires: title, notebookId)
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

User: "I got an email and would like you to parse it into tasks. Here's the email: [email content]"
You must analyze the email content and create separate tasks for each actionable item. Each task MUST have a clear, specific title. You must respond with:
{
  "response": "I'll create tasks based on the email. I've identified X action items that need to be tracked.",
  "action": "create_multiple_tasks",
  "parameters": {
    "tasks": [
      {
        "title": "Upload PDF labeled 'Master Site Plan'",
        "description": "Upload the PDF file and label it 'Master Site Plan'. It should appear in the 'About Us' dropdown menu, below 'Strategic Plan'.",
        "priority": "high"
      },
      {
        "title": "Rename 'Mitzvah Day 2025' page to 'Mitzvah Day'",
        "description": "Remove the year (2025) from the page name so it doesn't need yearly updates.",
        "priority": "medium"
      }
    ],
    "projectId": ${projectContext?.id || 'null'}
  }
}

User: "What tasks do I have for Shelby Klein Design?" or "Show me the Shelby Klein Design project"
You must respond with:
{
  "response": "I'll navigate to the Shelby Klein Design project to show you the tasks.",
  "action": "navigate",
  "parameters": {
    "path": "/app/board/[projectId]"
  }
}
Note: Replace [projectId] with the actual project ID from the userProjects list.

User: "Add a dragon to the story"
You must respond with:
{
  "response": "I'll add a dragon to your story.",
  "action": "update_page",
  "parameters": {
    "pageId": ${pageContext?.id || 'null'},
    "append": true,
    "content": "\\n\\nSuddenly, a magnificent dragon appeared in the sky, its scales shimmering like emeralds in the sunlight. The dragon circled overhead before landing gracefully nearby, its intelligent eyes studying the scene with ancient wisdom."
  }
}

User: "Add a dragon to the story and highlight it"
You must respond with:
{
  "response": "I'll add a dragon to your story and highlight the new content.",
  "action": "update_page",
  "parameters": {
    "pageId": ${pageContext?.id || 'null'},
    "append": true,
    "highlight": true,
    "content": "\\n\\nSuddenly, a magnificent dragon appeared in the sky, its scales shimmering like emeralds in the sunlight. The dragon circled overhead before landing gracefully nearby, its intelligent eyes studying the scene with ancient wisdom."
  }
}

User: "Add a heading 'Introduction' to this page"
You must respond with:
{
  "response": "I'll add the heading 'Introduction' to the current page.",
  "action": "update_page",
  "parameters": {
    "pageId": ${pageContext?.id || 'null'},
    "append": true,
    "content": "# Introduction\\n"
  }
}

User: "Replace the content with [some text]"
You must respond with:
{
  "response": "I'll replace the page content with your text.",
  "action": "update_page",
  "parameters": {
    "pageId": ${pageContext?.id || 'null'},
    "content": "[the user's text]",
    "append": false
  }
}

IMPORTANT: When updating a page, ALWAYS include the pageId parameter. The current page ID is: ${pageContext?.id || 'null'}

You can use the "highlight" parameter set to true when adding content to make the newly added text highlighted in yellow. This is useful when the user asks you to highlight what was added or to make new content stand out.

ALWAYS respond with a JSON object when the user requests an action. The response field should be conversational, and the action field should specify what to do.`;

    let chatResponse;
    try {
      chatResponse = await client.messages.create({
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
    } catch (claudeError: any) {
      console.error('Claude API error:', claudeError);
      console.error('Claude error details:', claudeError.response?.data || claudeError.message);
      
      if (claudeError.status === 401 || claudeError.message?.includes('authentication')) {
        return res.status(200).json({ 
          response: 'Your Anthropic API key appears to be invalid. Please check your API key in settings.',
          metadata: { action: 'api_key_invalid' }
        });
      }
      
      throw claudeError; // Re-throw to be caught by outer catch
    }

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
          
          // Add citations if we used search context
          let finalResponse = parsed.response || content.text;
          if (searchResults.length > 0 && !parsed.action) {
            // Only add citations for informational responses, not action responses
            finalResponse += citations;
          }
          
          // Save messages to chat history if conversationId is provided
          if (conversationId) {
            try {
              // Save user message
              await db('chat_messages').insert({
                conversation_id: conversationId,
                role: 'user',
                content: message,
                metadata: JSON.stringify({}),
                created_at: new Date().toISOString()
              });
              
              // Save assistant response
              await db('chat_messages').insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: finalResponse,
                metadata: JSON.stringify({
                  ...(parsed.metadata || {}),
                  hasContext: searchResults.length > 0
                }),
                created_at: new Date().toISOString()
              });
              
              // Update conversation last message time
              await db('chat_conversations')
                .where({ id: conversationId })
                .update({ last_message_at: new Date().toISOString() });
            } catch (dbError) {
              console.error('Failed to save chat history:', dbError);
              // Continue without saving
            }
          }
          
          res.json({
            response: finalResponse,
            metadata: {
              ...(parsed.metadata || {}),
              hasContext: searchResults.length > 0
            }
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
          let finalResponse = content.text;
          if (searchResults.length > 0) {
            finalResponse += citations;
          }
          
          // Save messages to chat history if conversationId is provided
          if (conversationId) {
            try {
              // Save user message
              await db('chat_messages').insert({
                conversation_id: conversationId,
                role: 'user',
                content: message,
                metadata: JSON.stringify({}),
                created_at: new Date().toISOString()
              });
              
              // Save assistant response
              await db('chat_messages').insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: finalResponse,
                metadata: JSON.stringify({
                  hasContext: searchResults.length > 0
                }),
                created_at: new Date().toISOString()
              });
              
              // Update conversation last message time
              await db('chat_conversations')
                .where({ id: conversationId })
                .update({ last_message_at: new Date().toISOString() });
            } catch (dbError) {
              console.error('Failed to save chat history:', dbError);
            }
          }
          
          res.json({
            response: finalResponse,
            metadata: {
              hasContext: searchResults.length > 0
            }
          });
        }
      } else {
        // Fallback to plain text response
        let finalResponse = content.text;
        if (searchResults.length > 0) {
          finalResponse += citations;
        }
        
        // Save messages to chat history if conversationId is provided
        if (conversationId) {
          try {
            await db('chat_messages').insert([
              {
                conversation_id: conversationId,
                role: 'user',
                content: message,
                metadata: JSON.stringify({}),
                created_at: new Date().toISOString()
              },
              {
                conversation_id: conversationId,
                role: 'assistant',
                content: finalResponse,
                metadata: JSON.stringify({
                  hasContext: searchResults.length > 0
                }),
                created_at: new Date().toISOString()
              }
            ]);
            
            await db('chat_conversations')
              .where({ id: conversationId })
              .update({ last_message_at: new Date().toISOString() });
          } catch (dbError) {
            console.error('Failed to save chat history:', dbError);
          }
        }
        
        res.json({
          response: finalResponse,
          metadata: {
            hasContext: searchResults.length > 0
          }
        });
      }
    } else {
      res.status(500).json({ error: 'Unexpected response format' });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    console.error('Chat error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    // Return a more helpful error message
    if (error.response?.status === 401) {
      res.status(200).json({ 
        response: 'Your API key appears to be invalid. Please check your Anthropic API key in settings.',
        metadata: { action: 'api_key_invalid' }
      });
    } else {
      res.status(500).json({ 
        error: error.message || 'Failed to process chat message',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// Helper function to parse markdown to TipTap JSON format
function parseMarkdownToTipTap(markdown: string, highlight: boolean = false): any[] {
  const lines = markdown.split('\n');
  const nodes: any[] = [];
  
  for (const line of lines) {
    if (line.trim() === '') {
      continue; // Skip empty lines
    }
    
    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const textNode: any = {
        type: 'text',
        text: headingMatch[2]
      };
      if (highlight) {
        textNode.marks = [{ type: 'highlight' }];
      }
      nodes.push({
        type: 'heading',
        attrs: { level },
        content: [textNode]
      });
      continue;
    }
    
    // Bullet lists
    if (line.match(/^[\*\-]\s+/)) {
      const text = line.replace(/^[\*\-]\s+/, '');
      // For simplicity, create as paragraph with bullet prefix
      // In a real implementation, we'd group these into proper list nodes
      const bulletTextNode: any = {
        type: 'text',
        text: '• ' + text
      };
      if (highlight) {
        bulletTextNode.marks = [{ type: 'highlight' }];
      }
      nodes.push({
        type: 'paragraph',
        content: [bulletTextNode]
      });
      continue;
    }
    
    // Regular paragraphs with basic formatting
    let content: any[] = [];
    let currentText = line;
    
    // Handle bold text
    currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, text) => {
      const marks: any[] = [{ type: 'bold' }];
      if (highlight) {
        marks.push({ type: 'highlight' });
      }
      content.push({
        type: 'text',
        marks,
        text: text
      });
      return '\u0000'; // Placeholder
    });
    
    // Handle italic text
    currentText = currentText.replace(/\*(.*?)\*/g, (match, text) => {
      const marks: any[] = [{ type: 'italic' }];
      if (highlight) {
        marks.push({ type: 'highlight' });
      }
      content.push({
        type: 'text',
        marks,
        text: text
      });
      return '\u0000'; // Placeholder
    });
    
    // Add remaining text
    const parts = currentText.split('\u0000');
    let contentIndex = 0;
    const finalContent: any[] = [];
    
    for (const part of parts) {
      if (part) {
        const plainTextNode: any = {
          type: 'text',
          text: part
        };
        if (highlight) {
          plainTextNode.marks = [{ type: 'highlight' }];
        }
        finalContent.push(plainTextNode);
      }
      if (contentIndex < content.length) {
        finalContent.push(content[contentIndex]);
        contentIndex++;
      }
    }
    
    nodes.push({
      type: 'paragraph',
      content: finalContent.length > 0 ? finalContent : [
        highlight ? { type: 'text', text: line, marks: [{ type: 'highlight' }] } : { type: 'text', text: line }
      ]
    });
  }
  
  return nodes.length > 0 ? nodes : [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }];
}

// Helper function to execute actions based on chat intent
async function executeAction(action: string, parameters: any, userId: number, context: any) {
  try {
    switch (action) {
      case 'create_project':
        const newProject = await db('projects').insert({
          user_id: userId,
          title: parameters.name, // Accept 'name' parameter but save as 'title'
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
            projectName: createdProject.title 
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

      case 'create_multiple_tasks':
        const batchProjectId = parameters.projectId || context?.currentProjectId;
        if (!batchProjectId) {
          throw new Error('No project selected. Please specify a project or navigate to a project board first.');
        }

        // Verify user owns the project
        const batchProjectCheck = await db('projects')
          .where({ 
            id: batchProjectId,
            user_id: userId 
          })
          .first();
        
        if (!batchProjectCheck) {
          throw new Error('Project not found or you don\'t have access to it');
        }

        if (!parameters.tasks || !Array.isArray(parameters.tasks) || parameters.tasks.length === 0) {
          throw new Error('No tasks provided to create');
        }

        const createdTasks = [];
        
        for (const task of parameters.tasks) {
          if (!task.title) {
            throw new Error('Each task must have a title');
          }

          const maxPos = await db('tasks')
            .where({ 
              project_id: batchProjectId,
              status: task.status || 'todo' 
            })
            .max('position as max')
            .first();
          
          const newBatchTask = {
            project_id: batchProjectId,
            title: task.title,
            description: task.description || null,
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            position: (maxPos?.max || 0) + 1,
            due_date: task.due_date || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          await db('tasks').insert(newBatchTask);
          
          const created = await db('tasks')
            .where({ project_id: batchProjectId })
            .orderBy('id', 'desc')
            .first();
          
          createdTasks.push({
            id: created.id,
            title: created.title
          });
        }
        
        return {
          action: 'created_multiple_tasks',
          result: { 
            count: createdTasks.length,
            tasks: createdTasks,
            projectId: batchProjectId
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

      case 'update_page':
        if (!parameters.pageId) {
          throw new Error('No page selected. Please navigate to a notebook page first.');
        }

        // Verify user owns the page
        const pageCheck = await db('notebook_pages as p')
          .join('notebooks as n', 'p.notebook_id', 'n.id')
          .where({ 
            'p.id': parameters.pageId,
            'n.user_id': userId 
          })
          .select('p.*')
          .first();
        
        if (!pageCheck) {
          throw new Error('Page not found or you don\'t have access to it');
        }

        let newContent = parameters.content;
        
        // If append mode, get current content and append
        if (parameters.append) {
          const currentContent = JSON.parse(pageCheck.content);
          // Parse markdown content into TipTap nodes with optional highlight
          const contentNodes = parseMarkdownToTipTap(parameters.content, parameters.highlight);
          
          currentContent.content = currentContent.content || [];
          currentContent.content.push(...contentNodes);
          newContent = JSON.stringify(currentContent);
        } else if (typeof parameters.content === 'string') {
          // Replace content - parse markdown to TipTap format with optional highlight
          const contentNodes = parseMarkdownToTipTap(parameters.content, parameters.highlight);
          
          newContent = JSON.stringify({
            type: 'doc',
            content: contentNodes
          });
        }

        await db('notebook_pages')
          .where({ id: parameters.pageId })
          .update({
            content: newContent,
            ...(parameters.title ? { title: parameters.title } : {}),
            updated_at: new Date().toISOString()
          });
        
        return {
          action: 'updated_page',
          result: { 
            pageId: parameters.pageId,
            updated: true
          }
        };

      case 'create_page':
        const notebookId = parameters.notebookId || context?.currentNotebookId;
        if (!notebookId) {
          throw new Error('No notebook selected. Please specify a notebook or navigate to one first.');
        }

        // Verify user owns the notebook
        const notebookCheck = await db('notebooks')
          .where({ 
            id: notebookId,
            user_id: userId 
          })
          .first();
        
        if (!notebookCheck) {
          throw new Error('Notebook not found or you don\'t have access to it');
        }

        // Generate slug from title
        const slug = parameters.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        // Get max position
        const maxPos = await db('notebook_pages')
          .where({ notebook_id: notebookId })
          .max('position as max')
          .first();

        const newPage = {
          notebook_id: notebookId,
          folder_id: parameters.folderId || null,
          title: parameters.title,
          slug,
          content: JSON.stringify({ type: 'doc', content: [] }),
          position: (maxPos?.max || 0) + 1,
          is_starred: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await db('notebook_pages').insert(newPage);

        const createdPage = await db('notebook_pages')
          .where({ notebook_id: notebookId })
          .orderBy('id', 'desc')
          .first();

        return {
          action: 'created_page',
          result: { 
            pageId: createdPage.id,
            pageTitle: createdPage.title,
            notebookId: notebookId
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