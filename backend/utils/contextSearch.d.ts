/**
 * Context search utility for AI-powered memory recall
 */
interface SearchResult {
    type: 'notebook_page' | 'project' | 'task';
    id: number;
    title: string;
    content: string;
    fullContent: string;
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
 * Extract plain text from TipTap JSON content
 */
export declare function extractTextFromTipTap(content: any): string;
/**
 * Main function to search across all content types
 */
export declare function searchUserContent(query: string, userId: number, options?: ContextSearchOptions): Promise<SearchResult[]>;
/**
 * Format search results for AI consumption
 */
export declare function formatContextForAI(results: SearchResult[]): string;
/**
 * Generate source citations for AI responses
 */
export declare function generateSourceCitations(results: SearchResult[]): string;
export {};
//# sourceMappingURL=contextSearch.d.ts.map