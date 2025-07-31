"use strict";
/**
 * Context search utility for AI-powered memory recall
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromTipTap = extractTextFromTipTap;
exports.searchUserContent = searchUserContent;
exports.formatContextForAI = formatContextForAI;
exports.generateSourceCitations = generateSourceCitations;
const db_1 = __importDefault(require("../src/db"));
/**
 * Extract keywords from a natural language query
 */
function extractKeywords(query) {
    // Remove common stop words but keep important ones like "my"
    const stopWords = new Set([
        'what', 'did', 'i', 'write', 'about', 'the', 'a', 'an', 'is', 'are',
        'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did',
        'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
        'can', 'you', 'find', 'show', 'tell', 'me', 'please'
    ]);
    // First, look for quoted strings or specific references
    const quotedMatches = query.match(/"([^"]+)"/g) || [];
    const quotedKeywords = quotedMatches.map(match => match.replace(/"/g, ''));
    // Also look for camelCase or snake_case identifiers
    const identifierMatches = query.match(/\b[a-zA-Z][a-zA-Z0-9_]*[A-Z][a-zA-Z0-9_]*\b/g) || [];
    const snakeMatches = query.match(/\b[a-z]+_[a-z0-9_]+\b/g) || [];
    // Split into words and filter
    const words = query.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));
    // Combine all keywords, preserving original case for identifiers
    const allKeywords = [
        ...quotedKeywords,
        ...identifierMatches,
        ...snakeMatches,
        ...words
    ];
    return [...new Set(allKeywords)]; // Remove duplicates
}
/**
 * Calculate relevance score based on keyword matches
 */
