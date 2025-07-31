// NotebookPage model and database operations
import db from '../src/db';

export interface NotebookPage {
  id?: number;
  title: string;
  slug: string;
  content?: string;
  notebook_id: number;
  is_starred?: boolean;
  position?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface StarredPage extends NotebookPage {
  notebook_title?: string;
  notebook_icon?: string;
}

export class NotebookPageModel {
  static async create(pageData: Omit<NotebookPage, 'id' | 'created_at' | 'updated_at'>): Promise<NotebookPage> {
    const [page] = await db('notebook_pages')
      .insert(pageData)
      .returning('*');
    
    return page;
  }

  static async findById(id: number): Promise<NotebookPage | null> {
    const page = await db('notebook_pages')
      .where({ id })
      .first();
    
    return page || null;
  }

  static async findByNotebookId(notebookId: number): Promise<NotebookPage[]> {
    return db('notebook_pages')
      .where({ notebook_id: notebookId })
      .orderBy('position', 'asc');
  }

  static async findBySlug(notebookId: number, slug: string): Promise<NotebookPage | null> {
    const page = await db('notebook_pages')
      .where({ notebook_id: notebookId, slug })
      .first();
    
    return page || null;
  }

  static async findStarredByUserId(userId: number): Promise<StarredPage[]> {
    return db('notebook_pages as p')
      .join('notebooks as n', 'p.notebook_id', 'n.id')
      .where({ 
        'n.user_id': userId,
        'p.is_starred': 1  // SQLite uses 1/0 for boolean
      })
      .select(
        'p.id',
        'p.title',
        'p.slug',
        'p.updated_at',
        'p.notebook_id',
        'n.title as notebook_title',
        'n.icon as notebook_icon'
      )
      .orderBy('p.updated_at', 'desc');
  }

  static async update(id: number, data: Partial<NotebookPage>): Promise<NotebookPage> {
    const [updatedPage] = await db('notebook_pages')
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now()
      })
      .returning('*');
    
    return updatedPage;
  }

  static async delete(id: number): Promise<void> {
    await db('notebook_pages')
      .where({ id })
      .delete();
  }

  static async toggleStar(id: number): Promise<NotebookPage> {
    // First get current starred status
    const page = await db('notebook_pages')
      .where({ id })
      .first();
    
    if (!page) {
      throw new Error('Page not found');
    }
    
    // Toggle the starred status
    const [updatedPage] = await db('notebook_pages')
      .where({ id })
      .update({
        is_starred: page.is_starred ? 0 : 1,  // SQLite boolean handling
        updated_at: db.fn.now()
      })
      .returning('*');
    
    return updatedPage;
  }

  static async updatePositions(updates: { id: number; position: number }[]): Promise<void> {
    await db.transaction(async (trx) => {
      for (const update of updates) {
        await trx('notebook_pages')
          .where({ id: update.id })
          .update({ 
            position: update.position,
            updated_at: db.fn.now()
          });
      }
    });
  }

  static async verifyOwnership(pageId: number, userId: number): Promise<boolean> {
    const result = await db('notebook_pages as p')
      .join('notebooks as n', 'p.notebook_id', 'n.id')
      .where({ 'p.id': pageId, 'n.user_id': userId })
      .first();
    
    return !!result;
  }

  static async generateUniqueSlug(notebookId: number, baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.findBySlug(notebookId, slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }
}