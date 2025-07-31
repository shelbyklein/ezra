// Notebook model and database operations
import db from '../src/db';

export interface Notebook {
  id?: number;
  title: string;
  icon?: string;
  description?: string;
  user_id: number;
  project_id?: number;
  is_default?: boolean;
  position?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface NotebookWithDetails extends Notebook {
  page_count?: number;
  project_name?: string;
  project_color?: string;
}

export class NotebookModel {
  static async create(notebookData: Omit<Notebook, 'id' | 'created_at' | 'updated_at'>): Promise<Notebook> {
    const [notebook] = await db('notebooks')
      .insert(notebookData)
      .returning('*');
    
    return notebook;
  }

  static async findById(id: number): Promise<Notebook | null> {
    const notebook = await db('notebooks')
      .where({ id })
      .first();
    
    return notebook || null;
  }

  static async findByUserId(userId: number): Promise<NotebookWithDetails[]> {
    const notebooks = await db('notebooks')
      .leftJoin('projects', 'notebooks.project_id', 'projects.id')
      .where({ 'notebooks.user_id': userId })
      .select(
        'notebooks.*',
        'projects.title as project_name',
        'projects.color as project_color'
      )
      .orderBy('notebooks.position', 'asc');
    
    return notebooks;
  }

  static async findRecentByUserId(userId: number, limit: number = 3): Promise<NotebookWithDetails[]> {
    const notebooks = await db('notebooks')
      .where({ user_id: userId })
      .orderBy('updated_at', 'desc')
      .limit(limit);
    
    // Get page counts for each notebook
    const notebookIds = notebooks.map(n => n.id);
    const pageCounts = await db('notebook_pages')
      .whereIn('notebook_id', notebookIds)
      .groupBy('notebook_id')
      .select('notebook_id')
      .count('id as count');
    
    const pageCountMap = pageCounts.reduce((acc, pc) => {
      acc[pc.notebook_id] = parseInt(pc.count as string);
      return acc;
    }, {} as Record<number, number>);
    
    return notebooks.map(notebook => ({
      ...notebook,
      page_count: pageCountMap[notebook.id!] || 0
    }));
  }

  static async update(id: number, data: Partial<Notebook>): Promise<Notebook> {
    const [updatedNotebook] = await db('notebooks')
      .where({ id })
      .update(data)
      .returning('*');
    
    return updatedNotebook;
  }

  static async delete(id: number): Promise<void> {
    await db('notebooks')
      .where({ id })
      .delete();
  }

  static async verifyOwnership(notebookId: number, userId: number): Promise<boolean> {
    const notebook = await db('notebooks')
      .where({ id: notebookId, user_id: userId })
      .first();
    
    return !!notebook;
  }

  static async updatePositions(updates: { id: number; position: number }[]): Promise<void> {
    await db.transaction(async (trx) => {
      for (const update of updates) {
        await trx('notebooks')
          .where({ id: update.id })
          .update({ position: update.position });
      }
    });
  }
}