function calculateRelevance(text, keywords) {
    const lowerText = text.toLowerCase();
    let score = 0;
    for (const keyword of keywords) {
        // Exact word match
        const exactMatches = (lowerText.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        score += exactMatches * 3;
        // Partial match
        const partialMatches = (lowerText.match(new RegExp(keyword, 'g')) || []).length - exactMatches;
        score += partialMatches * 1;
    }
    // Boost score for title matches
    return score;
}
/**
 * Extract a relevant snippet around keyword matches
 */
function extractSnippet(text, keywords, maxLength = 200) {
    const lowerText = text.toLowerCase();
    let bestStart = 0;
    let bestScore = 0;
    // Find the best starting position based on keyword density
    for (let i = 0; i < text.length - maxLength; i += 50) {
        const snippet = lowerText.substring(i, i + maxLength);
        let score = 0;
        for (const keyword of keywords) {
            score += (snippet.match(new RegExp(keyword, 'g')) || []).length;
        }
        if (score > bestScore) {
            bestScore = score;
            bestStart = i;
        }
    }
    // Extract snippet with word boundaries
    const start = text.lastIndexOf(' ', bestStart) + 1 || bestStart;
    const end = text.indexOf(' ', bestStart + maxLength) || bestStart + maxLength;
    let snippet = text.substring(start, end);
    if (start > 0)
        snippet = '...' + snippet;
    if (end < text.length)
        snippet = snippet + '...';
    return snippet;
}
/**
 * Search notebook pages for relevant content
 */
async function searchNotebookPages(keywords, userId, options) {
    try {
        // Build search query
        let query = (0, db_1.default)('notebook_pages as p')
            .join('notebooks as n', 'p.notebook_id', 'n.id')
            .where('n.user_id', userId)
            .select('p.id', 'p.title', 'p.content', 'p.updated_at', 'n.id as notebook_id', 'n.title as notebook_title');
        // Add time range filter if specified
        if (options.timeRange?.start) {
            query = query.where('p.updated_at', '>=', options.timeRange.start);
        }
        if (options.timeRange?.end) {
            query = query.where('p.updated_at', '<=', options.timeRange.end);
        }
        const pages = await query;
        // Process and score results
        const results = [];
        for (const page of pages) {
            // Parse TipTap JSON content to text
            let textContent = '';
            try {
                const contentObj = JSON.parse(page.content);
                textContent = extractTextFromTipTap(contentObj);
            }
            catch (e) {
                textContent = page.content; // Fallback to raw content
            }
            const fullText = `${page.title} ${textContent}`;
            const relevanceScore = calculateRelevance(fullText, keywords);
            if (relevanceScore > 0) {
                results.push({
                    type: 'notebook_page',
                    id: page.id,
                    title: page.title,
                    content: textContent,
                    fullContent: textContent, // Include full content
                    snippet: extractSnippet(textContent, keywords),
                    relevanceScore: relevanceScore + (calculateRelevance(page.title, keywords) * 2), // Boost title matches
                    metadata: {
                        notebookId: page.notebook_id,
                        notebookTitle: page.notebook_title,
                        updatedAt: page.updated_at
                    }
                });
            }
        }
        return results;
    }
    catch (error) {
        console.error('Error searching notebook pages:', error);
        return [];
    }
}
/**
 * Extract plain text from TipTap JSON content
 */
function extractTextFromTipTap(content) {
    if (!content || typeof content !== 'object')
        return '';
    let text = '';
    if (content.text) {
        text += content.text + ' ';
    }
    if (content.content && Array.isArray(content.content)) {
        for (const node of content.content) {
            text += extractTextFromTipTap(node);
        }
    }
    return text;
}
/**
 * Search projects for relevant content
 */
async function searchProjects(keywords, userId, options) {
    try {
        let query = (0, db_1.default)('projects')
            .where('user_id', userId)
            .select('id', 'name', 'description', 'updated_at');
        if (!options.includeArchived) {
            query = query.where('archived', false);
        }
        const projects = await query;
        const results = [];
        for (const project of projects) {
            const fullText = `${project.name} ${project.description || ''}`;
            const relevanceScore = calculateRelevance(fullText, keywords);
            if (relevanceScore > 0) {
                results.push({
                    type: 'project',
                    id: project.id,
                    title: project.name,
                    content: project.description || '',
                    fullContent: project.description || project.name,
                    snippet: extractSnippet(project.description || project.name, keywords),
                    relevanceScore: relevanceScore + (calculateRelevance(project.name, keywords) * 2),
                    metadata: {
                        projectId: project.id,
                        projectName: project.name,
                        updatedAt: project.updated_at
                    }
                });
            }
        }
        return results;
    }
    catch (error) {
        console.error('Error searching projects:', error);
        return [];
    }
}
/**
 * Search tasks for relevant content
 */
async function searchTasks(keywords, userId, options) {
    try {
        let query = (0, db_1.default)('tasks as t')
            .join('projects as p', 't.project_id', 'p.id')
            .where('p.user_id', userId)
            .select('t.id', 't.title', 't.description', 't.status', 't.updated_at', 'p.id as project_id', 'p.name as project_name');
        if (options.timeRange?.start) {
            query = query.where('t.updated_at', '>=', options.timeRange.start);
        }
        if (options.timeRange?.end) {
            query = query.where('t.updated_at', '<=', options.timeRange.end);
        }
        const tasks = await query;
        const results = [];
        for (const task of tasks) {
            const fullText = `${task.title} ${task.description || ''}`;
            const relevanceScore = calculateRelevance(fullText, keywords);
            if (relevanceScore > 0) {
                results.push({
                    type: 'task',
                    id: task.id,
                    title: task.title,
                    content: task.description || '',
                    fullContent: `${task.title}${task.description ? ': ' + task.description : ''}`,
                    snippet: extractSnippet(task.description || task.title, keywords),
                    relevanceScore: relevanceScore + (calculateRelevance(task.title, keywords) * 2),
                    metadata: {
                        projectId: task.project_id,
                        projectName: task.project_name,
                        status: task.status,
                        updatedAt: task.updated_at
                    }
                });
            }
        }
        return results;
    }
    catch (error) {
        console.error('Error searching tasks:', error);
        return [];
    }
}
/**
 * Main function to search across all content types
 */
async function searchUserContent(query, userId, options = {}) {
    const keywords = extractKeywords(query);
    if (keywords.length === 0) {
        return [];
    }
    // Search across all content types in parallel
    const [pageResults, projectResults, taskResults] = await Promise.all([
        searchNotebookPages(keywords, userId, options),
        searchProjects(keywords, userId, options),
        searchTasks(keywords, userId, options)
    ]);
    // Combine and sort by relevance
    const allResults = [...pageResults, ...projectResults, ...taskResults];
    allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    // Apply limit if specified
    const limit = options.limit || 10;
    return allResults.slice(0, limit);
}
/**
 * Format search results for AI consumption
 */
function formatContextForAI(results) {
    if (results.length === 0) {
        return '';
    }
    let context = 'Found relevant information from your knowledge base. Here is the FULL CONTENT of the matching items:\n\n';
    // Include full content for the AI to parse
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        context += `---\n`;
        context += `[RESULT ${i + 1}]\n`;
        switch (result.type) {
            case 'notebook_page':
                context += `Type: Notebook Page\n`;
                context += `Title: ${result.title}\n`;
                context += `Notebook: ${result.metadata.notebookTitle}\n`;
                context += `Full Content:\n${result.fullContent}\n`;
                break;
            case 'project':
                context += `Type: Project\n`;
                context += `Name: ${result.title}\n`;
                context += `Description: ${result.fullContent}\n`;
                break;
            case 'task':
                context += `Type: Task\n`;
                context += `Title: ${result.title}\n`;
                context += `Status: ${result.metadata.status}\n`;
                context += `Project: ${result.metadata.projectName}\n`;
                context += `Content: ${result.fullContent}\n`;
                break;
        }
        context += `---\n\n`;
    }
    return context;
}
/**
 * Generate source citations for AI responses
 */
function generateSourceCitations(results) {
    if (results.length === 0) {
        return '';
    }
    let citations = '\n\n**Sources:**\n';
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        let citation = `[${i + 1}] `;
        switch (result.type) {
            case 'notebook_page':
                citation += `"${result.title}" in ${result.metadata.notebookTitle} notebook`;
                break;
            case 'project':
                citation += `Project: "${result.title}"`;
                break;
            case 'task':
                citation += `Task: "${result.title}" in ${result.metadata.projectName}`;
                break;
        }
        citations += citation + '\n';
    }
    return citations;
}
//# sourceMappingURL=contextSearch.js.map