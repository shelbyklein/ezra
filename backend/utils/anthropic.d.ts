/**
 * Anthropic API utilities
 */
import Anthropic from '@anthropic-ai/sdk';
export declare function getUserApiKey(userId: number): Promise<string | null>;
export declare function createAnthropicClient(userId: number): Promise<Anthropic | null>;
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
export declare function enhanceTaskWithAI(userId: number, taskTitle: string, taskDescription?: string): Promise<TaskEnhancement | null>;
export declare function parseNaturalLanguageCommand(userId: number, command: string, context?: {
    projectId?: number;
    currentTasks?: Array<{
        id: number;
        title: string;
        status: string;
    }>;
}): Promise<NaturalLanguageCommand | null>;
//# sourceMappingURL=anthropic.d.ts.map