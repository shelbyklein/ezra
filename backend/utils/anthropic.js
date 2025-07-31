"use strict";
/**
 * Anthropic API utilities
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserApiKey = getUserApiKey;
exports.createAnthropicClient = createAnthropicClient;
exports.enhanceTaskWithAI = enhanceTaskWithAI;
exports.parseNaturalLanguageCommand = parseNaturalLanguageCommand;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const crypto = __importStar(require("crypto"));
const db_1 = __importDefault(require("../src/db"));
// Decryption helpers (must match encryption in users.routes.ts)
const ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-encryption-key';
const algorithm = 'aes-256-cbc';
function decrypt(text) {
    const [ivHex, encrypted] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
async function getUserApiKey(userId) {
    const user = await (0, db_1.default)('users')
        .where({ id: userId })
        .select('anthropic_api_key')
        .first();
    if (!user || !user.anthropic_api_key) {
        return null;
    }
    return decrypt(user.anthropic_api_key);
}
async function createAnthropicClient(userId) {
    const apiKey = await getUserApiKey(userId);
    if (!apiKey) {
        return null;
    }
    return new sdk_1.default({
        apiKey,
    });
}
async function enhanceTaskWithAI(userId, taskTitle, taskDescription) {
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
    }
    catch (error) {
        console.error('Error enhancing task with AI:', error);
        throw error;
    }
}
async function parseNaturalLanguageCommand(userId, command, context) {
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
    }
    catch (error) {
        console.error('Error parsing natural language command:', error);
        throw error;
    }
}
