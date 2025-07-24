/**
 * Context search utility for AI-powered memory recall
 */

import db from '../src/db';

interface SearchResult {
  type: 'notebook_page' | 'project' | 'task';
  id: number;
  title: string;
  content: string;
  snippet: string;
  relevanceScore: number;
  metadata: {
    notebookId?: number;
    notebookTitle?: string;
    projectId?: number;
    projectName?: string;
    status?: string;
    updatedAt: string;
  };
}

interface ContextSearchOptions {
  limit?: number;
  includeArchived?: boolean;
  timeRange?: {
    start?: Date;
    end?: Date;
  };
}

/**
 * Extract keywords from a natural language query
 */
function extractKeywords(query: string): string[] {
  // Remove common stop words
  const stopWords = new Set([
    'what', 'did', 'i', 'write', 'about', 'the', 'a', 'an', 'is', 'are', 
    'was', 'were', 'my', 'have', 'has', 'had', 'do', 'does', 'did',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from'
  ]);
  
  // Split into words and filter
  const words = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  return [...new Set(words)]; // Remove duplicates
}

/**
 * Calculate relevance score based on keyword matches
 */
function calculateRelevance(text: string, keywords: string[]): number {
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
function extractSnippet(text: string, keywords: string[], maxLength: number = 200): string {
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
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return snippet;
}

/**
 * Search notebook pages for relevant content
 */
async function searchNotebookPages(
  keywords: string[], 
  userId: number,
  options: ContextSearchOptions
): Promise<SearchResult[]> {
  try {
    // Build search query
    let query = db('notebook_pages as p')
      .join('notebooks as n', 'p.notebook_id', 'n.id')
      .where('n.user_id', userId)
      .select(
        'p.id',
        'p.title',
        'p.content',
        'p.updated_at',
        'n.id as notebook_id',
        'n.title as notebook_title'
      );
    
    // Add time range filter if specified
    if (options.timeRange?.start) {
      query = query.where('p.updated_at', '>=', options.timeRange.start);
    }
    if (options.timeRange?.end) {
      query = query.where('p.updated_at', '<=', options.timeRange.end);
    }
    
    const pages = await query;
    
    // Process and score results
    const results: SearchResult[] = [];
    
    for (const page of pages) {
      // Parse TipTap JSON content to text
      let textContent = '';
      try {
        const contentObj = JSON.parse(page.content);
        textContent = extractTextFromTipTap(contentObj);
      } catch (e) {
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
  } catch (error) {
    console.error('Error searching notebook pages:', error);
    return [];
  }
}

/**
 * Extract plain text from TipTap JSON content
 */
export function extractTextFromTipTap(content: any): string {
  if (!content || typeof content !== 'object') return '';
  
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
async function searchProjects(
  keywords: string[], 
  userId: number,
  options: ContextSearchOptions
): Promise<SearchResult[]> {
  try {
    let query = db('projects')
      .where('user_id', userId)
      .select('id', 'name', 'description', 'updated_at');
    
    if (!options.includeArchived) {
      query = query.where('archived', false);
    }
    
    const projects = await query;
    const results: SearchResult[] = [];
    
    for (const project of projects) {
      const fullText = `${project.name} ${project.description || ''}`;
      const relevanceScore = calculateRelevance(fullText, keywords);
      
      if (relevanceScore > 0) {
        results.push({
          type: 'project',
          id: project.id,
          title: project.name,
          content: project.description || '',
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
  } catch (error) {
    console.error('Error searching projects:', error);
    return [];
  }
}

/**
 * Search tasks for relevant content
 */
async function searchTasks(
  keywords: string[], 
  userId: number,
  options: ContextSearchOptions
): Promise<SearchResult[]> {
  try {
    let query = db('tasks as t')
      .join('projects as p', 't.project_id', 'p.id')
      .where('p.user_id', userId)
      .select(
        't.id',
        't.title',
        't.description',
        't.status',
        't.updated_at',
        'p.id as project_id',
        'p.name as project_name'
      );
    
    if (options.timeRange?.start) {
      query = query.where('t.updated_at', '>=', options.timeRange.start);
    }
    if (options.timeRange?.end) {
      query = query.where('t.updated_at', '<=', options.timeRange.end);
    }
    
    const tasks = await query;
    const results: SearchResult[] = [];
    
    for (const task of tasks) {
      const fullText = `${task.title} ${task.description || ''}`;
      const relevanceScore = calculateRelevance(fullText, keywords);
      
      if (relevanceScore > 0) {
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          content: task.description || '',
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
  } catch (error) {
    console.error('Error searching tasks:', error);
    return [];
  }
}

/**
 * Main function to search across all content types
 */
export async function searchUserContent(
  query: string,
  userId: number,
  options: ContextSearchOptions = {}
): Promise<SearchResult[]> {
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
export function formatContextForAI(results: SearchResult[]): string {
  if (results.length === 0) {
    return '';
  }
  
  let context = 'Found relevant information from your knowledge base:\n\n';
  
  const groupedResults: { [key: string]: SearchResult[] } = {};
  
  // Group by type
  for (const result of results) {
    const key = result.type;
    if (!groupedResults[key]) {
      groupedResults[key] = [];
    }
    groupedResults[key].push(result);
  }
  
  // Format each group
  if (groupedResults.notebook_page) {
    context += '### From your notebooks:\n';
    for (const result of groupedResults.notebook_page) {
      context += `- **${result.title}** (in "${result.metadata.notebookTitle}"): ${result.snippet}\n`;
    }
    context += '\n';
  }
  
  if (groupedResults.project) {
    context += '### From your projects:\n';
    for (const result of groupedResults.project) {
      context += `- **${result.title}**: ${result.snippet}\n`;
    }
    context += '\n';
  }
  
  if (groupedResults.task) {
    context += '### From your tasks:\n';
    for (const result of groupedResults.task) {
      context += `- **${result.title}** (${result.metadata.status} in "${result.metadata.projectName}"): ${result.snippet}\n`;
    }
    context += '\n';
  }
  
  return context;
}

/**
 * Generate source citations for AI responses
 */
export function generateSourceCitations(results: SearchResult[]): string {
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