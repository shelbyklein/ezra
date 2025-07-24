/**
 * Anthropic API utilities
 */

import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
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