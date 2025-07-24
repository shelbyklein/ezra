/**
 * Anthropic API utilities
 */

import Anthropic from '@anthropic-ai/sdk';
import * as crypto from 'crypto';
import db from '../src/db';

// Decryption helpers (must match encryption in users.routes.ts)
const ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-encryption-key';
const algorithm = 'aes-256-cbc';

function decrypt(text: string): string {
  const [ivHex, encrypted] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function getUserApiKey(userId: number): Promise<string | null> {
  const user = await db('users')
    .where({ id: userId })
    .select('anthropic_api_key')
    .first();

  if (!user || !user.anthropic_api_key) {
    return null;
  }

  return decrypt(user.anthropic_api_key);
}

export async function createAnthropicClient(userId: number): Promise<Anthropic | null> {
  const apiKey = await getUserApiKey(userId);
  
  if (!apiKey) {
    return null;
  }

  return new Anthropic({
    apiKey,
  });
}

export interface TaskEnhancement {
  title?: string;
  description?: string;
  subtasks?: string[];
  priority?: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  tags?: string[];
}

export interface NaturalLanguageCommand {
  action: 'create' | 'update' | 'delete' | 'move' | 'query' | 'bulk';
  taskData?: {
    title?: string;
    description?: string;
    status?: 'todo' | 'in_progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    due_date?: string;
    tags?: string[];
  };
  targetTasks?: {
    taskIds?: number[];
    filter?: {
      status?: string;
      priority?: string;
      overdue?: boolean;
      tags?: string[];
    };
  };
  updates?: Partial<NaturalLanguageCommand['taskData']>;
}

export async function enhanceTaskWithAI(
  userId: number,
  taskTitle: string,
  taskDescription?: string
): Promise<TaskEnhancement | null> {
  const client = await createAnthropicClient(userId);
  
  if (!client) {
    throw new Error('No API key configured');
  }

  try {
    const prompt = `You are a project management assistant. Given a task title and optional description, provide enhancements to make it more actionable and complete.

Task Title: ${taskTitle}
${taskDescription ? `Task Description: ${taskDescription}` : ''}

Please provide a JSON response with the following structure:
{
  "title": "Enhanced task title (if needed)",
  "description": "A clear, actionable description of the task",
  "subtasks": ["List of subtasks if the task can be broken down"],
  "priority": "low, medium, or high",
  "estimatedTime": "Estimated time to complete (e.g., '2 hours', '1 day')",
  "tags": ["Relevant tags for categorization"]
}

Focus on making the task specific, measurable, achievable, relevant, and time-bound (SMART).`;

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
      // Extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return null;
  } catch (error) {
    console.error('Error enhancing task with AI:', error);
    throw error;
  }
}

export async function parseNaturalLanguageCommand(
  userId: number,
  command: string,
  context?: {
    projectId?: number;
    currentTasks?: Array<{ id: number; title: string; status: string }>;
  }
): Promise<NaturalLanguageCommand | null> {
  const client = await createAnthropicClient(userId);
  
  if (!client) {
    throw new Error('No API key configured');
  }

  try {
    const prompt = `You are a project management assistant. Parse the following natural language command into a structured format.

Command: "${command}"

${context?.currentTasks ? `Current tasks in the project:
${context.currentTasks.map(t => `- [ID: ${t.id}] ${t.title} (${t.status})`).join('\n')}` : ''}

Parse the command and return a JSON object with this structure:
{
  "action": "create|update|delete|move|query|bulk",
  "taskData": {
    "title": "task title if creating",
    "description": "task description if provided",
    "status": "todo|in_progress|done",
    "priority": "low|medium|high",
    "due_date": "YYYY-MM-DD format",
    "tags": ["tag1", "tag2"]
  },
  "targetTasks": {
    "taskIds": [1, 2, 3],
    "filter": {
      "status": "status to filter by",
      "priority": "priority to filter by",
      "overdue": true/false,
      "tags": ["tags to filter by"]
    }
  },
  "updates": {
    // same structure as taskData for updates
  }
}

Examples:
- "Create a task to review the design mockups by Friday" → action: "create" with taskData
- "Move task 5 to done" → action: "update" with targetTasks.taskIds and updates.status
- "Set all high priority tasks to in progress" → action: "bulk" with filter and updates
- "Delete the authentication task" → action: "delete" with taskIds based on title match

For dates, convert relative dates (tomorrow, next week, Friday) to YYYY-MM-DD format based on today's date.
Only include fields that are explicitly mentioned or clearly implied in the command.`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing natural language command:', error);
    throw error;
  }
}