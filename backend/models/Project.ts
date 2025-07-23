// Project model and database operations
import db from '../src/db';

export interface Project {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  user_id: number;
  is_archived?: boolean;
  position?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class ProjectModel {
  static async create(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const [project] = await db('projects')
      .insert(projectData)
      .returning('*');
    
    return project;
  }

  static async findById(id: number): Promise<Project | null> {
    const project = await db('projects')
      .where({ id })
      .first();
    
    return project || null;
  }

  static async findByUserId(userId: number, includeArchived = false): Promise<Project[]> {
    let query = db('projects').where({ user_id: userId });
    
    if (!includeArchived) {
      query = query.where({ is_archived: false });
    }
    
    return query.orderBy('position', 'asc');
  }

  static async update(id: number, data: Partial<Project>): Promise<Project> {
    const [updatedProject] = await db('projects')
      .where({ id })
      .update(data)
      .returning('*');
    
    return updatedProject;
  }

  static async delete(id: number): Promise<void> {
    await db('projects')
      .where({ id })
      .delete();
  }

  static async verifyOwnership(projectId: number, userId: number): Promise<boolean> {
    const project = await db('projects')
      .where({ id: projectId, user_id: userId })
      .first();
    
    return !!project;
  }
}